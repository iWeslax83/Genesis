import { POWER, PHOTOPERIOD } from './constants';

/**
 * Güç sistemi hesaplama — her tick'te çağrılır
 * Alt sistem güç tüketimi, üretim, denge
 */
export function calculatePowerSystem(state) {
  const { time, compartments } = state;
  const hour = time.hour;
  const isLightPeriod = hour >= PHOTOPERIOD.lightOn && hour < PHOTOPERIOD.lightOff;

  // LED aydınlatma gücü (gece 0, gündüz tam, rampa döneminde kısmi)
  let lightingFactor = 0;
  if (isLightPeriod) {
    const minutesAfterOn = (hour - PHOTOPERIOD.lightOn) * 60 + time.minute;
    const minutesBeforeOff = (PHOTOPERIOD.lightOff - hour) * 60 - time.minute;
    if (minutesAfterOn < PHOTOPERIOD.rampMinutes) {
      lightingFactor = minutesAfterOn / PHOTOPERIOD.rampMinutes;
    } else if (minutesBeforeOff < PHOTOPERIOD.rampMinutes) {
      lightingFactor = minutesBeforeOff / PHOTOPERIOD.rampMinutes;
    } else {
      lightingFactor = 1.0;
    }
  }

  // Alt sistem güç tüketimi
  const subsystems = {};
  let totalConsumption = 0;

  for (const [key, sub] of Object.entries(POWER.subsystems)) {
    let consumption = sub.base;
    if (key === 'ledLighting') {
      consumption *= lightingFactor;
    }
    subsystems[key] = { consumption, label: sub.label, priority: sub.priority };
    totalConsumption += consumption;
  }

  // Güç üretimi
  let generation = 0;
  const sourceType = POWER.sourceType;

  if (sourceType === 'solar') {
    const locationData = POWER.solarByLocation[POWER.location] || POWER.solarByLocation.marsSurface;
    const solarArea = POWER.sources.solar.area;
    const efficiency = POWER.sources.solar.efficiency;
    // Gün/gece döngüsü (basitleştirilmiş sinüzoidal)
    const solarAngle = Math.sin(((hour - 6) / 12) * Math.PI);
    const solarFactor = Math.max(0, solarAngle);
    generation = (locationData.avg * solarArea * efficiency * solarFactor) / 1000; // kW
  } else {
    generation = POWER.sources.nuclear.totalCapacity;
  }

  const balance = generation - totalConsumption;
  const utilizationPercent = generation > 0 ? (totalConsumption / generation) * 100 : 0;

  // Güç yetersizliği kontrolü
  let powerDeficit = false;
  let curtailedSystems = [];
  if (balance < 0) {
    powerDeficit = true;
    // Öncelik 3 sistemleri (düşük) kıs
    const sortedByPriority = Object.entries(subsystems).sort((a, b) => b[1].priority - a[1].priority);
    let deficit = Math.abs(balance);
    for (const [key, sub] of sortedByPriority) {
      if (deficit <= 0) break;
      const curtail = Math.min(sub.consumption * 0.5, deficit);
      subsystems[key].consumption -= curtail;
      subsystems[key].curtailed = curtail;
      deficit -= curtail;
      curtailedSystems.push(key);
    }
    totalConsumption = Object.values(subsystems).reduce((s, v) => s + v.consumption, 0);
  }

  return {
    subsystems,
    totalConsumption,
    generation,
    balance: generation - totalConsumption,
    utilizationPercent: Math.min(100, utilizationPercent),
    sourceType,
    location: POWER.location,
    lightingFactor,
    powerDeficit,
    curtailedSystems,
  };
}

