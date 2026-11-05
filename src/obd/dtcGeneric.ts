/**
 * Standart (SAE J2012 / ISO 15031-6) arıza kodu açıklamaları ve kategorileri.
 *
 * Bu tablo üreticiden bağımsız kodlar içindir: P0xxx, P2xxx, P34xx ve U0xxx.
 * Bir kodun anlamı standartla sabit — hangi markada okunursa okunsun aynı.
 * Üretici kodları (P1xxx, P30-P33xx, B1/C1/U1...) burada YOK; onların
 * anlamı markaya göre değişir ve doğrulanmış kaynak olmadan açıklama
 * yazmak, yanlış teşhis vermek olur.
 *
 * Metinler bu proje için yazıldı; başka bir listeden kopyalanmadı. Kodların
 * büyük kısmı ailelerden oluşuyor (sensör devresi: devre / aralık-performans
 * / düşük / yüksek / kesintili; silindir 1-12; banka 1-2...) ve aileler
 * üreteçlerle kuruluyor — tek tek yazılan binlerce satırdan daha az hata
 * barındırıyor. Tablo eksiksiz değil: standartta olup burada olmayan bir kod
 * yine de `dtcCategory` ile en azından sistem düzeyinde açıklanıyor.
 */

const TABLE: Record<string, string> = {};

/** P0123 gibi bir kodu sayıdan kurar (rakamlar ondalık, 4 hane). */
function code(prefix: 'P' | 'U', n: number): string {
  return `${prefix}${String(n).padStart(4, '0')}`;
}

function add(prefix: 'P' | 'U', n: number, text: string): void {
  TABLE[code(prefix, n)] = text;
}

/** Ardışık kodlara sırayla metin atar. */
function seq(prefix: 'P' | 'U', start: number, texts: readonly string[]): void {
  texts.forEach((t, i) => add(prefix, start + i, t));
}

/** Sensör devresi ailesi: devre, aralık/performans, düşük, yüksek, kesintili. */
function circuit5(start: number, name: string): void {
  seq('P', start, [
    `${name} circuit`,
    `${name} circuit range/performance`,
    `${name} circuit low`,
    `${name} circuit high`,
    `${name} circuit intermittent`,
  ]);
}

/** Devre, aralık/performans, düşük, yüksek (kesintili olmadan). */
function circuit4(start: number, name: string): void {
  seq('P', start, [
    `${name} circuit`,
    `${name} circuit range/performance`,
    `${name} circuit low`,
    `${name} circuit high`,
  ]);
}

/** Devre/açık, düşük, yüksek. */
function control3(start: number, name: string): void {
  seq('P', start, [`${name} circuit/open`, `${name} circuit low`, `${name} circuit high`]);
}

const COIL_LETTERS = 'ABCDEFGHIJKL';

// ---------------------------------------------------------------------------
// P00xx — yakıt/hava ölçümü ve yardımcı emisyon kontrolleri
// ---------------------------------------------------------------------------

seq('P', 1, [
  'Fuel volume regulator control circuit/open',
  'Fuel volume regulator control circuit range/performance',
  'Fuel volume regulator control circuit low',
  'Fuel volume regulator control circuit high',
  'Fuel shutoff valve "A" control circuit/open',
  'Fuel shutoff valve "A" control circuit low',
  'Fuel shutoff valve "A" control circuit high',
  'Engine position system performance (bank 1)',
  'Engine position system performance (bank 2)',
]);

for (const [start, bank] of [
  [10, 1],
  [20, 2],
] as const) {
  seq('P', start, [
    `Intake ("A") camshaft position actuator circuit (bank ${bank})`,
    `Intake ("A") camshaft position — timing over-advanced or system performance (bank ${bank})`,
    `Intake ("A") camshaft position — timing over-retarded (bank ${bank})`,
    `Exhaust ("B") camshaft position actuator circuit (bank ${bank})`,
    `Exhaust ("B") camshaft position — timing over-advanced or system performance (bank ${bank})`,
    `Exhaust ("B") camshaft position — timing over-retarded (bank ${bank})`,
  ]);
}
seq('P', 16, [
  'Crankshaft position / camshaft position correlation (bank 1 sensor A)',
  'Crankshaft position / camshaft position correlation (bank 1 sensor B)',
  'Crankshaft position / camshaft position correlation (bank 2 sensor A)',
  'Crankshaft position / camshaft position correlation (bank 2 sensor B)',
]);
seq('P', 26, [
  'Intake valve control solenoid circuit range/performance (bank 1)',
  'Exhaust valve control solenoid circuit range/performance (bank 1)',
  'Intake valve control solenoid circuit range/performance (bank 2)',
  'Exhaust valve control solenoid circuit range/performance (bank 2)',
]);

