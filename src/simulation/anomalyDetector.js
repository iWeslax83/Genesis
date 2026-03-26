const HISTORY_WINDOW = 30;

const HISTORY_KEY_MAP = {
  temperature: 'temp',
  pH: 'ph',
};

const MODULE_LIMITS = {
  aeroponic: {
    temperature: { warn: [18, 30], crit: [14, 35], unit: '°C' },
    humidity:    { warn: [40, 80], crit: [25, 95], unit: '%' },
    co2:         { warn: [400, 1500], crit: [200, 2000], unit: 'ppm' },
    pH:          { warn: [5.2, 6.5], crit: [4.5, 7.2], unit: '' },
    ec:          { warn: [1.0, 3.5], crit: [0.5, 4.5], unit: 'mS/cm' },
    ethylene:    { warn: [0, 25], crit: [0, 50], unit: 'ppb' },
  },
  nft: {
    temperature: { warn: [16, 28], crit: [12, 34], unit: '°C' },
    humidity:    { warn: [35, 80], crit: [20, 95], unit: '%' },
    co2:         { warn: [400, 1500], crit: [200, 2000], unit: 'ppm' },
    pH:          { warn: [5.2, 6.5], crit: [4.5, 7.2], unit: '' },
    ec:          { warn: [0.8, 3.0], crit: [0.3, 4.5], unit: 'mS/cm' },
    ethylene:    { warn: [0, 25], crit: [0, 50], unit: 'ppb' },
  },
  spirulina: {
    temperature: { warn: [26, 34], crit: [22, 38], unit: '°C' },
    pH:          { warn: [8.5, 10.5], crit: [7.5, 11.0], unit: '' },
    density:     { warn: [0.3, 2.0], crit: [0.1, 3.0], unit: 'g/L' },
  },
  mushroom: {
    temperature: { warn: [14, 22], crit: [10, 28], unit: '°C' },
    humidity:    { warn: [80, 95], crit: [65, 100], unit: '%' },
    co2:         { warn: [800, 2000], crit: [500, 3000], unit: 'ppm' },
  },
  habitat: {
    o2:          { warn: [19.5, 23.0], crit: [18.0, 25.0], unit: '%' },
    co2:         { warn: [0.02, 0.08], crit: [0.01, 0.15], unit: '%' },
    temperature: { warn: [19, 26], crit: [16, 32], unit: '°C' },
    humidity:    { warn: [30, 65], crit: [20, 80], unit: '%' },
    ethylene:    { warn: [0, 25], crit: [0, 50], unit: 'ppb' },
  },
};

/**
 * Lineer regresyon — trend yönü ve eğim hesapla
 */
function linearRegression(values) {
  const n = values.length;
  if (n < 5) return { slope: 0, intercept: 0, trend: 'stable' };

  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += values[i];
    sumXY += i * values[i];
    sumX2 += i * i;
  }
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  const avgVal = sumY / n;
  const normalizedSlope = avgVal !== 0 ? (slope / Math.abs(avgVal)) * 100 : 0;

  let trend = 'stable';
  if (normalizedSlope > 2) trend = 'rising';
  else if (normalizedSlope < -2) trend = 'falling';

  return { slope, intercept, trend, normalizedSlope };
}

/**
 * 6 saat sonrası tahmin (extrapolation)
 */
function predictFutureValue(history, ticksAhead = 72) {
  const reg = linearRegression(history);
  const predicted = reg.intercept + reg.slope * (history.length + ticksAhead);
  return { predicted, trend: reg.trend, slope: reg.slope };
}

/**
 * Rate-of-change anomali tespiti
 * Son N ölçüm arasındaki değişim hızını hesapla
 */
function detectRateOfChange(history, threshold = 0.3) {
  if (history.length < 6) return null;
  const recent = history.slice(-6);
  const ratePerTick = (recent[recent.length - 1] - recent[0]) / recent.length;
  const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const normalizedRate = avg !== 0 ? Math.abs(ratePerTick / avg) : 0;

  if (normalizedRate > threshold) {
    return { rate: ratePerTick, normalizedRate, direction: ratePerTick > 0 ? 'rising' : 'falling' };
  }
  return null;
}

/**
 * Sliding window anomali tespiti + trend analizi + prediktif uyarılar
 */
