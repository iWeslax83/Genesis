import { CREW, PLANTS, VITAMINS } from './constants';
import {
  calculatePlantGrowth,
  calculateModuleCalories,
} from './plantGrowthModel';

/**
 * Ana kaynak akış hesaplama — her tick'te çağrılır
 * Tüm kapalı döngüyü bir adımda hesaplar
 */
export function calculateResourceFlow(state) {
  const { compartments, resources, time, scenario, pathogens, radiation } = state;
  const { growth, habitat, waste, nutrient } = compartments;

  // Patojen verim cezası (önceki tick'ten)
  const aeroYieldPenalty = pathogens?.aeroponic?.yieldPenalty || 0;
  const nftYieldPenalty = pathogens?.nft?.yieldPenalty || 0;
  // Radyasyon bitki büyüme cezası (SPE sırasında)
  const radiationPenalty = radiation?.cropGrowthPenalty || 0;
  const crewCount = scenario?.active && scenario.effects?.crewCount
    ? scenario.effects.crewCount
    : habitat.crewCount;

  // ====== 1. Mürettebat Tüketimi ======
  const crewO2Consumption = CREW.o2PerPersonPerDay * crewCount;
  const crewCO2Production = CREW.co2PerPersonPerDay * crewCount;
  const crewWaterConsumption = CREW.waterPerPersonPerDay * crewCount;
  const crewWasteProduction = CREW.wastePerPersonPerDay * crewCount;

  // ====== 2. Aeroponik Üretim ======
  const aeroConditions = {
    temperature: growth.modules.aeroponic.temperature,
    lightPAR: growth.modules.aeroponic.lightPAR,
    co2: growth.modules.aeroponic.co2,
    waterAvailable: true,
  };
  const aeroProduction = calculateModuleCalories(
    growth.modules.aeroponic.plants, aeroConditions, time.day
  );

  // ====== 3. Aeroponik Yaprak Üretim ======
  const nftConditions = {
    temperature: growth.modules.nft.temperature,
    lightPAR: growth.modules.nft.lightPAR,
    co2: growth.modules.nft.co2,
    waterAvailable: true,
  };
  const nftProduction = calculateModuleCalories(
    growth.modules.nft.plants, nftConditions, time.day
  );

  // ====== 4. Patojen + Radyasyon Cezası Uygulama ======
  const aeroPenalty = (1 - aeroYieldPenalty) * (1 - radiationPenalty);
  const nftPenalty = (1 - nftYieldPenalty) * (1 - radiationPenalty);

  aeroProduction.totalCalories *= aeroPenalty;
  aeroProduction.totalProtein *= aeroPenalty;
  aeroProduction.totalCarbs *= aeroPenalty;
  aeroProduction.totalFat *= aeroPenalty;
  aeroProduction.totalO2 *= aeroPenalty;
  aeroProduction.totalCO2 *= aeroPenalty;

  nftProduction.totalCalories *= nftPenalty;
  nftProduction.totalProtein *= nftPenalty;
  nftProduction.totalCarbs *= nftPenalty;
  nftProduction.totalFat *= nftPenalty;
  nftProduction.totalO2 *= nftPenalty;
  nftProduction.totalCO2 *= nftPenalty;

  // ====== 5. Toplam O₂ / CO₂ Dengesi ======
  const totalO2Production = aeroProduction.totalO2 + nftProduction.totalO2;
  const totalCO2Absorption = aeroProduction.totalCO2 + nftProduction.totalCO2;
  const o2Balance = totalO2Production - crewO2Consumption;
  const co2Balance = crewCO2Production - totalCO2Absorption;

  // ====== 6. Su Döngüsü ======
  const totalPlantWater = aeroProduction.totalWater + nftProduction.totalWater;
  const recycleRate = scenario?.active && scenario.effects?.waterRecycleRate
    ? scenario.effects.waterRecycleRate
    : resources.water.recycleRate;
  const waterRecycled = (totalPlantWater + crewWaterConsumption) * recycleRate;
  const waterLoss = (totalPlantWater + crewWaterConsumption) * (1 - recycleRate);

  // ====== 7. Besin Döngüsü ======
  const wasteProcessed = crewWasteProduction * (waste.decompositionRate || 0.85);
  const nutrientRecycled = wasteProcessed * (nutrient.nitrificationRate || 0.92);

  // ====== 8. Toplam Kalori ======
  const totalCalories = aeroProduction.totalCalories + nftProduction.totalCalories;
  const totalProtein = aeroProduction.totalProtein + nftProduction.totalProtein;
  const totalCarbs = aeroProduction.totalCarbs + nftProduction.totalCarbs;
  const totalFat = aeroProduction.totalFat + nftProduction.totalFat;

  const result = {
    crew: {
      count: crewCount,
      o2Consumption: crewO2Consumption,
      co2Production: crewCO2Production,
      waterConsumption: crewWaterConsumption,
      wasteProduction: crewWasteProduction,
    },
    production: {
      aeroponic: aeroProduction,
      nft: nftProduction,
    },
    oxygen: {
      production: totalO2Production,
      consumption: crewO2Consumption,
      balance: o2Balance,
    },
    co2: {
      production: crewCO2Production,
      absorption: totalCO2Absorption,
      balance: co2Balance,
    },
    water: {
      totalConsumption: totalPlantWater + crewWaterConsumption,
      recycled: waterRecycled,
      loss: waterLoss,
      recycleRate,
    },
    nutrients: {
      wasteProcessed,
      nutrientRecycled,
      recyclePercent: wasteProcessed > 0 ? (nutrientRecycled / wasteProcessed) * 100 : 0,
    },
    calories: {
      total: totalCalories,
      target: CREW.caloriePerPersonPerDay * crewCount,
      bySource: {
        aeroponic: aeroProduction.totalCalories,
        nft: nftProduction.totalCalories,
      },
      protein: totalProtein,
      carbs: totalCarbs,
      fat: totalFat,
    },
    // Kapalılık oranları (BLSS temel metriği)
    closure: {
      o2: crewO2Consumption > 0 ? Math.min(100, (totalO2Production / crewO2Consumption) * 100) : 100,
      co2: crewCO2Production > 0 ? Math.min(100, (totalCO2Absorption / crewCO2Production) * 100) : 100,
      water: recycleRate * 100,
      food: (CREW.caloriePerPersonPerDay * crewCount) > 0
        ? Math.min(100, (totalCalories / (CREW.caloriePerPersonPerDay * crewCount)) * 100)
        : 100,
      material: 0,
    },
  };

  // Toplam malzeme kapalılık oranı
  result.closure.material = (
    result.closure.o2 * 0.25 +
    result.closure.co2 * 0.25 +
    result.closure.water * 0.25 +
    result.closure.food * 0.25
  );

  return result;
}