// Oksijen sondası ısıtıcı devreleri: banka × sonda.
for (const [start, bank, sensor] of [
  [30, 1, 1],
  [36, 1, 2],
  [42, 1, 3],
  [50, 2, 1],
  [56, 2, 2],
  [62, 2, 3],
] as const) {
  seq('P', start, [
    `O2 sensor heater control circuit (bank ${bank} sensor ${sensor})`,
    `O2 sensor heater control circuit low (bank ${bank} sensor ${sensor})`,
    `O2 sensor heater control circuit high (bank ${bank} sensor ${sensor})`,
  ]);
}
seq('P', 33, [
  'Turbo/supercharger bypass valve control circuit',
  'Turbo/supercharger bypass valve control circuit low',
  'Turbo/supercharger bypass valve control circuit high',
]);
add('P', 39, 'Turbo/supercharger bypass valve control circuit range/performance');
add('P', 40, 'O2 sensor signals swapped (bank 1 sensor 1 / bank 2 sensor 1)');
add('P', 41, 'O2 sensor signals swapped (bank 1 sensor 2 / bank 2 sensor 2)');
seq('P', 45, [
  'Turbo/supercharger boost control "A" circuit/open',
  'Turbo/supercharger boost control "A" circuit range/performance',
  'Turbo/supercharger boost control "A" circuit low',
  'Turbo/supercharger boost control "A" circuit high',
  'Turbo/supercharger turbine overspeed',
]);
seq('P', 53, [
  'O2 sensor heater resistance (bank 1 sensor 1)',
  'O2 sensor heater resistance (bank 1 sensor 2)',
  'O2 sensor heater resistance (bank 1 sensor 3)',
]);
seq('P', 59, [
  'O2 sensor heater resistance (bank 2 sensor 1)',
  'O2 sensor heater resistance (bank 2 sensor 2)',
  'O2 sensor heater resistance (bank 2 sensor 3)',
]);
seq('P', 65, [
  'Air assisted injector control range/performance',
  'Air assisted injector control circuit or circuit low',
  'Air assisted injector control circuit high',
  'Manifold pressure / mass air flow — throttle position correlation',
  'Manifold pressure — barometric pressure correlation',
]);
circuit5(70, 'Ambient air temperature sensor');
for (const [start, valve, bank] of [
  [75, 'Intake', 1],
  [78, 'Exhaust', 1],
  [81, 'Intake', 2],
  [84, 'Exhaust', 2],
] as const) {
  seq('P', start, [
    `${valve} valve control solenoid circuit (bank ${bank})`,
    `${valve} valve control solenoid circuit low (bank ${bank})`,
    `${valve} valve control solenoid circuit high (bank ${bank})`,
  ]);
}
seq('P', 87, [
  'Fuel rail/system pressure too low',
  'Fuel rail/system pressure too high',
  'Fuel pressure regulator 1 performance',
  'Fuel pressure regulator 1 control circuit',
  'Fuel pressure regulator 1 control circuit low',
  'Fuel pressure regulator 1 control circuit high',
  'Fuel system leak detected — large leak',
  'Fuel system leak detected — small leak',
]);
circuit5(95, 'Intake air temperature sensor 2');

// ---------------------------------------------------------------------------
// P01xx — yakıt/hava ölçümü
// ---------------------------------------------------------------------------

circuit5(100, 'Mass air flow sensor "A"');
circuit5(105, 'Manifold absolute pressure / barometric pressure sensor');
circuit5(110, 'Intake air temperature sensor 1');
circuit5(115, 'Engine coolant temperature sensor 1');
circuit5(120, 'Throttle/pedal position sensor "A"');
seq('P', 125, [
  'Insufficient coolant temperature for closed loop fuel control',
  'Insufficient coolant temperature for stable operation',
  'Intake air temperature too high',
  'Coolant thermostat — coolant temperature below thermostat regulating temperature',
  'Barometric pressure too low',
]);

// Oksijen sondaları: devre, düşük voltaj, yüksek voltaj, yavaş tepki,
// hareketsiz, ısıtıcı devresi — her banka/sonda için altı kod.
for (const [start, bank, sensor] of [
  [130, 1, 1],
  [136, 1, 2],
  [142, 1, 3],
  [150, 2, 1],
  [156, 2, 2],
  [162, 2, 3],
] as const) {
  const where = `(bank ${bank} sensor ${sensor})`;
  seq('P', start, [
    `O2 sensor circuit ${where}`,
    `O2 sensor circuit low voltage ${where}`,
    `O2 sensor circuit high voltage ${where}`,
    `O2 sensor circuit slow response ${where}`,
    `O2 sensor circuit no activity detected ${where}`,
    `O2 sensor heater circuit ${where}`,
  ]);
}
add('P', 148, 'Fuel delivery error');
add('P', 149, 'Fuel timing error');
add('P', 168, 'Fuel temperature too high');
add('P', 169, 'Incorrect fuel composition');
seq('P', 170, [
  'Fuel trim (bank 1)',
  'System too lean (bank 1)',
  'System too rich (bank 1)',
  'Fuel trim (bank 2)',
  'System too lean (bank 2)',
  'System too rich (bank 2)',
]);
circuit4(176, 'Fuel composition sensor');
circuit5(180, 'Fuel temperature sensor "A"');
circuit5(185, 'Fuel temperature sensor "B"');
circuit5(190, 'Fuel rail pressure sensor "A"');
circuit5(195, 'Engine oil temperature sensor');

// ---------------------------------------------------------------------------
// P02xx — yakıt/hava ölçümü (enjektör devresi)
// ---------------------------------------------------------------------------