export function detectAnomalies(sensorHistory, currentValues, time) {
  const anomalies = [];
  let idCounter = time.day * 100 + time.hour;

  const checks = [
    { module: 'aeroponic', sensors: ['temperature', 'humidity', 'co2', 'pH', 'ec', 'ethylene'] },
    { module: 'nft', sensors: ['temperature', 'humidity', 'co2', 'pH', 'ec', 'ethylene'] },
    { module: 'spirulina', sensors: ['temperature', 'pH', 'density'] },
    { module: 'mushroom', sensors: ['temperature', 'humidity', 'co2'] },
    { module: 'habitat', sensors: ['o2', 'co2', 'temperature', 'humidity', 'ethylene'] },
  ];

  for (const { module, sensors } of checks) {
    for (const sensor of sensors) {
      const historyKey = HISTORY_KEY_MAP[sensor] || sensor;
      const history = sensorHistory[module]?.[historyKey] || [];
      const currentVal = currentValues[module]?.[sensor];

      if (currentVal === undefined) continue;

      const limit = MODULE_LIMITS[module]?.[sensor];

      // 1. Limit kontrolü
      if (limit) {
        if (currentVal < limit.crit[0] || currentVal > limit.crit[1]) {
          anomalies.push({
            id: idCounter++, type: 'limit_breach', severity: 'critical',
            module, sensor, value: currentVal,
            message: `${module} ${sensor}: Kritik seviye (${currentVal.toFixed(2)}${limit.unit})`,
            timestamp: { day: time.day, hour: time.hour },
          });
        } else if (currentVal < limit.warn[0] || currentVal > limit.warn[1]) {
          anomalies.push({
            id: idCounter++, type: 'limit_warning', severity: 'warning',
            module, sensor, value: currentVal,
            message: `${module} ${sensor}: Uyarı aralığında (${currentVal.toFixed(2)}${limit.unit})`,
            timestamp: { day: time.day, hour: time.hour },
          });
        }
      }

      // 2. Spike tespiti
      if (history.length >= 10) {
        const recent = history.slice(-HISTORY_WINDOW);
        const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
        const deviation = Math.abs(currentVal - avg) / Math.max(avg, 0.001);

        if (deviation > 0.5) {
          anomalies.push({
            id: idCounter++, type: 'spike', severity: 'warning',
            module, sensor, value: currentVal, expected: avg,
            message: `${module} ${sensor}: Ani sapma (%${(deviation * 100).toFixed(0)})`,
            timestamp: { day: time.day, hour: time.hour },
          });
        }
      }

      // 3. Rate-of-change tespiti (hızlı değişim uyarısı)
      if (history.length >= 6) {
        const roc = detectRateOfChange(history);
        if (roc) {
          anomalies.push({
            id: idCounter++, type: 'rate_of_change', severity: 'warning',
            module, sensor, value: currentVal,
            message: `${module} ${sensor}: Hızlı ${roc.direction === 'rising' ? 'yükseliş' : 'düşüş'} (${(roc.normalizedRate * 100).toFixed(1)}%/tick)`,
            timestamp: { day: time.day, hour: time.hour },
            trend: roc.direction,
          });
        }
      }

      // 4. Prediktif uyarı — 6 saat sonra limit aşımı tahmini
      if (history.length >= 15 && limit) {
        const prediction = predictFutureValue(history, 72);
        if (prediction.predicted < limit.crit[0] || prediction.predicted > limit.crit[1]) {
          const direction = prediction.predicted > limit.crit[1] ? 'üst' : 'alt';
          anomalies.push({
            id: idCounter++, type: 'predictive', severity: 'warning',
            module, sensor, value: currentVal,
            predicted: prediction.predicted,
            message: `${module} ${sensor}: ~6 saat içinde ${direction} kritik limite ulaşabilir (tahmin: ${prediction.predicted.toFixed(2)}${limit?.unit || ''})`,
            timestamp: { day: time.day, hour: time.hour },
            trend: prediction.trend,
          });
        }
      }
    }
  }

  return anomalies;
}

/**
 * AI tahmin ve öneriler üret — gelişmiş trend analizi ile
 */
