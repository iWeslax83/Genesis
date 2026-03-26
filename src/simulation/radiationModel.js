import { RADIATION, TICK_FRACTION } from './constants';

/**
 * Radyasyon modeli — GCR kronik doz + SPE olayları
 */
export function calculateRadiation(state, currentRadiation) {
  const missionDay = state.time.day;
  const prev = currentRadiation || {
    cumulativeDose: 0,
    dailyDose: RADIATION.gcr.marsSurface * RADIATION.gcr.shieldingFactor,
    activeEvent: null,
    eventHistory: [],
    cropGrowthPenalty: 0,
  };

  // GCR kronik doz
  const gcrDose = RADIATION.gcr.marsSurface * RADIATION.gcr.shieldingFactor;
  let dailyDose = gcrDose;
  let activeEvent = prev.activeEvent;
  let cropGrowthPenalty = 0;
  const eventHistory = [...prev.eventHistory];

  // SPE olayı kontrolü (günde bir kez kontrol)
  if (state.time.hour === 0 && state.time.minute === 0) {
    if (!activeEvent && Math.random() < RADIATION.spe.probability) {
      const eventDose = RADIATION.spe.minDose + Math.random() * (RADIATION.spe.maxDose - RADIATION.spe.minDose);
      activeEvent = {
        startDay: missionDay,
        dose: eventDose,
        durationDays: RADIATION.spe.durationDays,
        type: eventDose > 0.2 ? 'major' : 'minor',
      };
      eventHistory.push({
        day: missionDay,
        dose: Math.round(eventDose * 1000) / 1000,
        type: activeEvent.type,
      });
      // Son 10 olayı tut
      if (eventHistory.length > 10) eventHistory.shift();
    }
  }

  // Aktif SPE olayı etkisi
  if (activeEvent) {
    const elapsed = missionDay - activeEvent.startDay;
    if (elapsed >= activeEvent.durationDays) {
      activeEvent = null;
    } else {
      const speDailyDose = activeEvent.dose / activeEvent.durationDays;
      dailyDose += speDailyDose;
      // Bitki büyüme cezası (SPE sırasında)
      cropGrowthPenalty = Math.min(0.3, speDailyDose * 2);
    }
  }

  // Kümülatif doz
  const cumulativeDose = prev.cumulativeDose + dailyDose * TICK_FRACTION;

  return {
    cumulativeDose: Math.round(cumulativeDose * 10000) / 10000,
    dailyDose: Math.round(dailyDose * 10000) / 10000,
    gcrDose,
    activeEvent,
    eventHistory,
    cropGrowthPenalty,
    status: activeEvent ? (activeEvent.type === 'major' ? 'critical' : 'warning') : 'nominal',
  };
}