add('P', 200, 'Injector circuit/open');
for (let cyl = 1; cyl <= 12; cyl++) {
  add('P', 200 + cyl, `Injector circuit/open — cylinder ${cyl}`);
  // 261-296: her silindire düşük / yüksek / katkı-denge üçlüsü.
  seq('P', 261 + (cyl - 1) * 3, [
    `Cylinder ${cyl} injector circuit low`,
    `Cylinder ${cyl} injector circuit high`,
    `Cylinder ${cyl} contribution/balance`,
  ]);
}
seq('P', 213, [
  'Cold start injector 1',
  'Cold start injector 2',
  'Engine shutoff solenoid',
  'Injector/injection timing control circuit',
  'Engine coolant over temperature condition',
  'Transmission fluid over temperature condition',
  'Engine overspeed condition',
]);
circuit5(220, 'Throttle/pedal position sensor "B"');
circuit5(225, 'Throttle/pedal position sensor "C"');
seq('P', 230, [
  'Fuel pump primary circuit',
  'Fuel pump secondary circuit low',
  'Fuel pump secondary circuit high',
  'Fuel pump secondary circuit intermittent',
  'Turbo/supercharger overboost condition',
]);
circuit4(235, 'Turbo/supercharger boost sensor "A"');
circuit4(239, 'Turbo/supercharger boost sensor "B"');
seq('P', 243, [
  'Turbo/supercharger wastegate solenoid "A"',
  'Turbo/supercharger wastegate solenoid "A" range/performance',
  'Turbo/supercharger wastegate solenoid "A" low',
  'Turbo/supercharger wastegate solenoid "A" high',
  'Turbo/supercharger wastegate solenoid "B"',
  'Turbo/supercharger wastegate solenoid "B" range/performance',
  'Turbo/supercharger wastegate solenoid "B" low',
  'Turbo/supercharger wastegate solenoid "B" high',
]);
for (const [start, letter] of [
  [251, 'A'],
  [256, 'B'],
] as const) {
  const name = `Injection pump fuel metering control "${letter}"`;
  seq('P', start, [
    name,
    `${name} range/performance`,
    `${name} low`,
    `${name} high`,
    `${name} intermittent`,
  ]);
}
seq('P', 297, [
  'Vehicle overspeed condition',
  'Engine oil over temperature',
  'Turbo/supercharger underboost',
]);

// ---------------------------------------------------------------------------
// P03xx — ateşleme sistemi ve tekleme
// ---------------------------------------------------------------------------

add('P', 300, 'Random/multiple cylinder misfire detected');
for (let cyl = 1; cyl <= 12; cyl++) {
  add('P', 300 + cyl, `Cylinder ${cyl} misfire detected`);
  add('P', 350 + cyl, `Ignition coil "${COIL_LETTERS[cyl - 1]}" primary/secondary circuit (cylinder ${cyl})`);
}
seq('P', 313, [
  'Misfire detected with low fuel',
  'Single cylinder misfire (cylinder not specified)',
  'Crankshaft position system variation not learned',
  'Engine misfire detected on startup (first 1000 revolutions)',
  'Rough road hardware not present',
  'Rough road sensor "A" signal circuit',
  'Rough road sensor "B" signal circuit',
]);
seq('P', 320, [
  'Ignition/distributor engine speed input circuit',
  'Ignition/distributor engine speed input circuit range/performance',
  'Ignition/distributor engine speed input circuit no signal',
  'Ignition/distributor engine speed input circuit intermittent',
  'Knock control system error',
]);
circuit5(325, 'Knock sensor 1 (bank 1 or single sensor)');
circuit5(330, 'Knock sensor 2 (bank 2)');
circuit5(335, 'Crankshaft position sensor "A"');
circuit5(340, 'Camshaft position sensor "A" (bank 1 or single sensor)');
circuit5(345, 'Camshaft position sensor "A" (bank 2)');
add('P', 350, 'Ignition coil primary/secondary circuit');
circuit5(365, 'Camshaft position sensor "B" (bank 1)');
for (const [start, letter] of [
  [370, 'A'],
  [375, 'B'],
] as const) {
  const name = `Timing reference high resolution signal "${letter}"`;
  seq('P', start, [
    name,
    `${name} too many pulses`,
    `${name} too few pulses`,
    `${name} intermittent/erratic pulses`,
    `${name} no pulse`,
  ]);
}
seq('P', 380, [
  'Glow plug/heater circuit "A"',
  'Glow plug/heater indicator circuit',
  'Glow plug/heater circuit "B"',
]);
circuit5(385, 'Crankshaft position sensor "B"');
circuit5(390, 'Camshaft position sensor "B" (bank 2)');

// ---------------------------------------------------------------------------
// P04xx — yardımcı emisyon kontrolleri
// ---------------------------------------------------------------------------

