import { PLANTS, PHOTOPERIOD, DISSOLVED_OXYGEN } from './constants';

/**
 * Gaussian faktör — optimum değerden sapma cezası
 */
function gaussianFactor(value, optimum, sigma) {
  const diff = value - optimum;
  return Math.exp(-(diff * diff) / (2 * sigma * sigma));
}

/**
 * Bitkinin mevcut büyüme aşamasını belirle (İklim Reçetesi)
 */
export function getCurrentGrowthPhase(plantType, daysSincePlanting) {
  const plant = PLANTS[plantType];
  if (!plant?.growthPhases) return null;

  const day = Math.max(0, daysSincePlanting);
  for (let i = plant.growthPhases.length - 1; i >= 0; i--) {
    if (day >= plant.growthPhases[i].dayStart) {
      return { ...plant.growthPhases[i], index: i, totalPhases: plant.growthPhases.length };
    }
  }
  return { ...plant.growthPhases[0], index: 0, totalPhases: plant.growthPhases.length };
}

/**
 * Günlük Işık İntegrali (DLI) hesapla
 * DLI = PPFD (µmol/m²/s) × fotoperiod (saat) × 3600 / 1,000,000
 * Birim: mol/m²/gün
 */
export function calculateDLI(ppfd, photoperiodHours = PHOTOPERIOD.totalLight) {
  return (ppfd * photoperiodHours * 3600) / 1000000;
}

/**
 * DLI tabanlı büyüme çarpanı
 */
function dliGrowthFactor(actualDLI, plantType) {
  const plant = PLANTS[plantType];
  if (!plant?.dliOptimal) return 1.0;

  const ratio = actualDLI / plant.dliOptimal;
  if (ratio < plant.dliMin / plant.dliOptimal) return 0.3; // Çok düşük ışık
  if (ratio > plant.dliMax / plant.dliOptimal) return 0.9; // Fazla ışık stresi
  return Math.min(1.2, ratio);
}

/**
 * Büyüme Derece Günü (GDD) hesapla
 * GDD = max(0, T_ortalama - T_taban)
 * Kümülatif GDD ile olgunluk yüzdesi belirlenir
 */
export function calculateGDD(avgTemp, plantType) {
  const plant = PLANTS[plantType];
  if (!plant?.gddBase) return { dailyGDD: 0, factor: 1.0 };

  const dailyGDD = Math.max(0, avgTemp - plant.gddBase);
  return { dailyGDD };
}

/**
 * GDD tabanlı olgunluk yüzdesi
 */
export function gddMaturityPercent(cumulativeGDD, plantType) {
  const plant = PLANTS[plantType];
  if (!plant?.gddToMaturity) return null;
  return Math.min(1.0, cumulativeGDD / plant.gddToMaturity);
}

/**
 * Çözünmüş oksijen hesaplama
 * DO_sat = 14.6 - 0.39*T + 0.007*T² (mg/L)
 */
export function calculateDissolvedOxygen(waterTemp, aerationActive = true) {
  const { a, b, c } = DISSOLVED_OXYGEN.saturationCoeffs;
  const saturation = a + b * waterTemp + c * waterTemp * waterTemp;
  const actualDO = saturation * (aerationActive ? DISSOLVED_OXYGEN.aerationEfficiency : 0.5);
  const rootHealthFactor = actualDO >= DISSOLVED_OXYGEN.minHealthy
    ? 1.0
    : Math.max(0.3, (actualDO / DISSOLVED_OXYGEN.minHealthy) * 0.7 + 0.3);
  const pythiumRisk = actualDO < DISSOLVED_OXYGEN.pythiumRiskThreshold
    ? Math.min(1, (DISSOLVED_OXYGEN.pythiumRiskThreshold - actualDO) / 2)
    : 0;

  return { saturation, actualDO, rootHealthFactor, pythiumRisk };
}

/**
 * İklim reçetesi tabanlı çevresel uyum skoru
 * Mevcut koşulların, bitkinin o aşamadaki ideal koşullarına yakınlığı
 */
function recipeComplianceFactor(phase, conditions) {
  if (!phase) return 1.0;

  const tempScore = gaussianFactor(conditions.temperature || phase.temp, phase.temp, 4);
  const humScore = gaussianFactor(conditions.humidity || phase.humidity, phase.humidity, 15);
  const co2Score = conditions.co2 ? Math.min(1.2, conditions.co2 / Math.max(phase.co2, 400)) : 1.0;

  return Math.max(0.2, tempScore * 0.4 + humScore * 0.2 + co2Score * 0.4);
}

/**
 * Sigmoid (lojistik) büyüme eğrisi — GDD + DLI + İklim Reçetesi entegre
 * growth(t) = maxYield / (1 + e^(-k * (t - t_mid)))
 */
