import { PLANTS, SPIRULINA, MUSHROOM, PHOTOPERIOD, DISSOLVED_OXYGEN } from './constants';

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

    // Günlük verim (büyüme eğrisinin türevi yaklaşımı)
    const growthYesterday = calculatePlantGrowth(plantGroup.type, daysSincePlanting - 1, conditions);
    const dailyYieldPerPlant = Math.max(0, growth.yield - growthYesterday.yield);
    const dailyYield = dailyYieldPerPlant * plantGroup.count; // gram

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

/**
 * Spirulina günlük üretim
 */
export function calculateSpirulinaProduction(density, temperature, contaminationRisk = 0) {
  const tempFactor = gaussianFactor(temperature, SPIRULINA.optimalTemp, 4);
  const densityFactor = Math.min(density / 1.0, 1.5);
  const contaminationFactor = contaminationRisk > 50
    ? 1 - (contaminationRisk - 50) / 100
    : 1.0;

  const dailyBiomass = SPIRULINA.productivityPerM2Day * SPIRULINA.surfaceArea * tempFactor * densityFactor * contaminationFactor;
  const dailyCalories = (dailyBiomass / 100) * SPIRULINA.caloriesPer100g;
  const dailyProtein = (dailyBiomass / 100) * SPIRULINA.proteinPer100g;
  const dailyO2 = (dailyBiomass / 1000) * SPIRULINA.o2ProductionPerKg;
  const dailyCO2consumed = (dailyBiomass / 1000) * SPIRULINA.co2ConsumptionPerKg;

  return {
    biomass: dailyBiomass,
    calories: dailyCalories,
    protein: dailyProtein,
    carbs: (dailyBiomass / 100) * SPIRULINA.carbsPer100g,
    fat: (dailyBiomass / 100) * SPIRULINA.fatPer100g,
    o2Production: dailyO2,
    co2Consumption: dailyCO2consumed,
  };
}

/**
 * Mantar günlük üretim
 */
export function calculateMushroomProduction(temperature, humidity, substrateLevel) {
  const tempFactor = gaussianFactor(temperature, MUSHROOM.optimalTemp, 3);
  const humFactor = gaussianFactor(humidity, MUSHROOM.optimalHumidity, 8);
  const substrateFactor = Math.min(substrateLevel / 50, 1);

  const dailyYield = MUSHROOM.dailyYield * tempFactor * humFactor * substrateFactor;
  const dailyCalories = (dailyYield / 100) * MUSHROOM.caloriesPer100g;

  return {
    yield: dailyYield,
    calories: dailyCalories,
    protein: (dailyYield / 100) * MUSHROOM.proteinPer100g,
    carbs: (dailyYield / 100) * MUSHROOM.carbsPer100g,
    fat: (dailyYield / 100) * MUSHROOM.fatPer100g,
  };
}
