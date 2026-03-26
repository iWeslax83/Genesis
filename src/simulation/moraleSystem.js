import { MORALE } from './constants';

/**
 * Mürettebat moral indeksi hesaplama
 * Lunar Palace 1, Eden ISS, ISS bahçecilik araştırmaları referansı
 */
export function calculateMorale(state) {
  const { compartments, resources, time } = state;
  const factors = {};
  let totalScore = 0;

  // 1. Gıda Çeşitliliği (biyoçeşitlilik indeksinden)
  const biodiversity = resources.biodiversityScore || 0;
  factors.foodVariety = {
    score: biodiversity,
    label: MORALE.factors.foodVariety.label,
    weight: MORALE.factors.foodVariety.weight,
  };
  totalScore += biodiversity * MORALE.factors.foodVariety.weight;

  // 2. Taze Gıda Oranı (üretim / hedef)
  const calorieRatio = resources.calories.dailyTarget > 0
    ? Math.min(100, (resources.calories.dailyProduction / resources.calories.dailyTarget) * 100)
    : 0;
  factors.freshFood = {
    score: calorieRatio,
    label: MORALE.factors.freshFood.label,
    weight: MORALE.factors.freshFood.weight,
  };
  totalScore += calorieRatio * MORALE.factors.freshFood.weight;

  // 3. Son Hasat Süresi
  const harvestLog = compartments.growth.harvestLog || [];
  const lastHarvest = harvestLog.length > 0 ? harvestLog[harvestLog.length - 1] : null;
  const daysSinceHarvest = lastHarvest ? time.day - lastHarvest.day : 30;
  const harvestScore = Math.max(0, 100 - daysSinceHarvest * 10); // Her gün 10 puan düşüş
  factors.lastHarvest = {
    score: harvestScore,
    label: MORALE.factors.lastHarvest.label,
    weight: MORALE.factors.lastHarvest.weight,
  };
  totalScore += harvestScore * MORALE.factors.lastHarvest.weight;

  // 4. İş Yükü (düşük iş yükü = yüksek moral)
  const workloadScore = 65; // Nominal iş yükünde orta-yüksek
  factors.workload = {
    score: workloadScore,
    label: MORALE.factors.workload.label,
    weight: MORALE.factors.workload.weight,
  };
  totalScore += workloadScore * MORALE.factors.workload.weight;

  // 5. Bahçecilik Süresi (program bazlı)
  const gardeningScore = 70; // Varsayılan 2 saat/gün
  factors.gardeningTime = {
    score: gardeningScore,
    label: MORALE.factors.gardeningTime.label,
    weight: MORALE.factors.gardeningTime.weight,
  };
  totalScore += gardeningScore * MORALE.factors.gardeningTime.weight;

  // 6. Lüks Ürünler (çilek, domates, biber)
  const luxuryCropsGrowing = MORALE.luxuryCrops.filter(crop => {
    const allPlants = [
      ...(compartments.growth.modules.aeroponic.plants || []),
      ...(compartments.growth.modules.nft.plants || []),
    ];
    return allPlants.some(p => p.type === crop);
  });
  const luxuryScore = (luxuryCropsGrowing.length / MORALE.luxuryCrops.length) * 100;
  factors.luxuryCrops = {
    score: luxuryScore,
    label: MORALE.factors.luxuryCrops.label,
    weight: MORALE.factors.luxuryCrops.weight,
  };
  totalScore += luxuryScore * MORALE.factors.luxuryCrops.weight;

  // Verimlilik etkisi
  const moraleScore = Math.round(Math.max(0, Math.min(100, totalScore)));
  const isLow = moraleScore < MORALE.lowMoraleThreshold;
  const efficiencyMultiplier = isLow ? (1 - MORALE.efficiencyPenalty) : 1.0;

  return {
    score: moraleScore,
    factors,
    isLow,
    efficiencyMultiplier,
    status: moraleScore >= 70 ? 'good' : moraleScore >= 40 ? 'moderate' : 'low',
  };
}