seq('P', 400, [
  'Exhaust gas recirculation (EGR) flow',
  'EGR flow insufficient detected',
  'EGR flow excessive detected',
  'EGR control circuit',
  'EGR control circuit range/performance',
  'EGR sensor "A" circuit low',
  'EGR sensor "A" circuit high',
  'EGR sensor "B" circuit low',
  'EGR sensor "B" circuit high',
  'EGR sensor "A" circuit',
  'Secondary air injection system',
  'Secondary air injection system incorrect flow detected',
  'Secondary air injection system switching valve "A" circuit',
  'Secondary air injection system switching valve "A" circuit open',
  'Secondary air injection system switching valve "A" circuit shorted',
  'Secondary air injection system switching valve "B" circuit',
  'Secondary air injection system switching valve "B" circuit open',
  'Secondary air injection system switching valve "B" circuit shorted',
  'Secondary air injection system control "A" circuit',
  'Secondary air injection system control "B" circuit',
]);
for (const [start, bank] of [
  [420, 1],
  [430, 2],
] as const) {
  const b = `(bank ${bank})`;
  seq('P', start, [
    `Catalyst system efficiency below threshold ${b}`,
    `Warm up catalyst efficiency below threshold ${b}`,
    `Main catalyst efficiency below threshold ${b}`,
    `Heated catalyst efficiency below threshold ${b}`,
    `Heated catalyst temperature below threshold ${b}`,
    `Catalyst temperature sensor ${b}`,
    `Catalyst temperature sensor range/performance ${b}`,
    `Catalyst temperature sensor low ${b}`,
    `Catalyst temperature sensor high ${b}`,
    `Catalyst heater control circuit ${b}`,
  ]);
}
seq('P', 440, [
  'Evaporative emission (EVAP) system',
  'EVAP system incorrect purge flow',
  'EVAP system leak detected (small leak)',
  'EVAP system purge control valve circuit',
  'EVAP system purge control valve circuit open',
  'EVAP system purge control valve circuit shorted',
  'EVAP system vent control circuit',
  'EVAP system vent control circuit open',
  'EVAP system vent control circuit shorted',
  'EVAP system vent valve/solenoid circuit',
  'EVAP system pressure sensor',
  'EVAP system pressure sensor range/performance',
  'EVAP system pressure sensor low',
  'EVAP system pressure sensor high',
  'EVAP system pressure sensor intermittent',
  'EVAP system leak detected (large leak)',
  'EVAP system leak detected (very small leak)',
  'EVAP system leak detected (fuel cap loose/off)',
  'EVAP system purge control valve circuit low',
  'EVAP system purge control valve circuit high',
]);
circuit5(460, 'Fuel level sensor "A"');
circuit5(465, 'EVAP purge flow sensor');
circuit5(470, 'Exhaust pressure sensor "A"');
seq('P', 475, [
  'Exhaust pressure control valve "A"',
  'Exhaust pressure control valve "A" range/performance',
  'Exhaust pressure control valve "A" low',
  'Exhaust pressure control valve "A" high',
  'Exhaust pressure control valve "A" intermittent',
  'Cooling fan 1 control circuit',
  'Cooling fan 2 control circuit',
  'Cooling fan 3 control circuit',
  'Cooling fan rationality check',
  'Cooling fan circuit over current',
  'Cooling fan power/ground circuit',
  'EGR sensor "B" circuit',
  'EGR throttle control circuit "A"',
  'EGR throttle control circuit "A" range/performance',
  'EGR control circuit low',
  'EGR control circuit high',
  'Secondary air injection system insufficient flow (bank 1)',
  'Secondary air injection system insufficient flow (bank 2)',
  'Cooling fan overspeed',
  'Cooling fan speed low',
  'Cooling fan speed high',
  'EVAP system high purge flow',
  'EVAP system low purge flow',
  'EVAP system vent control circuit low',
  'EVAP system vent control circuit high',
]);

// ---------------------------------------------------------------------------
// P05xx — araç hızı, rölanti kontrolü ve yardımcı girişler
// ---------------------------------------------------------------------------

seq('P', 500, [
  'Vehicle speed sensor "A"',
  'Vehicle speed sensor "A" range/performance',
  'Vehicle speed sensor "A" circuit low',
  'Vehicle speed sensor "A" intermittent/erratic/high',
  'Brake switch "A" / "B" correlation',
  'Idle air control system',
  'Idle air control system — RPM lower than expected',
  'Idle air control system — RPM higher than expected',
  'Idle air control system circuit low',
  'Idle air control system circuit high',
  'Closed throttle position switch',
  'Idle air control circuit',
  'Starter request circuit',
  'Invalid immobilizer key',
]);
seq('P', 515, [
  'Battery temperature sensor circuit',
  'Battery temperature sensor circuit low',
  'Battery temperature sensor circuit high',
]);
seq('P', 520, [
  'Engine oil pressure sensor/switch circuit',
  'Engine oil pressure sensor/switch circuit range/performance',
  'Engine oil pressure sensor/switch circuit low',
  'Engine oil pressure sensor/switch circuit high',
  'Engine oil pressure too low',
  'Cruise control servo control circuit range/performance',
  'Fan speed sensor circuit',
  'Fan speed sensor circuit range/performance',
  'Fan speed sensor circuit no signal',
  'Fan speed sensor circuit intermittent',
]);
circuit4(530, 'A/C refrigerant pressure sensor "A"');
add('P', 534, 'Air conditioner refrigerant charge loss');
seq('P', 540, ['Intake air heater "A" circuit', 'Intake air heater "A" circuit low', 'Intake air heater "A" circuit high']);
seq('P', 544, [
  'Exhaust gas temperature sensor circuit (bank 1 sensor 1)',
  'Exhaust gas temperature sensor circuit low (bank 1 sensor 1)',
  'Exhaust gas temperature sensor circuit high (bank 1 sensor 1)',
  'Exhaust gas temperature sensor circuit (bank 2 sensor 1)',
  'Exhaust gas temperature sensor circuit low (bank 2 sensor 1)',
  'Exhaust gas temperature sensor circuit high (bank 2 sensor 1)',
]);
circuit5(550, 'Power steering pressure sensor/switch');
circuit5(555, 'Brake booster pressure sensor');
seq('P', 560, [
  'System voltage',
  'System voltage unstable',
  'System voltage low',
  'System voltage high',
  'Cruise control multi-function input "A" circuit',
  'Cruise control on signal',
  'Cruise control off signal',
  'Cruise control resume signal',
  'Cruise control set signal',
  'Cruise control coast signal',
  'Cruise control accelerate signal',
  'Brake switch "A" circuit',
  'Brake switch "A" circuit low',
  'Brake switch "A" circuit high',
  'Cruise control system — vehicle speed too high',
  'Cruise control input circuit',
]);
seq('P', 579, [
  'Cruise control multi-function input "A" circuit range/performance',
  'Cruise control multi-function input "A" circuit low',
  'Cruise control multi-function input "A" circuit high',
]);

// ---------------------------------------------------------------------------
// P06xx — kontrol modülü ve çıkış devreleri
// ---------------------------------------------------------------------------