export function calculatePlantGrowth(plantType, daysSincePlanting, conditions = {}) {
  const plant = PLANTS[plantType];
  if (!plant) return { yield: 0, progress: 0 };

  const { growthDays, yieldPerPlant } = plant;
  const tMid = growthDays / 2;
  const k = 8 / growthDays;

  // Çevresel etki çarpanları
  const temp = conditions.temperature || plant.optimalTemp;
  const par = conditions.lightPAR || 400;
  const co2 = conditions.co2 || 800;
  const waterOk = conditions.waterAvailable !== false;

  const tempFactor = gaussianFactor(temp, plant.optimalTemp, 5);
  const lightFactor = Math.min(par / 400, 1.2);
  const waterFactor = waterOk ? 1.0 : 0.3;
  const co2Factor = Math.min(co2 / 600, 1.3);

  // DLI tabanlı ışık çarpanı
  const dli = calculateDLI(par);
  const dliFactor = dliGrowthFactor(dli, plantType);

  // İklim reçetesi uyum çarpanı
  const phase = getCurrentGrowthPhase(plantType, daysSincePlanting);
  const recipeFactor = recipeComplianceFactor(phase, conditions);

  // Çözünmüş oksijen etkisi (kök sağlığı)
  const doResult = calculateDissolvedOxygen(conditions.waterTemp || temp - 2);
  const doFactor = doResult.rootHealthFactor;

  // Hibrit çarpan: mevcut + yeni biyolojik faktörler
  const envMultiplier = Math.max(0.1,
    tempFactor * 0.25 +
    lightFactor * 0.15 +
    dliFactor * 0.15 +
    waterFactor * 0.1 +
    co2Factor * 0.15 +
    recipeFactor * 0.1 +
    doFactor * 0.1
  );

  const day = Math.max(0, daysSincePlanting);
  const progress = Math.min(1, day / growthDays);
  const rawYield = yieldPerPlant / (1 + Math.exp(-k * (day - tMid)));

  // GDD tabanlı olgunluk (varsa)
  const gddInfo = calculateGDD(temp, plantType);
  const gddProgress = plant.gddToMaturity
    ? gddMaturityPercent((gddInfo.dailyGDD * day), plantType)
    : null;

  return {
    yield: rawYield * envMultiplier,
    progress,
    envMultiplier,
    isReady: day >= growthDays * 0.9,
    daysRemaining: Math.max(0, growthDays - day),
    // Yeni biyolojik veriler
    currentPhase: phase,
    dli,
    dliFactor,
    gddDaily: gddInfo.dailyGDD,
    gddProgress,
    dissolvedOxygen: doResult,
    recipeFactor,
  };
}

/**
 * Bir modüldeki tüm bitkilerin toplam kalori üretimini hesapla
 *
 * Referans bazlı model: edibleYieldPerM2Day (NASA CELSS BPC / Eden ISS gerçek ölçüm)
 * değerlerini temel alır. Bitki büyüme ilerlemesi ve çevresel koşullar çarpan olarak uygulanır.
 *
 * Eski model: sigmoid türevi (günlük artış) → çok küçük değerler üretiyordu
 * Yeni model: referans verim × alan × ilerleme × çevre → gerçekçi üretim
 */
export function calculateModuleCalories(plants, conditions, currentDay) {
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  let totalWater = 0;
  let totalO2 = 0;
  let totalCO2 = 0;

  for (const plantGroup of plants) {
    const plantDef = PLANTS[plantGroup.type];
    if (!plantDef) continue;

    const daysSincePlanting = currentDay - plantGroup.plantedDay;
    const growth = calculatePlantGrowth(plantGroup.type, daysSincePlanting, conditions);

    // Referans bazlı günlük verim hesabı:
    // edibleYieldPerM2Day → birim alan başına günlük verim (g/m²/gün) — gerçek deney verisi
    // area → bitki başına alan (m²)
    // count → bitki sayısı
    // progressFactor → büyüme aşamasına bağlı üretim çarpanı
    //   - Çimlenme (0-15%): 0 (henüz hasat yok)
    //   - Fide (15-30%): lineer ramp 0→0.3
    //   - Vejetatif (30-60%): lineer ramp 0.3→0.8
    //   - Üretim/Olgunluk (60-100%): 0.8→1.0
    const p = growth.progress;
    let progressFactor;
    if (p < 0.15) progressFactor = 0;
    else if (p < 0.30) progressFactor = ((p - 0.15) / 0.15) * 0.3;
    else if (p < 0.60) progressFactor = 0.3 + ((p - 0.30) / 0.30) * 0.5;
    else progressFactor = 0.8 + ((p - 0.60) / 0.40) * 0.2;

    const cropArea = plantDef.area * plantGroup.count; // toplam alan (m²)
    const refYield = plantDef.edibleYieldPerM2Day || 10; // g/m²/gün referans
    const dailyYield = refYield * cropArea * progressFactor * growth.envMultiplier; // gram/gün

    totalCalories += (dailyYield / 100) * plantDef.caloriesPer100g;
    totalProtein += (dailyYield / 100) * plantDef.proteinPer100g;
    totalCarbs += (dailyYield / 100) * plantDef.carbsPer100g;
    totalFat += (dailyYield / 100) * plantDef.fatPer100g;
    totalWater += plantDef.waterPerDay * plantGroup.count;
    totalO2 += plantDef.o2PerDay * plantGroup.count * growth.progress;
    totalCO2 += plantDef.co2PerDay * plantGroup.count * growth.progress;
  }

  return { totalCalories, totalProtein, totalCarbs, totalFat, totalWater, totalO2, totalCO2 };
}

