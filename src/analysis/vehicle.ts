/**
 * Araç profili — türetilmiş metriklerin dayandığı fiziksel sabitler.
 *
 * İki profil var:
 *
 *   - GENERIC_VEHICLE (varsayılan): hiçbir araca ait sayı içermez. Eşikler
 *     çoğu benzinli araçta geçerli geniş aralıklar; kütle, motor hacmi,
 *     aerodinamik ve fabrika lastiği BİLİNMİYOR (`null`), dolayısıyla onlara
 *     dayanan güç/tork/hava kütlesi tahminleri yapılmıyor. Uydurma bir sayıyla
 *     hesap yapmaktansa hesap yapmamak.
 *   - MINI_R50: MINI Cooper R50 (W10B16, 2001-2006) için yayımlanmış tipik
 *     spesifikasyonlar. Kütle sürücü + yakıt dahil tahmindir ve tork/güç
 *     tahmininin doğruluğunu doğrudan etkiler.
 *
 * Profil kullanıcıya sorulmuyor: VIN'den çıkarılıyor (`profileForVin`).
 * Uygulama mağazada herkese açık; MINI'ye ait eşikleri ve arıza kodu
 * açıklamalarını başka bir araca uygulamak yanlış teşhis demekti.
 */

import { decodeVin } from '../obd/vin';

/** Lastik ebadı — aracın verisi olduğu için profil dosyasında tanımlı. */
export interface TyreSize {
  /** Kesit genişliği (mm), ör. 175. */
  readonly widthMm: number;
  /** Yanak oranı (%), ör. 65. */
  readonly aspectRatio: number;
  /** Jant çapı (inç), ör. 15. */
  readonly rimInch: number;
}

export type VehicleProfileId = 'generic' | 'mini_r50';

/**
 * Araca ait fizik verisi. Bilinmeyen bir araçta bunların hiçbiri tahmin
 * edilmiyor — profilde `physics: null` duruyor ve ona dayanan hesaplar
 * `null` dönüyor.
 */
export interface VehiclePhysics {
  /** Motor hacmi (litre). */
  readonly displacementL: number;
  /** Sürücü + yakıt dahil çalışma kütlesi (kg). */
  readonly massKg: number;
  /** Aerodinamik sürükleme katsayısı. */
  readonly dragCoefficient: number;
  /** Alından görünen kesit alanı (m²). */
  readonly frontalAreaM2: number;
  /** Yuvarlanma direnci katsayısı (asfalt, normal lastik). */
  readonly rollingResistance: number;
}

export interface VehicleProfile {
  readonly id: VehicleProfileId;
  readonly name: string;
  /** Kütle, motor hacmi, aerodinamik — bilinmiyorsa `null`. */
  readonly physics: VehiclePhysics | null;
  /**
   * Rölanti devri (RPM). Mutlak bir hedef olarak değil, "bu örnek rölantide
   * mi" kapısı olarak kullanılıyor (eşik bunun 1.4-1.6 katı).
   */
  readonly idleRpm: number;
  /** Termostatın açması beklenen sıcaklık (°C). */
  readonly thermostatOpenC: number;
  /** Normal çalışma sıcaklığı (°C). */
  readonly normalCoolantC: number;
  /**
   * Motor çalışırken AKÜ UÇLARINDA beklenen gerilim bandı (V).
   *
   * Araca ait: sabit regülatörlü eski sistemlerle, şarjı bilerek kısan
   * modern "akıllı" alternatörlerin bantları aynı değil. R50 (2001-2006)
   * sabit regülatörlü — Valeo regülatörünün ayar noktası ~14.5 V.
   */
  readonly chargingVoltageV: { readonly min: number; readonly max: number };
  /**
   * ECU'nun hız/mesafe hesabında varsaydığı FABRİKA lastik ebadı.
   * Araca ait sabit bir değer; kullanıcı değiştirmez. Bilinmeyen araçta
   * `null` — o zaman hız düzeltmesi yapılmaz (bkz. `ecuTyre`).
   */
  readonly factoryTyre: TyreSize | null;
  /**
   * Fiilen takılı lastik. R50'de varsayılan fabrika ebadı; jenerik araçta
   * kullanıcı seçene kadar `null`. Aktarma oranı, tork tahmini ve yuvarlanma
   * çevresi kontrolleri bu değere dayanır.
   */
  readonly fittedTyre: TyreSize | null;
}

/**
 * Bilinmeyen araç. Eşikler bilinçli olarak geniş: yanlış alarm, kaçırılan
 * bir sinyalden daha zararlı, çünkü kullanıcıyı uygulamaya güvenmemeye
 * alıştırıyor.
 */
export const GENERIC_VEHICLE: VehicleProfile = {
  id: 'generic',
  name: 'Generic OBD-II vehicle',
  physics: null,
  // Yalnızca "rölantide mi" kapısı: 800 × 1.6 = 1280 rpm, çoğu benzinlinin
  // sıcak ve soğuk rölantisini kapsıyor.
  idleRpm: 800,
  // Termostatlar 80-95 °C arası açıyor; en düşüğü alınıyor ki "hiç ısınmadı"
  // bulgusu yalnızca gerçekten ısınmayan motorda çıksın.
  thermostatOpenC: 80,
  normalCoolantC: 90,
  // Akıllı alternatörler aküyü dolu görünce şarjı ~12.8 V'a kadar kısıyor;
  // alt sınır bunun altı. Üst sınır aşırı şarjın başladığı yer.
  chargingVoltageV: { min: 12.8, max: 15.0 },
  factoryTyre: null,
  fittedTyre: null,
};