seq('P', 600, [
  'Serial communication link',
  'Internal control module memory checksum error',
  'Control module programming error',
  'Internal control module keep alive memory (KAM) error',
  'Internal control module random access memory (RAM) error',
  'Internal control module read only memory (ROM) error',
  'Control module processor',
  'Control module performance',
  'Control module vehicle speed output "A"',
  'Control module vehicle speed output "B"',
  'Control module vehicle options error',
  'Fuel injector control module performance',
  'Fuel injector control module relay control',
  'Transmission control module processor',
  'Engine / transmission control module incompatible',
  'Starter relay circuit',
  'Starter relay circuit low',
  'Starter relay circuit high',
  'Alternative fuel control module keep alive memory error',
  'Alternative fuel control module RAM/ROM error',
  'Generator control circuit',
  'Generator lamp/L-terminal control circuit',
  'Generator field/F-terminal control circuit',
  'Generator lamp control circuit',
  'Fuel cap lamp control circuit',
  'Generator field/F-terminal circuit low',
  'Generator field/F-terminal circuit high',
  'Fuel pump "A" control circuit/open',
  'Fuel pump "A" control circuit low',
  'Fuel pump "A" control circuit high',
  'VIN not programmed or incompatible — engine control module',
  'VIN not programmed or incompatible — transmission control module',
  'Odometer not programmed — engine control module',
  'Immobilizer key not programmed — engine control module',
  'Control module internal temperature too high',
  'Power steering control circuit',
  'Power steering control circuit low',
  'Power steering control circuit high',
  'Throttle actuator control range/performance (bank 1)',
  'Throttle actuator control range/performance (bank 2)',
  'Intake air heater control circuit',
  'Sensor reference voltage "A" circuit/open',
  'Sensor reference voltage "A" circuit low',
  'Sensor reference voltage "A" circuit high',
  'Driver display serial communication circuit',
  'A/C clutch relay control circuit',
  'A/C clutch relay control circuit low',
  'A/C clutch relay control circuit high',
  'Immobilizer lamp control circuit',
  'Speed control lamp control circuit',
  'Malfunction indicator lamp (MIL) control circuit',
  'Sensor reference voltage "B" circuit/open',
  'Sensor reference voltage "B" circuit low',
  'Sensor reference voltage "B" circuit high',
  'Engine RPM output circuit',
  'Engine hot lamp output control circuit',
  'Fuel level output circuit',
  'Actuator supply voltage "A" circuit/open',
  'Actuator supply voltage "A" circuit low',
  'Actuator supply voltage "A" circuit high',
]);
control3(660, 'Intake manifold tuning valve control (bank 1)');
control3(663, 'Intake manifold tuning valve control (bank 2)');
circuit4(666, 'Control module internal temperature sensor');
add('P', 670, 'Glow plug control module control circuit');
for (let cyl = 1; cyl <= 12; cyl++) add('P', 670 + cyl, `Cylinder ${cyl} glow plug circuit`);
seq('P', 683, [
  'Glow plug control module to engine control module communication circuit',
  'Glow plug control module to engine control module communication circuit range/performance',
]);
control3(685, 'Engine control module power relay control');
control3(688, 'Engine control module power relay sense');
seq('P', 691, [
  'Cooling fan 1 control circuit low',
  'Cooling fan 1 control circuit high',
  'Cooling fan 2 control circuit low',
  'Cooling fan 2 control circuit high',
  'Cooling fan 3 control circuit low',
  'Cooling fan 3 control circuit high',
]);
seq('P', 697, [
  'Sensor reference voltage "C" circuit/open',
  'Sensor reference voltage "C" circuit low',
  'Sensor reference voltage "C" circuit high',
]);

// ---------------------------------------------------------------------------
// P07xx-P09xx — şanzıman
// ---------------------------------------------------------------------------

