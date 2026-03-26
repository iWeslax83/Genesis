import { PLANTS, SUCCESSION } from './constants';

/**
 * Ardışık Ekim Planlayıcı (Succession Planting)
 * Sürekli hasat garantisi için kademeli ekim takvimi hesaplar
 *
 * Referans: Eden ISS kesintisiz hasat stratejisi,
 * Yuegong-1 ardışık ekim planı (370 gün, 4 kişi)
 */

/**
 * Bir bitki türü için ardışık ekim takvimi oluştur
 */
export function generateSuccessionSchedule(plantType, startDay, totalDays, baseCount) {
  const plant = PLANTS[plantType];
  if (!plant?.successionInterval) return [];

  const schedule = [];
  const interval = plant.successionInterval;
  const maxBatches = SUCCESSION.maxBatchesPerCrop;
  let currentDay = startDay;
  let batchIndex = 0;

  while (currentDay < startDay + totalDays && batchIndex < maxBatches * 3) {
    const count = Math.max(
      Math.round(baseCount * (1 - SUCCESSION.staggerPercent * Math.min(batchIndex, 2))),
      Math.round(baseCount * 0.5)
    );

    schedule.push({
      plantType,
      plantDay: currentDay,
      expectedHarvestDay: currentDay + plant.growthDays,
      count,
      batchIndex,
      status: 'planned', // planned, active, harvested
    });

    currentDay += interval;
    batchIndex++;
  }

  return schedule;
}

/**
 * Tüm bitkiler için optimal ardışık ekim planı oluştur
 */
export function generateFullSuccessionPlan(currentPlants, currentDay, planHorizon = 180) {
  const plan = {};

  for (const plantGroup of [...(currentPlants.aeroponic || []), ...(currentPlants.nft || [])]) {
    const plant = PLANTS[plantGroup.type];
    if (!plant?.successionInterval) continue;

    plan[plantGroup.type] = {
      plantName: plant.name,
      module: plant.module,
      growthDays: plant.growthDays,
      interval: plant.successionInterval,
      schedule: generateSuccessionSchedule(
        plantGroup.type,
        currentDay,
        planHorizon,
        plantGroup.count
      ),
    };
  }

  return plan;
}

/**
 * Yaklaşan ekim ve hasat etkinliklerini hesapla (sonraki N gün)
 */
export function getUpcomingEvents(successionPlan, currentDay, lookAheadDays = 14) {
  const events = [];

  for (const [cropType, cropPlan] of Object.entries(successionPlan)) {
    for (const batch of cropPlan.schedule) {
      // Ekim yaklaşıyor
      if (batch.plantDay >= currentDay && batch.plantDay <= currentDay + lookAheadDays) {
        events.push({
          type: 'planting',
          crop: cropType,
          cropName: cropPlan.plantName,
          module: cropPlan.module,
          day: batch.plantDay,
          daysUntil: batch.plantDay - currentDay,
          count: batch.count,
          batchIndex: batch.batchIndex,
        });
      }

      // Hasat yaklaşıyor
      if (batch.expectedHarvestDay >= currentDay && batch.expectedHarvestDay <= currentDay + lookAheadDays) {
        events.push({
          type: 'harvest',
          crop: cropType,
          cropName: cropPlan.plantName,
          module: cropPlan.module,
          day: batch.expectedHarvestDay,
          daysUntil: batch.expectedHarvestDay - currentDay,
          count: batch.count,
          batchIndex: batch.batchIndex,
        });
      }
    }
  }

  // Tarihe göre sırala
  events.sort((a, b) => a.day - b.day);
  return events;
}

/**
 * Sürekli üretim analizi — hasat boşluk tespiti
 */
export function analyzeProductionContinuity(successionPlan, currentDay, analysisDays = 60) {
  const dailyHarvests = {};

  for (let d = currentDay; d < currentDay + analysisDays; d++) {
    dailyHarvests[d] = [];
  }

  for (const [cropType, cropPlan] of Object.entries(successionPlan)) {
    for (const batch of cropPlan.schedule) {
      const harvestDay = batch.expectedHarvestDay;
      if (harvestDay >= currentDay && harvestDay < currentDay + analysisDays) {
        dailyHarvests[harvestDay].push({
          crop: cropType,
          cropName: cropPlan.plantName,
          count: batch.count,
        });
      }
    }
  }

  // Boşluk tespiti: 7 gün ardışık hasatsız dönem
  const gaps = [];
  let gapStart = null;
  let gapLength = 0;

  for (let d = currentDay; d < currentDay + analysisDays; d++) {
    if (dailyHarvests[d].length === 0) {
      if (gapStart === null) gapStart = d;
      gapLength++;
    } else {
      if (gapLength >= 7) {
        gaps.push({ start: gapStart, end: d - 1, length: gapLength });
      }
      gapStart = null;
      gapLength = 0;
    }
  }
  if (gapLength >= 7) {
    gaps.push({ start: gapStart, end: currentDay + analysisDays - 1, length: gapLength });
  }

  return { dailyHarvests, gaps, hasGaps: gaps.length > 0 };
}