export function generateAIInsights(flow, compartments, time, sensorHistory) {
  const insights = [];

  // Kalori önerisi
  const calorieRatio = flow.calories.total / flow.calories.target;
  if (calorieRatio < 0.9) {
    insights.push({
      id: `cal_${time.day}`, type: 'optimization', icon: '💡',
      suggestion: `Kalori üretimi hedefin %${(calorieRatio * 100).toFixed(0)}'inde. Spirulina hasat sıklığını %15 artırın.`,
      impact: `Günlük +${Math.round(flow.calories.target * 0.05)} kcal`,
      confidence: 85,
    });
  }

  // pH önerisi
  if (compartments.growth?.modules?.nft) {
    const nftPH = compartments.growth.modules.nft.pH || 5.8;
    if (nftPH < 5.5 || nftPH > 6.2) {
      insights.push({
        id: `ph_${time.day}`, type: 'maintenance', icon: '🔧',
        suggestion: `NFT modülü pH ${nftPH.toFixed(2)} — kalibrasyon gerektiriyor (optimum: 5.8).`,
        impact: 'Besin alımı %12 artacak', confidence: 92,
      });
    }
  }

  // Ekim önerisi (ardışık ekim bazlı)
  if (time.day % 15 === 0) {
    insights.push({
      id: `plant_${time.day}`, type: 'planting', icon: '🌱',
      suggestion: 'Ardışık ekim takvimi: Yeni marul ve ıspanak partisi öneriliyor (sürekli hasat garantisi).',
      impact: '25-30 gün içinde ek vitamin kaynağı', confidence: 95,
    });
  }

  // O₂ dengesi
  if (flow.oxygen.balance < -100) {
    insights.push({
      id: `o2_${time.day}`, type: 'critical', icon: '⚠️',
      suggestion: `O₂ üretimi yetersiz! Açık: ${Math.abs(Math.round(flow.oxygen.balance))} L/gün. Spirulina reaktör sıcaklığını optimize edin.`,
      impact: 'O₂ üretimi %20 artabilir', confidence: 88,
    });
  }

  // CO₂ birikimi
  if (flow.co2.balance > 500) {
    insights.push({
      id: `co2_${time.day}`, type: 'warning', icon: '🌫️',
      suggestion: `CO₂ birikimi: ${Math.round(flow.co2.balance)} L/gün fazla. Bitki yoğunluğunu artırın veya scrubber devreye alın.`,
      impact: 'Mürettebat güvenliği iyileşir', confidence: 90,
    });
  }

  // Su kaybı
  if (flow.water.recycleRate < 0.95) {
    insights.push({
      id: `water_${time.day}`, type: 'warning', icon: '💧',
      suggestion: `Su geri kazanım oranı %${(flow.water.recycleRate * 100).toFixed(1)} — hedefin altında (%98). Filtre kontrolü yapın.`,
      impact: `Günlük ${flow.water.loss.toFixed(1)} L su kaybı önlenebilir`, confidence: 87,
    });
  }

  // Protein dengesi
  const crewCount = flow.crew?.count || 6;
  const proteinPerPerson = flow.calories.protein / crewCount;
  if (proteinPerPerson < 50) {
    insights.push({
      id: `prot_${time.day}`, type: 'optimization', icon: '🥩',
      suggestion: `Kişi başı protein ${proteinPerPerson.toFixed(0)}g — önerilen min 56g. Soya ve spirulina üretimini artırın.`,
      impact: 'Kas kaybı riski azalır', confidence: 82,
    });
  }

  // Spirulina kontaminasyon riski
  const contRisk = compartments.growth?.modules?.spirulina?.contaminationRisk || 0;
  if (contRisk > 30) {
    insights.push({
      id: `cont_${time.day}`,
      type: contRisk > 70 ? 'critical' : 'warning', icon: '🧬',
      suggestion: `Spirulina kontaminasyon riski %${contRisk.toFixed(0)}. ${
        contRisk > 70
          ? 'Acil: Kültür yenilenmeli ve pH/sıcaklık normale döndürülmeli.'
          : 'pH ve sıcaklık parametrelerini optimize edin.'
      }`,
      impact: contRisk > 70 ? 'O₂ üretimi ve protein kaynağı tehlikede' : 'Erken müdahale kayıpları önler',
      confidence: 78,
    });
  }

  // Mantar substrat
  const subLevel = compartments.growth?.modules?.mushroom?.substrateLevel || 85;
  if (subLevel < 40) {
    insights.push({
      id: `sub_${time.day}`,
      type: subLevel < 20 ? 'critical' : 'warning', icon: '🍄',
      suggestion: `Mantar substratı %${subLevel.toFixed(0)}. ${
        subLevel < 20
          ? 'Kritik düşük! Atık kompartmanından acil substrat aktarımı yapın.'
          : 'Atık işleme hızını artırarak substrat seviyesini yükseltin.'
      }`,
      impact: 'Mantar üretimi ve besin çeşitliliği etkilenir', confidence: 90,
    });
  }

  // Trend bazlı kaynak tükenme tahmini
  if (sensorHistory) {
    // Habitat O₂ trend analizi
    const o2History = sensorHistory.habitat?.o2 || [];
    if (o2History.length >= 20) {
      const reg = linearRegression(o2History.slice(-60));
      if (reg.trend === 'falling' && reg.slope < -0.001) {
        const currentO2 = o2History[o2History.length - 1] || 21;
        const ticksToCritical = (currentO2 - 19.5) / Math.abs(reg.slope);
        const hoursToCritical = (ticksToCritical * 5) / 60;
        if (hoursToCritical < 48 && hoursToCritical > 0) {
          insights.push({
            id: `o2trend_${time.day}`, type: 'critical', icon: '📉',
            suggestion: `O₂ düşüş trendi tespit edildi! Tahmini ~${Math.round(hoursToCritical)} saat içinde kritik seviyeye (19.5%) ulaşabilir.`,
            impact: 'Acil müdahale gerektirir', confidence: 75,
          });
        }
      }
    }

    // Hastalık riski - yüksek nem trendi
    const aeroHumidity = sensorHistory.aeroponic?.humidity || [];
    if (aeroHumidity.length >= 15) {
      const reg = linearRegression(aeroHumidity.slice(-30));
      if (reg.trend === 'rising') {
        const predicted6h = reg.intercept + reg.slope * (aeroHumidity.length + 72);
        if (predicted6h > 80) {
          insights.push({
            id: `humid_${time.day}`, type: 'warning', icon: '🦠',
            suggestion: `Aeroponik nemde yükseliş trendi — 6 saat içinde %${predicted6h.toFixed(0)} tahmini. Patojen riski artabilir.`,
            impact: 'Külleme ve kök çürümesi riski yükselir', confidence: 70,
          });
        }
      }
    }
  }

  return insights;
}