seq('P', 700, [
  'Transmission control system (MIL request)',
  'Transmission control system range/performance',
  'Transmission control system electrical',
  'Brake switch "B" circuit',
  'Clutch switch input circuit',
]);
circuit5(705, 'Transmission range sensor "A"');
circuit5(710, 'Transmission fluid temperature sensor "A"');
seq('P', 715, [
  'Input/turbine speed sensor "A" circuit',
  'Input/turbine speed sensor "A" circuit range/performance',
  'Input/turbine speed sensor "A" circuit no signal',
  'Input/turbine speed sensor "A" circuit intermittent',
  'Torque converter/brake switch "B" circuit low',
  'Output speed sensor circuit',
  'Output speed sensor circuit range/performance',
  'Output speed sensor circuit no signal',
  'Output speed sensor circuit intermittent',
  'Torque converter/brake switch "B" circuit high',
  'Engine speed input circuit',
  'Engine speed input circuit range/performance',
  'Engine speed input circuit no signal',
  'Engine speed input circuit intermittent',
  'Gear 6 incorrect ratio',
  'Incorrect gear ratio',
  'Gear 1 incorrect ratio',
  'Gear 2 incorrect ratio',
  'Gear 3 incorrect ratio',
  'Gear 4 incorrect ratio',
  'Gear 5 incorrect ratio',
  'Reverse incorrect ratio',
  'Transmission control module engine speed output circuit',
  'Transmission control module engine speed output circuit low',
  'Transmission control module engine speed output circuit high',
  'Torque converter clutch circuit/open',
  'Torque converter clutch circuit performance or stuck off',
  'Torque converter clutch circuit stuck on',
  'Torque converter clutch circuit electrical',
  'Torque converter clutch circuit intermittent',
]);
/** Selenoid ailesi: ad, performans/takılı kapalı, takılı açık, elektrik, kesintili. */
function solenoid5(start: number, name: string): void {
  seq('P', start, [
    name,
    `${name} performance or stuck off`,
    `${name} stuck on`,
    `${name} electrical`,
    `${name} intermittent`,
  ]);
}
solenoid5(745, 'Pressure control solenoid "A"');
solenoid5(750, 'Shift solenoid "A"');
solenoid5(755, 'Shift solenoid "B"');
solenoid5(760, 'Shift solenoid "C"');
solenoid5(765, 'Shift solenoid "D"');
solenoid5(770, 'Shift solenoid "E"');
solenoid5(775, 'Pressure control solenoid "B"');
seq('P', 780, ['Shift error', '1-2 shift', '2-3 shift', '3-4 shift', '4-5 shift']);
circuit5(785, 'Shift/timing solenoid "A"');
add('P', 790, 'Normal/performance switch circuit');
seq('P', 791, [
  'Intermediate shaft speed sensor "A" circuit',
  'Intermediate shaft speed sensor "A" circuit range/performance',
  'Intermediate shaft speed sensor "A" circuit no signal',
  'Intermediate shaft speed sensor "A" circuit intermittent',
]);
solenoid5(795, 'Pressure control solenoid "C"');
seq('P', 801, [
  'Reverse inhibit control circuit',
  'Transmission control system MIL request circuit/open',
]);
circuit5(805, 'Clutch position sensor');
seq('P', 810, ['Clutch position control error', 'Excessive clutch slippage']);
seq('P', 830, [
  'Clutch pedal switch "A" circuit',
  'Clutch pedal switch "A" circuit low',
  'Clutch pedal switch "A" circuit high',
  'Clutch pedal switch "B" circuit',
  'Clutch pedal switch "B" circuit low',
  'Clutch pedal switch "B" circuit high',
]);
circuit4(836, 'Four wheel drive (4WD) switch');
circuit5(840, 'Transmission fluid pressure sensor/switch "A"');
circuit5(845, 'Transmission fluid pressure sensor/switch "B"');
seq('P', 850, [
  'Park/neutral switch input circuit',
  'Park/neutral switch input circuit low',
  'Park/neutral switch input circuit high',
]);
circuit5(880, 'Transmission control module power input signal');
control3(885, 'Transmission control module power relay control');
circuit5(888, 'Transmission control module power relay sense');
seq('P', 893, [
  'Multiple gears engaged',
  'Transmission component slipping',
  'Shift time too short',
  'Shift time too long',
  'Transmission fluid deteriorated',
  'Transmission control system MIL request circuit low',
  'Transmission control system MIL request circuit high',
]);
seq('P', 900, [
  'Clutch actuator circuit/open',
  'Clutch actuator circuit range/performance',
  'Clutch actuator circuit low',
  'Clutch actuator circuit high',
]);
for (const [start, letter] of [
  [960, 'A'],
  [964, 'B'],
  [968, 'C'],
] as const) {
  const name = `Pressure control solenoid "${letter}" control circuit`;
  seq('P', start, [`${name}/open`, `${name} range/performance`, `${name} low`, `${name} high`]);
}

// ---------------------------------------------------------------------------
// P2xxx — standart, P0xxx'in devamı
// ---------------------------------------------------------------------------

