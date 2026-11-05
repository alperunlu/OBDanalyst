/**
 * Freeze frame (Mode 02) — arıza kodu oluştuğu anda ECU'nun sakladığı veri.
 *
 * Teşhisteki değeri: "P0171 fakir karışım" tek başına bir şey söylemez;
 * rölantide mi yükte mi, motor soğukken mi sıcakken mi oluştuğu söyler.
 * Freeze frame tam olarak bunu saklıyor.
 *
 * Veri baytları Mode 01 ile aynı biçimde; çözücüler `pids.ts`'ten geliyor.
 * Cevap biçimi farklı: `42 PP FF <veri>` — mod baytı 0x42, PID, kare no.
 *
 * Çözme saf, okuma `send` üzerinden: cihazsız test edilebilir.
 */

import { splitResponseLines } from './elm327';
import { decodeDtcBytes } from './dtc';
import { getPidDefinition, isPidSupported, type SupportedPidMap } from './pids';

export interface FreezeFrameValue {
  readonly pid: string;
  readonly name: string;
  readonly value: number;
  readonly unit: string;
}

export interface FreezeFrame {
  /** Kareyi tetikleyen kod. */
  readonly dtc: string;
  /** Yakıt sisteminin döngü durumu (PID 03), okunabildiyse. */
  readonly fuelSystem: string | null;
  readonly values: readonly FreezeFrameValue[];
}

/**
 * Okunan PID'ler ve sıraları: önce koşulu tanımlayanlar (devir, hız,
 * sıcaklık, yük), sonra karışım, en son hava yolu. Ekranda bu sırayla
 * okunuyor.
 */
const FRAME_PIDS = ['0C', '0D', '05', '04', '06', '07', '0B', '0F', '10', '11', '0E'] as const;

/** `42 PP 00 ...` cevabından veri hex'i; eşleşme yoksa boş. */
export function extractFreezeFrameHex(raw: string, pid: string): string {
  const wanted = `42${pid.toUpperCase()}`;
  for (const line of splitResponseLines(raw)) {
    const hex = line.replace(/\s/g, '').toUpperCase();
    if (!/^[0-9A-F]+$/.test(hex) || !hex.startsWith(wanted)) continue;
    // Mod + PID + kare numarası = 6 hane.
    return hex.slice(6);
  }
  return '';
}

function bytesOf(hex: string): number[] {
  const out: number[] = [];
  for (let i = 0; i + 1 < hex.length; i += 2) out.push(parseInt(hex.slice(i, i + 2), 16));
  return out;
}

/** `020200` cevabı: kareyi tetikleyen kod; `0000` "kare yok" demek. */
export function parseFreezeFrameDtc(raw: string): string | null {
  const b = bytesOf(extractFreezeFrameHex(raw, '02'));
  if (b.length < 2 || (b[0] === 0 && b[1] === 0)) return null;
  return decodeDtcBytes(b[0], b[1]);
}

/**
 * PID 03 — yakıt sistemi durumu, ilk sistemin baytı (SAE J1979).
 * Açık döngüde ECU lambda sondasını dinlemiyor; trim değerleri o anda
 * anlamını yitiriyor ve bunu bilmek trimi okumanın ön şartı.
 */
export function describeFuelSystem(byte: number): string | null {
  switch (byte) {
    case 0x01:
      return 'Open loop — engine not warm yet';
    case 0x02:
      return 'Closed loop — using the oxygen sensor';
    case 0x04:
      return 'Open loop — engine load or deceleration';
    case 0x08:
      return 'Open loop — system fault';
    case 0x10:
      return 'Closed loop — with a fault in at least one oxygen sensor';
    default:
      return null;
  }
}

/** Bir PID'in cevabını değere çevirir; veri eksikse `null`. */
export function decodeFreezeFrameValue(raw: string, pid: string): FreezeFrameValue | null {
  const def = getPidDefinition(pid);
  if (!def) return null;
  const b = bytesOf(extractFreezeFrameHex(raw, pid));
  if (b.length < def.bytes) return null;
  const value = def.decode(b.slice(0, def.bytes));
  if (!Number.isFinite(value)) return null;
  return { pid: def.pid, name: def.name, value, unit: def.unit };
}

/**
 * Freeze frame'i okur. Kare yoksa ya da ECU Mode 02'yi desteklemiyorsa
 * `null` — hata değil, çoğu zaman sadece "saklanmış bir kare yok".
 *
 * Desteklenen PID haritası ŞART: haritasız her PID'i sormak, desteklemeyen
 * bir K-line ECU'sunda her biri için zaman aşımı beklemek demek.
 * `isPidSupported` bilgi yokken `true` dönüyor; burada blok yoksa sorulmuyor.
 */
export async function readFreezeFrame(
  send: (command: string) => Promise<string>,
): Promise<FreezeFrame | null> {
  const ask = async (pid: string): Promise<string> => {
    try {
      return await send(`02${pid}00`);
    } catch {
      return '';
    }
  };

  const dtc = parseFreezeFrameDtc(await ask('02'));
  if (dtc === null) return null;

  const block00 = extractFreezeFrameHex(await ask('00'), '00').slice(0, 8);
  if (block00.length < 8) return { dtc, fuelSystem: null, values: [] };
  let mask: SupportedPidMap = { block00 };
  if (isPidSupported('20', mask)) {
    const block20 = extractFreezeFrameHex(await ask('20'), '20').slice(0, 8);
    if (block20.length === 8) mask = { block00, block20 };
  }
  const supported = (pid: string): boolean => {
    const n = parseInt(pid, 16);
    if (n > 0x20 && !mask.block20) return false;
    return isPidSupported(pid, mask);
  };

  let fuelSystem: string | null = null;
  if (supported('03')) {
    const b = bytesOf(extractFreezeFrameHex(await ask('03'), '03'));
    if (b.length >= 1) fuelSystem = describeFuelSystem(b[0]);
  }

  const values: FreezeFrameValue[] = [];
  for (const pid of FRAME_PIDS) {
    if (!supported(pid)) continue;
    const v = decodeFreezeFrameValue(await ask(pid), pid);
    if (v) values.push(v);
  }

  return { dtc, fuelSystem, values };
}

/** Kısa metin satırı: "Engine RPM 2450 rpm · Vehicle Speed 62 km/h · ...". */
export function formatFreezeFrameValue(v: FreezeFrameValue): string {
  const decimals = v.unit === '%' && Math.abs(v.value) < 100 ? 1 : 0;
  return `${v.name} ${v.value.toFixed(decimals)} ${v.unit}`;
}
