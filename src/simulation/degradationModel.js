import { DEGRADATION, PHOTOPERIOD } from './constants';

const PHOTOPERIOD_HOURS = PHOTOPERIOD.totalLight;

/**
 * Bileşen bozulma modeli — her tick'te çağrılır
 * Weibull, üstel ve sigmoid bozulma eğrileri
 */
export function calculateDegradation(state) {
  const missionDay = state.time.day;
  const components = {};

  // 1. HEPA Filtre — doğrusal bozulma
  const hepa = DEGRADATION.hepaFilter;
  const hepaHealth = Math.max(0, 1 - (missionDay / hepa.lifespanDays));
  const hepaPressureDrop = 1 + (1 - hepaHealth) * (hepa.pressureDropThreshold - 1);
  components.hepaFilter = {
    health: hepaHealth * 100,
    pressureDrop: hepaPressureDrop,
    daysRemaining: Math.max(0, hepa.lifespanDays - missionDay),
    status: hepaHealth > 0.5 ? 'nominal' : hepaHealth > 0.2 ? 'warning' : 'critical',
    label: hepa.label,
  };

  // 2. Aktif Karbon Yatak — sigmoid doygunluk
  const carbon = DEGRADATION.carbonBed;
  const carbonAge = missionDay / carbon.lifespanDays;
  // Sigmoid: 1 / (1 + e^(10*(x-0.7))) — %70 ömürde hızlı düşüş
  const carbonHealth = 1 / (1 + Math.exp(10 * (carbonAge - 0.7)));
  components.carbonBed = {
    health: carbonHealth * 100,
    daysRemaining: Math.max(0, carbon.lifespanDays - missionDay),
    adsorptionEfficiency: carbonHealth,
    status: carbonHealth > 0.5 ? 'nominal' : carbonHealth > 0.2 ? 'warning' : 'critical',
    label: carbon.label,
  };

  // 3. Su Pompası — Weibull güvenilirlik
  const pump = DEGRADATION.waterPump;
  const pumpHours = missionDay * 24;
  // R(t) = exp(-(t/η)^β)
  const pumpReliability = Math.exp(-Math.pow(pumpHours / pump.weibullEta, pump.weibullBeta));
  const pumpEfficiency = 0.5 + 0.5 * pumpReliability; // %50 minimum
  components.waterPump = {
    health: pumpReliability * 100,
    efficiency: pumpEfficiency,
    hoursRun: pumpHours,
    status: pumpReliability > 0.7 ? 'nominal' : pumpReliability > 0.3 ? 'warning' : 'critical',
    label: pump.label,
  };

  // 4. LED Paneller — üstel azalma + radyasyon
  const led = DEGRADATION.led;
  const ledHours = missionDay * PHOTOPERIOD_HOURS;
  const ledHealth = Math.exp(-led.alphaDecay * ledHours * (1 + led.radiationPenalty));
  components.led = {
    health: ledHealth * 100,
    luminousOutput: ledHealth, // Başlangıca göre oran
    hoursRun: ledHours,
    status: ledHealth > 0.8 ? 'nominal' : ledHealth > 0.6 ? 'warning' : 'critical',
    label: led.label,
  };

  // 5. CO₂ Temizleyici
  const scrubber = DEGRADATION.co2Scrubber;
  const scrubberHealth = Math.max(0, 1 - (missionDay / scrubber.lifespanDays));
  components.co2Scrubber = {
    health: scrubberHealth * 100,
    efficiency: 0.3 + 0.7 * scrubberHealth,
    daysRemaining: Math.max(0, scrubber.lifespanDays - missionDay),
    status: scrubberHealth > 0.5 ? 'nominal' : scrubberHealth > 0.2 ? 'warning' : 'critical',
    label: scrubber.label,
  };

  // Genel bileşen sağlığı
  const avgHealth = Object.values(components).reduce((s, c) => s + c.health, 0) / Object.keys(components).length;

  return { components, averageHealth: avgHealth };
}