seq('P', 2002, [
  'Diesel particulate filter efficiency below threshold (bank 1)',
  'Diesel particulate filter efficiency below threshold (bank 2)',
  'Intake manifold runner control stuck open (bank 1)',
  'Intake manifold runner control stuck open (bank 2)',
  'Intake manifold runner control stuck closed (bank 1)',
  'Intake manifold runner control stuck closed (bank 2)',
]);
control3(2008, 'Intake manifold runner control (bank 1)');
control3(2011, 'Intake manifold runner control (bank 2)');
circuit5(2014, 'Intake manifold runner position sensor/switch (bank 1)');
circuit5(2019, 'Intake manifold runner position sensor/switch (bank 2)');
seq('P', 2031, [
  'Exhaust gas temperature sensor circuit (bank 1 sensor 2)',
  'Exhaust gas temperature sensor circuit low (bank 1 sensor 2)',
  'Exhaust gas temperature sensor circuit high (bank 1 sensor 2)',
]);
seq('P', 2096, [
  'Post catalyst fuel trim system too lean (bank 1)',
  'Post catalyst fuel trim system too rich (bank 1)',
  'Post catalyst fuel trim system too lean (bank 2)',
  'Post catalyst fuel trim system too rich (bank 2)',
  'Throttle actuator control motor circuit/open',
  'Throttle actuator control motor circuit range/performance',
  'Throttle actuator control motor circuit low',
  'Throttle actuator control motor circuit high',
  'Throttle actuator control system — forced idle',
  'Throttle actuator control system — forced engine shutdown',
  'Throttle actuator control system — forced limited power',
  'Throttle actuator control module processor',
  'Throttle actuator control module performance',
  'Throttle/pedal position sensor "A" minimum stop performance',
  'Throttle actuator control system — forced limited RPM',
  'Throttle actuator control system — stuck open',
  'Throttle actuator control system — stuck closed',
]);
seq('P', 2118, [
  'Throttle actuator control motor current range/performance',
  'Throttle actuator control throttle body range/performance',
]);
circuit5(2120, 'Throttle/pedal position sensor "D"');
circuit5(2125, 'Throttle/pedal position sensor "E"');
circuit5(2130, 'Throttle/pedal position sensor "F"');
seq('P', 2135, [
  'Throttle/pedal position sensor "A" / "B" voltage correlation',
  'Throttle/pedal position sensor "A" / "C" voltage correlation',
  'Throttle/pedal position sensor "B" / "C" voltage correlation',
  'Throttle/pedal position sensor "D" / "E" voltage correlation',
  'Throttle/pedal position sensor "D" / "F" voltage correlation',
  'Throttle/pedal position sensor "E" / "F" voltage correlation',
]);
seq('P', 2177, [
  'System too lean off idle (bank 1)',
  'System too rich off idle (bank 1)',
  'System too lean off idle (bank 2)',
  'System too rich off idle (bank 2)',
  'Cooling system performance',
]);
circuit5(2182, 'Engine coolant temperature sensor 2');
seq('P', 2187, [
  'System too lean at idle (bank 1)',
  'System too rich at idle (bank 1)',
  'System too lean at idle (bank 2)',
  'System too rich at idle (bank 2)',
  'System too lean at higher load (bank 1)',
  'System too rich at higher load (bank 1)',
  'System too lean at higher load (bank 2)',
  'System too rich at higher load (bank 2)',
  'O2 sensor signal biased/stuck lean (bank 1 sensor 1)',
  'O2 sensor signal biased/stuck rich (bank 1 sensor 1)',
  'O2 sensor signal biased/stuck lean (bank 2 sensor 1)',
  'O2 sensor signal biased/stuck rich (bank 2 sensor 1)',
]);
circuit5(2226, 'Barometric pressure');
add('P', 2263, 'Turbo/supercharger boost system performance');
seq('P', 2270, [
  'O2 sensor signal biased/stuck lean (bank 1 sensor 2)',
  'O2 sensor signal biased/stuck rich (bank 1 sensor 2)',
  'O2 sensor signal biased/stuck lean (bank 2 sensor 2)',
  'O2 sensor signal biased/stuck rich (bank 2 sensor 2)',
]);
add('P', 2279, 'Intake air system leak');
add('P', 2293, 'Fuel pressure regulator 2 performance');
// 2300-2335: her bobine birincil düşük / birincil yüksek / ikincil üçlüsü.
for (let i = 0; i < 12; i++) {
  const coil = `Ignition coil "${COIL_LETTERS[i]}"`;
  seq('P', 2300 + i * 3, [
    `${coil} primary control circuit low`,
    `${coil} primary control circuit high`,
    `${coil} secondary circuit`,
  ]);
}
seq('P', 2400, [
  'EVAP leak detection pump control circuit/open',
  'EVAP leak detection pump control circuit low',
  'EVAP leak detection pump control circuit high',
]);
add('P', 2413, 'Exhaust gas recirculation system performance');
add('P', 2422, 'EVAP system vent valve stuck closed');
add('P', 2425, 'EGR cooling valve control circuit/open');
seq('P', 2440, [
  'Secondary air injection system switching valve stuck open (bank 1)',
  'Secondary air injection system switching valve stuck closed (bank 1)',
]);
circuit5(2452, 'Diesel particulate filter pressure sensor "A"');
seq('P', 2457, [
  'EGR cooling system performance',
  'Diesel particulate filter regeneration duration',
  'Diesel particulate filter regeneration frequency',
]);
add('P', 2463, 'Diesel particulate filter restriction — soot accumulation');
seq('P', 2500, [
  'Generator lamp/L-terminal circuit low',
  'Generator lamp/L-terminal circuit high',
  'Charging system voltage',
  'Charging system voltage low',
  'Charging system voltage high',
]);
seq('P', 2507, [
  'Engine control module power input signal low',
  'Engine control module power input signal high',
  'Engine control module power input signal intermittent',
]);
add('P', 2530, 'Ignition switch run position circuit');
circuit4(2600, 'Coolant pump "A" control');
add('P', 2610, 'Engine control module internal engine off timer performance');
add('P', 2635, 'Fuel pump "A" low flow/performance');
// P242F: on altılık hane — sayısal üreteç dışında.
TABLE.P242F = 'Diesel particulate filter restriction — ash accumulation';

// ---------------------------------------------------------------------------
// P34xx — silindir devreden çıkarma
// ---------------------------------------------------------------------------

add('P', 3400, 'Cylinder deactivation system (bank 1)');
for (let cyl = 1; cyl <= 12; cyl++) {
  const start = 3401 + (cyl - 1) * 8;
  seq('P', start, [
    `Cylinder ${cyl} deactivation/intake valve control circuit/open`,
    `Cylinder ${cyl} deactivation/intake valve control performance`,
    `Cylinder ${cyl} deactivation/intake valve control circuit low`,
    `Cylinder ${cyl} deactivation/intake valve control circuit high`,
    `Cylinder ${cyl} exhaust valve control circuit/open`,
    `Cylinder ${cyl} exhaust valve control performance`,
    `Cylinder ${cyl} exhaust valve control circuit low`,
    `Cylinder ${cyl} exhaust valve control circuit high`,
  ]);
}
add('P', 3497, 'Cylinder deactivation system (bank 2)');

// ---------------------------------------------------------------------------
// U0xxx — modüller arası ağ iletişimi
// ---------------------------------------------------------------------------

seq('U', 1, [
  'High speed CAN communication bus',
  'High speed CAN communication bus performance',
]);
seq('U', 10, [
  'Medium speed CAN communication bus',
  'Medium speed CAN communication bus performance',
]);
seq('U', 19, ['Low speed CAN communication bus', 'Low speed CAN communication bus performance']);
seq('U', 28, ['Vehicle communication bus "A"', 'Vehicle communication bus "A" performance']);