/** MINI Cooper R50 (2001-2006, W10B16 1.6L). */
export const MINI_R50: VehicleProfile = {
  id: 'mini_r50',
  name: 'MINI Cooper R50 (2001-2006)',
  physics: {
    displacementL: 1.598,
    massKg: 1215, // ~1140 kg boş + sürücü + yakıt
    dragCoefficient: 0.35,
    frontalAreaM2: 1.97,
    rollingResistance: 0.013,
  },
  idleRpm: 850,
  thermostatOpenC: 88,
  normalCoolantC: 95,
  // Üretici/servis kaynakları: motor çalışırken 13.5-14.8 V, ayar ~14.5 V.
  chargingVoltageV: { min: 13.5, max: 14.8 },
  // R50 Cooper'ın standart ebadı. Kullanıcı farklı bir ebat taktıysa
  // `fittedTyre` ayarlardan güncellenir; fabrika değeri sabit kalır çünkü
  // ECU'nun hız hesabı ona göre kalibre edilmiştir.
  factoryTyre: { widthMm: 175, aspectRatio: 65, rimInch: 15 },
  fittedTyre: { widthMm: 175, aspectRatio: 65, rimInch: 15 },
};

export const VEHICLE_PROFILES: Readonly<Record<VehicleProfileId, VehicleProfile>> = {
  generic: GENERIC_VEHICLE,
  mini_r50: MINI_R50,
};

/**
 * Profil + kullanıcının seçtiği lastik. Seçim yoksa profilin fabrika ebadı
 * (jenerikte o da yok, `null` kalır).
 */
export function vehicleFor(id: VehicleProfileId, fittedTyre: TyreSize | null): VehicleProfile {
  const base = VEHICLE_PROFILES[id];
  return { ...base, fittedTyre: fittedTyre ?? base.factoryTyre };
}

/**
 * VIN'den profil.
 *
 * MINI'nin WMI'si (WMW) ve 2001-2006 model yılı → R50. R50, R52 (cabrio) ve
 * R53 (Cooper S) aynı nesil; arıza kodu tablosu ve eşikler bu nesil için.
 * 2007 ve sonrası (R56) farklı motor ve ECU — jenerik kalıyor. VIN yoksa
 * ya da okunamadıysa `null`: karar çağırana kalıyor (son bilinen profil).
 */
export function profileForVin(vin: string | null): VehicleProfileId | null {
  if (!vin) return null;
  const info = decodeVin(vin);
  if (!info) return null;
  if (info.wmi === 'WMW' && info.modelYear !== null && info.modelYear >= 2001 && info.modelYear <= 2006) {
    return 'mini_r50';
  }
  return 'generic';
}

/**
 * ECU'nun hızı hesaplarken varsaydığı ebat. Fabrika ebadı bilinmiyorsa
 * takılı ebadın fabrika ebadı olduğu varsayılıyor (çoğu araç orijinal
 * ebatla geziyor) — bu durumda hız düzeltmesi yapılmamış olur.
 */
export function ecuTyre(v: VehicleProfile): TyreSize | null {
  return v.factoryTyre ?? v.fittedTyre;
}

/** Standart fiziksel sabitler. */
export const PHYSICS = {
  /** Yerçekimi ivmesi (m/s²). */
  g: 9.80665,
  /** Kuru hava özgül gaz sabiti (J/(kg·K)). */
  airGasConstant: 287.05,
  /** Deniz seviyesinde hava yoğunluğu (kg/m³). */
  airDensitySeaLevel: 1.225,
  /** Benzin için stokiyometrik hava/yakıt oranı. */
  stoichiometricAfr: 14.7,
  /** Benzin yoğunluğu (g/L). */
  gasolineDensityGPerL: 745,
} as const;

/**
 * Profilin getirdiği ve türetilmiş sonuçları DOĞRUDAN belirleyen sayılar.
 *
 * Raporda yazıyor çünkü bu değerler ölçüm değil varsayım, ve rapordaki
 * güç/tork/tüketim/yol yükü rakamlarının hepsi bunlara bağlı. Kütle 100 kg
 * yanlışsa tork tahmini de o oranda yanlış — okuyan kişinin bunu görmesi,
 * sonra keşfetmesinden iyi.
 */
export function profileAssumptions(v: VehicleProfile): string[] {
  const p = v.physics;
  const t = v.fittedTyre;
  return [
    ...(p
      ? [
          `mass ${p.massKg} kg`,
          `displacement ${p.displacementL.toFixed(3)} L`,
          `Cd ${p.dragCoefficient} over ${p.frontalAreaM2} m²`,
          `rolling resistance ${p.rollingResistance}`,
        ]
      : ['mass, displacement and aerodynamics unknown — power, torque and airflow estimates not computed']),
    `idle ${v.idleRpm} rpm`,
    t ? `tyres ${t.widthMm}/${t.aspectRatio} R${t.rimInch}` : 'tyre size not set',
  ];
}