/**
 * Sistem sağlık skoru (0-100)
 */
export function calculateHealthScore(flow, compartments) {
  let score = 100;
  const issues = [];

  // O₂ dengesi
  if (flow.oxygen.balance < 0) {
    score -= Math.min(30, Math.abs(flow.oxygen.balance) / 100);
    issues.push({ type: 'O₂ açığı', severity: 'critical' });
  }

  // CO₂ dengesi
  if (flow.co2.balance > 0) {
    score -= Math.min(20, flow.co2.balance / 200);
    issues.push({ type: 'CO₂ birikimi', severity: 'warning' });
  }

  // Kalori yeterliliği
  const calorieRatio = flow.calories.total / flow.calories.target;
  if (calorieRatio < 0.8) {
    score -= (1 - calorieRatio) * 30;
    issues.push({ type: 'Kalori yetersiz', severity: calorieRatio < 0.5 ? 'critical' : 'warning' });
  }

  // Su kaybı
  if (flow.water.recycleRate < 0.95) {
    score -= (0.98 - flow.water.recycleRate) * 100;
    issues.push({ type: 'Su kaybı yüksek', severity: 'warning' });
  }

  // Kompartman durumları
  for (const [key, comp] of Object.entries(compartments)) {
    if (key === 'growth' && comp.modules) {
      // Growth kompartmanının alt modüllerini de kontrol et
      for (const [, mod] of Object.entries(comp.modules)) {
        if (mod.status === 'critical') { score -= 5; }
        else if (mod.status === 'warning') { score -= 2; }
      }
    }
    if (comp.status === 'critical') { score -= 10; }
    else if (comp.status === 'warning') { score -= 3; }
  }

  return {
    score: Math.max(0, Math.min(100, Math.round(score))),
    issues,
  };
}

/**
 * Vitamin/mineral günlük alım hesaplama
 * Her bitkinin günlük veriminden vitamin katkısını hesaplar
 */
export function calculateVitaminIntake(state) {
  const { compartments, time } = state;
  const { growth, habitat } = compartments;
  const crewCount = habitat.crewCount || 1;

  // Bitki türü bazında günlük verim (g/gün)
  const yields = {};

  for (const moduleKey of ['aeroponic', 'nft']) {
    const mod = growth.modules[moduleKey];
    const conditions = {
      temperature: mod.temperature,
      lightPAR: mod.lightPAR,
      co2: mod.co2,
      waterAvailable: true,
    };

    for (const pg of mod.plants) {
      const plantDef = PLANTS[pg.type];
      if (!plantDef) continue;
      const day = time.day - pg.plantedDay;
      const g1 = calculatePlantGrowth(pg.type, day, conditions);
      const g0 = calculatePlantGrowth(pg.type, day - 1, conditions);
      const dailyPerPlant = Math.max(0, g1.yield - g0.yield);
      yields[pg.type] = (yields[pg.type] || 0) + dailyPerPlant * pg.count;
    }
  }

  // Vitamin bazında alım hesapla
  const intake = {};
  for (const [vitKey, vit] of Object.entries(VITAMINS)) {
    let totalDaily = 0;
    for (const [source, per100g] of Object.entries(vit.sources)) {
      totalDaily += ((yields[source] || 0) / 100) * per100g;
    }
    const perPerson = totalDaily / crewCount;
    const ratio = vit.dailyNeed > 0 ? perPerson / vit.dailyNeed : 0;
    intake[vitKey] = {
      name: vit.name,
      unit: vit.unit,
      dailyNeed: vit.dailyNeed,
      dailyIntake: perPerson,
      ratio,
      status: ratio >= 1.0 ? 'sufficient' : ratio >= 0.7 ? 'low' : 'deficient',
    };
  }

  return intake;
}

/**
 * Beslenme çeşitliliği — Shannon Biyoçeşitlilik İndeksi
 * Daha yüksek = kalori kaynakları daha eşit dağılmış
 * 0-100 ölçeğine normalize edilir
 */
export function calculateBiodiversityScore(caloriesBySource) {
  const sources = Object.values(caloriesBySource).filter(v => v > 0);
  if (sources.length <= 1) return 0;

  const total = sources.reduce((a, b) => a + b, 0);
  if (total === 0) return 0;

  // Shannon diversity index: H = -Σ(pi × ln(pi))
  let H = 0;
  for (const val of sources) {
    const p = val / total;
    if (p > 0) H -= p * Math.log(p);
  }

  // Normalize: max H = ln(n), n = kaynak sayısı
  const maxH = Math.log(sources.length);
  return maxH > 0 ? Math.round((H / maxH) * 100) : 0;
}