const LOST: ReadonlyArray<readonly [number, string]> = [
  [100, 'engine control module "A"'],
  [101, 'transmission control module'],
  [102, 'transfer case control module'],
  [103, 'gear shift module'],
  [104, 'cruise control module'],
  [105, 'fuel injector control module'],
  [106, 'glow plug control module'],
  [107, 'throttle actuator control module'],
  [108, 'alternative fuel control module'],
  [109, 'fuel pump control module'],
  [110, 'drive motor control module "A"'],
  [111, 'battery energy control module "A"'],
  [112, 'battery energy control module "B"'],
  [114, 'four-wheel drive clutch control module'],
  [115, 'engine control module "B"'],
  [121, 'anti-lock brake system (ABS) control module'],
  [122, 'vehicle dynamics control module'],
  [123, 'yaw rate sensor module'],
  [124, 'lateral acceleration sensor module'],
  [125, 'multi-axis acceleration sensor module'],
  [126, 'steering angle sensor module'],
  [127, 'tyre pressure monitor module'],
  [128, 'park brake control module'],
  [129, 'brake system control module'],
  [130, 'steering effort control module'],
  [131, 'power steering control module'],
  [132, 'ride level control module'],
  [140, 'body control module'],
  [141, 'body control module "A"'],
  [142, 'body control module "B"'],
  [143, 'body control module "C"'],
  [144, 'body control module "D"'],
  [145, 'body control module "E"'],
  [146, 'gateway "A"'],
  [147, 'gateway "B"'],
  [151, 'restraints (airbag) control module'],
  [155, 'instrument panel cluster control module'],
  [156, 'information center "A"'],
  [159, 'parking assist control module "A"'],
  [164, 'HVAC control module'],
  [167, 'vehicle immobilizer control module'],
  [168, 'vehicle security control module'],
  [184, 'radio'],
  [198, 'telematic control module "A"'],
  [212, 'steering column control module'],
  [214, 'remote function actuation'],
  [293, 'hybrid powertrain control module'],
];
for (const [n, module] of LOST) add('U', n, `Lost communication with ${module}`);
seq('U', 300, [
  'Internal control module software incompatibility',
  'Software incompatibility with engine control module',
  'Software incompatibility with transmission control module',
]);
const INVALID: ReadonlyArray<readonly [number, string]> = [
  [401, 'engine control module "A"'],
  [402, 'transmission control module'],
  [415, 'anti-lock brake system (ABS) control module'],
  [416, 'vehicle dynamics control module'],
  [422, 'body control module'],
  [423, 'instrument panel control module'],
  [428, 'steering angle sensor module'],
];
for (const [n, module] of INVALID) add('U', n, `Invalid data received from ${module}`);

export const GENERIC_DTC_DESCRIPTIONS: Readonly<Record<string, string>> = TABLE;

/**
 * Kodun yapısından sistem kategorisi — açıklaması olmayan kod için.
 *
 * Harf sistemi, ikinci hane standart/üretici ayrımını, üçüncü hane alt
 * sistemi söyler (SAE J2012). Bu bilgi kodun kendisinde: tablo olmadan da
 * kesin. "P0A12: hybrid propulsion" demek, "açıklama yok" demekten çok
 * daha faydalı.
 */
export function dtcCategory(dtc: string): string {
  const c = dtc.toUpperCase();
  const system = c[0];
  const group = c[1];
  const sub = c[2];

  if (system === 'P') {
    if (group === '1') return 'Manufacturer-specific powertrain code';
    if (group === '3') {
      return sub === '4'
        ? 'Cylinder deactivation'
        : /[0-3]/.test(sub)
          ? 'Manufacturer-specific powertrain code'
          : 'Powertrain (reserved)';
    }
    const p0: Record<string, string> = {
      '0': 'Fuel and air metering, auxiliary emission controls',
      '1': 'Fuel and air metering',
      '2': 'Fuel and air metering (injector circuit)',
      '3': 'Ignition system or misfire',
      '4': 'Auxiliary emission controls',
      '5': 'Vehicle speed, idle control and auxiliary inputs',
      '6': 'Control module and output circuits',
      '7': 'Transmission',
      '8': 'Transmission',
      '9': 'Transmission',
      A: 'Hybrid propulsion',
      B: 'Hybrid propulsion',
      C: 'Hybrid propulsion',
    };
    const p2: Record<string, string> = {
      '0': 'Fuel and air metering, auxiliary emission controls',
      '1': 'Fuel and air metering, auxiliary emission controls',
      '2': 'Fuel and air metering, auxiliary emission controls',
      '3': 'Ignition system or misfire',
      '4': 'Auxiliary emission controls',
      '5': 'Auxiliary inputs',
      '6': 'Control module and output circuits',
      '7': 'Transmission',
      '8': 'Transmission',
      '9': 'Fuel and air metering',
      A: 'Fuel and air metering',
    };
    const table = group === '0' ? p0 : group === '2' ? p2 : null;
    return table?.[sub] ?? 'Powertrain';
  }
  if (system === 'U') {
    if (group === '0') return 'Network communication between control modules';
    if (group === '1' || group === '2') return 'Manufacturer-specific network code';
    return 'Network communication';
  }
  if (system === 'C') {
    if (group === '0') return 'Chassis (brakes, steering, suspension)';
    if (group === '1' || group === '2') return 'Manufacturer-specific chassis code';
    return 'Chassis';
  }
  if (system === 'B') {
    if (group === '0') return 'Body (airbags, climate, lighting, comfort)';
    if (group === '1' || group === '2') return 'Manufacturer-specific body code';
    return 'Body';
  }
  return 'Unknown system';
}
