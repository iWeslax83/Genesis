import { CREW_ACTIVITIES, DEFAULT_CREW_SCHEDULE } from './constants';

/**
 * Mürettebat aktivite modeli — zaman dilimi bazında metabolik yükler
 * V-HAB (TU Munich) crew scheduler referansı
 */
export function getCurrentActivity(hour) {
  for (const slot of DEFAULT_CREW_SCHEDULE) {
    if (slot.startHour < slot.endHour) {
      if (hour >= slot.startHour && hour < slot.endHour) return slot.activity;
    } else {
      // Gece geçişi (ör: 22-6)
      if (hour >= slot.startHour || hour < slot.endHour) return slot.activity;
    }
  }
  return 'rest';
}

/**
 * Mürettebat bazında metabolik yükler — faz kaydırma destekli
 */
export function calculateCrewMetabolics(crewMembers, hour, minute) {
  const results = [];
  const crewCount = crewMembers.length;

  for (let i = 0; i < crewCount; i++) {
    // Her mürettebat üyesine 1-2 saatlik faz kaydırma
    const phaseShift = Math.floor(i / 2); // Her 2 kişi aynı program
    const shiftedHour = (hour + phaseShift) % 24;
    const activity = getCurrentActivity(shiftedHour);
    const actData = CREW_ACTIVITIES[activity] || CREW_ACTIVITIES.rest;

    results.push({
      id: crewMembers[i].id,
      name: crewMembers[i].name,
      role: crewMembers[i].role,
      activity: actData.label,
      activityKey: activity,
      o2Rate: actData.o2Rate,           // kg/saat
      co2Rate: actData.o2Rate * actData.co2Factor * (44 / 32), // kg/saat (mol ağırlık dönüşümü)
      heatOutput: actData.heatW,        // W
      caloriesBurning: actData.calPerHour,
    });
  }

  // Toplam metabolik yükler
  const totals = results.reduce((acc, r) => ({
    o2Consumption: acc.o2Consumption + r.o2Rate,
    co2Production: acc.co2Production + r.co2Rate,
    heatOutput: acc.heatOutput + r.heatOutput,
    caloriesBurning: acc.caloriesBurning + r.caloriesBurning,
  }), { o2Consumption: 0, co2Production: 0, heatOutput: 0, caloriesBurning: 0 });

  // Günlük O₂ tüketimi tahmin (saatlik oran × 24)
  totals.dailyO2Liters = totals.o2Consumption * 24 * (1000 / 1.429) * 24.04 / 32;
  // Basitleştirilmiş: kg/saat → L/gün
  totals.dailyO2Liters = totals.o2Consumption * 24 * 700; // ~700 L/kg O₂

  return { crew: results, totals };
}
