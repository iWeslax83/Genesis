import { THERMAL, TICK_FRACTION } from './constants';

/**
 * Isıl denge hesaplama — her tick'te çağrılır
 */
export function calculateThermalBalance(state, powerData) {
  const { compartments } = state;
  const crewCount = compartments.habitat.crewCount || 6;
  const currentTemp = compartments.habitat.temperature || 22;

  // 1. Isı kaynakları (kW)
  const crewHeat = (THERMAL.crewMetabolicHeat.dailyAverage * crewCount) / 1000;
  const avionicsHeat = THERMAL.avionicsHeat;

  // Tüm elektrik sonunda ısı olur (kapalı sistem termodinamiği)
  const electricalHeat = powerData ? powerData.totalConsumption : 30;

  const totalHeatGeneration = crewHeat + avionicsHeat + electricalHeat;

  // 2. Isı atımı — radyatör (Stefan-Boltzmann)
  const rad = THERMAL.radiator;
  const sigma = 5.67e-8;
  const maxRadiatorRejection = rad.emissivity * sigma * rad.area *
    (Math.pow(rad.operatingTemp, 4) - Math.pow(rad.sinkTemp, 4)) / 1000;

  // Aktif soğutma kontrolü (hedef sıcaklığa doğru)
  const tempError = currentTemp - THERMAL.cabin.targetTemp;
  const coolingDemand = Math.max(0, totalHeatGeneration * (1 + tempError * 0.05));
  const actualRejection = Math.min(coolingDemand, maxRadiatorRejection);

  // 3. Net ısı akısı
  const netHeatFlux = totalHeatGeneration - actualRejection;

  // 4. Sıcaklık değişimi (°C/tick)
  // ΔT = (Q × Δt) / C_termal
  const deltaTemp = (netHeatFlux * 1000 * (300 * TICK_FRACTION)) / THERMAL.cabin.thermalMass;

  // 5. Durum değerlendirme
  const newTemp = currentTemp + deltaTemp;
  let thermalStatus = 'nominal';
  if (newTemp < THERMAL.cabin.criticalLow || newTemp > THERMAL.cabin.criticalHigh) {
    thermalStatus = 'critical';
  } else if (newTemp < THERMAL.cabin.minSafe || newTemp > THERMAL.cabin.maxSafe) {
    thermalStatus = 'warning';
  }

  return {
    heatSources: {
      crew: crewHeat,
      avionics: avionicsHeat,
      electrical: electricalHeat,
      total: totalHeatGeneration,
    },
    heatRejection: {
      radiatorCapacity: maxRadiatorRejection,
      actualRejection,
      utilizationPercent: maxRadiatorRejection > 0 ? (actualRejection / maxRadiatorRejection) * 100 : 0,
    },
    netHeatFlux,
    deltaTemp,
    currentTemp: newTemp,
    thermalStatus,
    radiatorArea: rad.area,
  };
}
