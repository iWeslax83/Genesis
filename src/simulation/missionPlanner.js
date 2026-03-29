import { MISSION, MODULE_AREAS } from './constants';

/**
 * Görev planlama ve erzak tamponu hesaplama
 * NASA DRA 5.0 Mars referansı
 */
export function calculateMissionStatus(state) {
  const missionDay = state.time.day;
  const crewCount = state.compartments.habitat.crewCount || 1;

  // Görev fazı belirleme
  let cumulativeDay = 0;
  let currentPhase = MISSION.phases[0];
  for (const phase of MISSION.phases) {
    if (missionDay >= cumulativeDay && missionDay < cumulativeDay + phase.durationDays) {
      currentPhase = { ...phase, startDay: cumulativeDay, endDay: cumulativeDay + phase.durationDays };
      break;
    }
    cumulativeDay += phase.durationDays;
  }
  const totalMissionDays = MISSION.phases.reduce((s, p) => s + p.durationDays, 0);

  // Depolanan erzak hesabı
  const totalStoredFood = crewCount * MISSION.storedFood.perPersonPerDay * totalMissionDays;
  const emergencyReserve = crewCount * MISSION.storedFood.perPersonPerDay * MISSION.emergencyReserveDays;

  // Tüketilen erzak (BLSS kapanırlık oranına bağlı)
  const blssClosure = state.resources?.closure?.food || 0;
  const blssContribution = blssClosure / 100; // 0-1
  const dailyStoredConsumption = crewCount * MISSION.storedFood.perPersonPerDay * (1 - blssContribution);
  const storedConsumed = dailyStoredConsumption * missionDay;
  const storedRemaining = Math.max(0, totalStoredFood - storedConsumed);
  const daysOfStoredFood = dailyStoredConsumption > 0 ? storedRemaining / dailyStoredConsumption : Infinity;

  // BLSS devreye alma durumu
  const blssRampUp = Math.min(1, Math.max(0, (missionDay - 30) / MISSION.blssRampUpDays));
  const blssOperational = missionDay >= MISSION.blssRampUpDays;

  // Kesimsiye noktası (stored → self-sustaining)
  const crossoverDay = blssContribution >= 0.8 ? missionDay :
    (blssContribution > 0.1 ? Math.round(MISSION.blssRampUpDays / blssContribution) : null);

  // Ekim alanı analizi
  const totalGrowingArea = MODULE_AREAS.aeroponic + MODULE_AREAS.nft;
  const areaPerPerson = totalGrowingArea / crewCount;
  const targetAreaPerPerson = 8; // m² (yaklaşık %50 kapanırlık için)

  return {
    currentPhase,
    missionDay,
    totalMissionDays,
    missionProgress: Math.min(100, (missionDay / totalMissionDays) * 100),
    storedFood: {
      total: Math.round(totalStoredFood),
      consumed: Math.round(storedConsumed),
      remaining: Math.round(storedRemaining),
      daysRemaining: Math.round(daysOfStoredFood),
      emergencyReserve: Math.round(emergencyReserve),
    },
    blss: {
      rampUpProgress: Math.round(blssRampUp * 100),
      operational: blssOperational,
      closurePercent: Math.round(blssClosure),
      crossoverDay,
      contribution: Math.round(blssContribution * 100),
    },
    growingArea: {
      total: totalGrowingArea,
      perPerson: Math.round(areaPerPerson * 10) / 10,
      targetPerPerson: targetAreaPerPerson,
      adequate: areaPerPerson >= targetAreaPerPerson,
    },
    status: storedRemaining <= emergencyReserve ? 'critical' :
            daysOfStoredFood < 60 ? 'warning' : 'nominal',
  };
}
