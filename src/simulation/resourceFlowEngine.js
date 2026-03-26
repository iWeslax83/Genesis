import { CREW, SPIRULINA, MEALWORM, PLANTS, VITAMINS, HABITAT_VOLUME, SUBSTRATE } from './constants';
import {
  calculatePlantGrowth,
  calculateModuleCalories,
  calculateSpirulinaProduction,
  calculateMushroomProduction,
} from './plantGrowthModel';

/**
 * Ana kaynak akış hesaplama — her tick'te çağrılır
 * Tüm kapalı döngüyü bir adımda hesaplar
 */
export function calculateResourceFlow(state) {
  const { compartments, resources, time, scenario } = state;
  const { growth, habitat, waste, nutrient } = compartments;
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

  // ====== 3. NFT Üretim ======
  const nftConditions = {
    temperature: growth.modules.nft.temperature,
    lightPAR: growth.modules.nft.lightPAR,
    co2: growth.modules.nft.co2,
    waterAvailable: true,
  };
  const nftProduction = calculateModuleCalories(
    growth.modules.nft.plants, nftConditions, time.day
  );

  // ====== 4. Spirulina Üretim (kontaminasyon dahil) ======
  const spirulina = calculateSpirulinaProduction(
    growth.modules.spirulina.density,
    growth.modules.spirulina.temperature,
    growth.modules.spirulina.contaminationRisk || 0,
  );

  // ====== 5. Mantar Üretim ======
  const mushroom = calculateMushroomProduction(
    growth.modules.mushroom.temperature,
    growth.modules.mushroom.humidity,
    growth.modules.mushroom.substrateLevel
  );

  // ====== 6. Toplam O₂ / CO₂ Dengesi ======
  const totalO2Production = aeroProduction.totalO2 + nftProduction.totalO2 + spirulina.o2Production;
  const totalCO2Absorption = aeroProduction.totalCO2 + nftProduction.totalCO2 + spirulina.co2Consumption;
  const o2Balance = totalO2Production - crewO2Consumption;
  const co2Balance = crewCO2Production - totalCO2Absorption;

  // ====== 7. Su Döngüsü ======
  const totalPlantWater = aeroProduction.totalWater + nftProduction.totalWater;
  const recycleRate = scenario?.active && scenario.effects?.waterRecycleRate
    ? scenario.effects.waterRecycleRate
    : resources.water.recycleRate;
  const waterRecycled = (totalPlantWater + crewWaterConsumption) * recycleRate;
  const waterLoss = (totalPlantWater + crewWaterConsumption) * (1 - recycleRate);

  // ====== 8. Besin Döngüsü ======
  const wasteProcessed = crewWasteProduction * (waste.decompositionRate || 0.85);
  const nutrientRecycled = wasteProcessed * (nutrient.nitrificationRate || 0.92);

  // ====== 9. Mantar Substrat Dengesi ======
  const substrateConsumption = (mushroom.yield / 714) * SUBSTRATE.depletionRatePerDay;
  const substrateReplenishment = wasteProcessed * SUBSTRATE.replenishRatePerKgWaste;
  const substrateDelta = substrateReplenishment - substrateConsumption;

  // ====== 10. Böcek Protein (Yuegong-1: Tenebrio molitor) ======
  // Yenilenemeyen bitki kısımları (gövde, kök, kabuk) ≈ toplam biyokütlenin %40'ı
  const inedibleBiomass = (aeroProduction.totalWater * 0.3 + nftProduction.totalWater * 0.2); // kg/gün yaklaşık
  const mealwormFeed = Math.min(inedibleBiomass, MEALWORM.dailyCapacity); // kg/gün
  const mealwormYield = mealwormFeed * MEALWORM.yieldPerKgWaste / 1000; // kg/gün
  const mealwormCalories = (mealwormYield * 1000 / 100) * MEALWORM.caloriesPer100g;
  const mealwormProtein = (mealwormYield * 1000 / 100) * MEALWORM.proteinPer100g;
  const mealwormCarbs = (mealwormYield * 1000 / 100) * MEALWORM.carbsPer100g;
  const mealwormFat = (mealwormYield * 1000 / 100) * MEALWORM.fatPer100g;

  // ====== 11. Toplam Kalori ======
  const totalCalories = aeroProduction.totalCalories + nftProduction.totalCalories
    + spirulina.calories + mushroom.calories + mealwormCalories;
  const totalProtein = aeroProduction.totalProtein + nftProduction.totalProtein
    + spirulina.protein + mushroom.protein + mealwormProtein;
  const totalCarbs = aeroProduction.totalCarbs + nftProduction.totalCarbs
    + spirulina.carbs + mushroom.carbs + mealwormCarbs;
  const totalFat = aeroProduction.totalFat + nftProduction.totalFat
    + spirulina.fat + mushroom.fat + mealwormFat;

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
      spirulina,
      mushroom,
      mealworm: { yield: mealwormYield * 1000, calories: mealwormCalories, protein: mealwormProtein, carbs: mealwormCarbs, fat: mealwormFat },
    },
    oxygen: {
      production: totalO2Production,
      consumption: crewO2Consumption,
      balance: o2Balance,
      spirulinaContribution: spirulina.o2Production,
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
    substrate: {
      consumption: substrateConsumption,
      replenishment: substrateReplenishment,
      delta: substrateDelta,
    },
    calories: {
      total: totalCalories,
      target: CREW.caloriePerPersonPerDay * crewCount,
      bySource: {
        aeroponic: aeroProduction.totalCalories,
        nft: nftProduction.totalCalories,
        spirulina: spirulina.calories,
        mushroom: mushroom.calories,
        mealworm: mealwormCalories,
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

  // Spirulina kontaminasyon riski
  const contRisk = compartments.growth?.modules?.spirulina?.contaminationRisk || 0;
  if (contRisk > 50) {
    score -= Math.min(15, (contRisk - 50) / 3);
    issues.push({ type: 'Spirulina kontaminasyon riski', severity: contRisk > 80 ? 'critical' : 'warning' });
  }

  // Mantar substrat
  const subLevel = compartments.growth?.modules?.mushroom?.substrateLevel || 85;
  if (subLevel < 20) {
    score -= 10;
    issues.push({ type: 'Mantar substratı kritik düşük', severity: 'critical' });
  } else if (subLevel < 40) {
    score -= 5;
    issues.push({ type: 'Mantar substratı düşük', severity: 'warning' });
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
  const crewCount = habitat.crewCount || 6;

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

  // Spirulina biyokütle
  const sp = growth.modules.spirulina;
  const spProd = calculateSpirulinaProduction(sp.density, sp.temperature, sp.contaminationRisk || 0);
  yields.spirulina = spProd.biomass;

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
