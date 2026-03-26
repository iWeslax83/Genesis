import { SENSOR_CONFIGS } from './constants';

// Gaussian-ish random (Box-Muller yaklaşımı)
function gaussRandom() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

/**
 * Sensör değeri üret: base + sinüzoidal döngü + gürültü + trend
 */
export function generateSensorValue(config, time, scenarioMultiplier = 1) {
  const { base, amplitude, period, noiseLevel, trend, nightZero } = config;

  // LED'ler 16 saat açık, 8 saat kapalı (saat 6-22 arası açık)
  if (nightZero && (time.hour < 6 || time.hour >= 22)) {
    return Math.max(0, noiseLevel * gaussRandom() * 0.5);
  }

  const hourFraction = time.hour + time.minute / 60;
  const dailyCycle = amplitude * Math.sin((2 * Math.PI * hourFraction) / period);
  const noise = noiseLevel * gaussRandom();
  const longTrend = (trend || 0) * time.day * 0.01;

  return (base + dailyCycle + noise + longTrend) * scenarioMultiplier;
}

/**
 * Bir modülün tüm sensörlerini güncelle
 */
export function generateModuleSensors(moduleId, time, scenario = null) {
  const configs = SENSOR_CONFIGS[moduleId];
  if (!configs) return {};

  const result = {};
  for (const [sensorName, config] of Object.entries(configs)) {
    let multiplier = 1;

    // Senaryo etkileri
    if (scenario) {
      if (moduleId === 'aeroponic' && sensorName === 'par' && scenario.effects?.aeroponicPAR) {
        multiplier = scenario.effects.aeroponicPAR;
      }
      if (moduleId === 'habitat' && sensorName === 'co2' && scenario.effects?.habitatCO2) {
        multiplier = scenario.effects.habitatCO2;
      }
      if (moduleId === 'spirulina' && sensorName === 'density' && scenario.effects?.spirulinaDensity) {
        multiplier = scenario.effects.spirulinaDensity;
      }
    }

    result[sensorName] = Math.max(0, generateSensorValue(config, time, multiplier));
  }

  return result;
}

/**
 * Tüm modüllerin sensörlerini tek seferde üret
 */
export function generateAllSensors(time, scenario = null) {
  return {
    aeroponic: generateModuleSensors('aeroponic', time, scenario),
    nft: generateModuleSensors('nft', time, scenario),
    spirulina: generateModuleSensors('spirulina', time, scenario),
    mushroom: generateModuleSensors('mushroom', time, scenario),
    habitat: generateModuleSensors('habitat', time, scenario),
  };
}

/**
 * Durum belirleme (nominal / warning / critical)
 * moduleId parametresi opsiyonel — modül bazlı limit desteği
 */
export function getSensorStatus(value, sensorType, moduleId = null) {
  // Modül bazlı limitler
  const moduleLimits = {
    spirulina: {
      pH: { warn: [8.5, 10.5], crit: [7.5, 11.0] },
      temperature: { warn: [26, 34], crit: [22, 38] },
    },
    mushroom: {
      temperature: { warn: [14, 22], crit: [10, 28] },
      humidity: { warn: [80, 95], crit: [65, 100] },
      co2: { warn: [800, 2000], crit: [500, 3000] },
    },
    habitat: {
      o2: { warn: [19.5, 23.0], crit: [18.0, 25.0] },
      co2: { warn: [0.02, 0.08], crit: [0.01, 0.15] },
    },
  };

  // Genel limitler (aeroponic, nft vb.)
  const defaultLimits = {
    temperature: { warn: [16, 32], crit: [12, 38] },
    humidity: { warn: [35, 85], crit: [20, 95] },
    co2: { warn: [400, 1800], crit: [200, 2500] },
    pH: { warn: [5.0, 6.8], crit: [4.0, 7.5] },
    ec: { warn: [0.5, 4.0], crit: [0.2, 5.5] },
    par: { warn: [80, 1100], crit: [30, 1500] },
    o2: { warn: [19.0, 23.5], crit: [17.0, 25.0] },
    density: { warn: [0.3, 2.0], crit: [0.1, 3.0] },
  };

  const limit = moduleLimits[moduleId]?.[sensorType] || defaultLimits[sensorType];
  if (!limit) return 'nominal';

  if (value < limit.crit[0] || value > limit.crit[1]) return 'critical';
  if (value < limit.warn[0] || value > limit.warn[1]) return 'warning';
  return 'nominal';
}
