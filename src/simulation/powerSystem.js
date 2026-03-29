import { POWER, PHOTOPERIOD, THERMAL } from './constants';

/**
 * Güç sistemi hesaplama — her tick'te çağrılır
 * Alt sistem güç tüketimi artık sabit değil, simülasyon durumuna göre dinamik değişir
 */
export function calculatePowerSystem(state) {
  const { time, compartments, thermal, degradation, crewActivity, waterProcessing, traceContaminants } = state;
  const hour = time.hour;
  const minute = time.minute || 0;
  const isLightPeriod = hour >= PHOTOPERIOD.lightOn && hour < PHOTOPERIOD.lightOff;

  // ── LED aydınlatma faktörü (gece 0, gündüz tam, rampa döneminde kısmi) ──
  let lightingFactor = 0;
  if (isLightPeriod) {
    const minutesAfterOn = (hour - PHOTOPERIOD.lightOn) * 60 + minute;
    const minutesBeforeOff = (PHOTOPERIOD.lightOff - hour) * 60 - minute;
    if (minutesAfterOn < PHOTOPERIOD.rampMinutes) {
      lightingFactor = minutesAfterOn / PHOTOPERIOD.rampMinutes;
    } else if (minutesBeforeOff < PHOTOPERIOD.rampMinutes) {
      lightingFactor = minutesBeforeOff / PHOTOPERIOD.rampMinutes;
    } else {
      lightingFactor = 1.0;
    }
  }

  // ── Alt sistem güç tüketimi (dinamik) ──
  const subsystems = {};
  let totalConsumption = 0;

  for (const [key, sub] of Object.entries(POWER.subsystems)) {
    let consumption = sub.base;
    let factor = 1.0;

    switch (key) {
      case 'ledLighting':
        factor = calcLedFactor(lightingFactor, compartments, degradation);
        break;
      case 'thermalHVAC':
        factor = calcHvacFactor(thermal, crewActivity);
        break;
      case 'waterProcessing':
        factor = calcWaterFactor(waterProcessing, compartments);
        break;
      case 'atmosphere':
        factor = calcAtmoFactor(compartments, degradation, traceContaminants);
        break;
      case 'wasteProcessing':
        factor = calcWasteFactor(compartments);
        break;
      case 'crewSupport':
        factor = calcCrewFactor(crewActivity, hour);
        break;
      case 'sensors':
        factor = calcSensorFactor(compartments);
        break;
    }

    consumption *= clamp(factor, 0, 2.0);
    subsystems[key] = { consumption, label: sub.label, priority: sub.priority, factor: Math.round(factor * 100) };
    totalConsumption += consumption;
  }

  // ── Güç üretimi ──
  let generation = 0;
  const sourceType = POWER.sourceType;

  if (sourceType === 'solar') {
    const locationData = POWER.solarByLocation[POWER.location] || POWER.solarByLocation.marsSurface;
    const solarArea = POWER.sources.solar.area;
    const efficiency = POWER.sources.solar.efficiency;
    // Panel yaşlanması (üstel — lineer değil, negatife düşmez)
    const missionDay = time.day || 0;
    const yearsDeg = missionDay / 365;
    const panelDeg = Math.exp(-POWER.sources.solar.degradationPerYear * yearsDeg);
    // Gün/gece döngüsü (sinüzoidal)
    const solarAngle = Math.sin(((hour - 6) / 12) * Math.PI);
    const solarFactor = Math.max(0, solarAngle);
    generation = (locationData.avg * solarArea * efficiency * solarFactor * panelDeg) / 1000;
  } else {
    generation = POWER.sources.nuclear.totalCapacity;
  }

  const balance = generation - totalConsumption;
  const utilizationPercent = generation > 0 ? (totalConsumption / generation) * 100 : 0;

  // ── Güç yetersizliği → öncelik bazlı kısıtlama ──
  let powerDeficit = false;
  let curtailedSystems = [];
  if (balance < 0) {
    powerDeficit = true;
    const sortedByPriority = Object.entries(subsystems).sort((a, b) => b[1].priority - a[1].priority);
    let deficit = Math.abs(balance);
    for (const [sKey, sub] of sortedByPriority) {
      if (deficit <= 0) break;
      const curtail = Math.min(sub.consumption * 0.5, deficit);
      subsystems[sKey].consumption -= curtail;
      subsystems[sKey].curtailed = curtail;
      deficit -= curtail;
      curtailedSystems.push(sKey);
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

// ────────────────────────────────────────────────────────
// Alt sistem dinamik faktör hesaplamaları
// ────────────────────────────────────────────────────────

/**
 * LED Aydınlatma: gece/gündüz + aktif modül sayısı + LED bozulması
 * Tüm modüller aktif değilse daha az enerji harcanır
 */
function calcLedFactor(lightingFactor, compartments, degradation) {
  if (lightingFactor === 0) return 0;

  const modules = compartments?.growth?.modules || {};
  let activeModules = 0;
  let totalModules = 0;

  for (const mod of Object.values(modules)) {
    totalModules++;
    // Modülde bitki varsa veya aydınlatma gerektiriyorsa aktif say
    const hasPlants = (mod.plants && mod.plants.length > 0) || mod.density > 0;
    if (hasPlants && mod.status !== 'offline') activeModules++;
  }

  // En az %30 baz yük (kontrol sistemleri, standby LED)
  const moduleFraction = totalModules > 0 ? 0.30 + 0.70 * (activeModules / totalModules) : 1.0;

  // LED panel sağlığı — bozulmuş paneller daha fazla enerji çeker (verimsizlik)
  // health 0-100 aralığında, 0-1'e dönüştür
  const ledHealth = (degradation?.components?.led?.health ?? 100) / 100;
  const efficiencyPenalty = 1 + (1 - ledHealth) * 0.3; // %100 sağlık → 1.0x, %50 → 1.15x

  return lightingFactor * moduleFraction * efficiencyPenalty;
}

/**
 * HVAC: sıcaklık sapması + mürettebat ısı çıkışı
 * Sıcaklık hedefteyse minimum çalışır, sapma arttıkça yük artar
 */
function calcHvacFactor(thermal, crewActivity) {
  const currentTemp = thermal?.currentTemp ?? 22;
  const targetTemp = THERMAL.cabin.targetTemp;
  const tempError = Math.abs(currentTemp - targetTemp);

  // Sıcaklık sapması: 0°C fark → 0.5x, 5°C → 1.0x, 10°C+ → 1.5x
  const tempFactor = 0.5 + Math.min(tempError / 10, 1.0);

  // Mürettebat ısı çıkışı yüksekse HVAC daha çok çalışır
  const crewHeat = crewActivity?.totals?.heatOutput ?? 125; // W (1 kişi × 125W)
  const baseCrewHeat = 125;
  const crewFactor = 0.8 + 0.4 * (crewHeat / baseCrewHeat); // egzersiz zamanı daha yüksek

  return tempFactor * crewFactor;
}

/**
 * Su İşleme: geri dönüşüm hacmi + su kalitesi
 * TOC yüksekse arıtma sistemi daha yoğun çalışır
 */
function calcWaterFactor(waterProcessing, compartments) {
  // Su kalitesi kötüyse daha çok enerji
  const tocLevel = waterProcessing?.tocLevel ?? 1.0;
  const tocFactor = 0.7 + Math.min(tocLevel / 5, 0.6); // TOC 0→0.7x, 5+→1.3x

  // Besin çözeltisi hacmi yüksekse pompalar daha çok çalışır
  const nutrient = compartments?.nutrient || {};
  const solutionVol = nutrient.solutionVolume ?? 500;
  const volFactor = 0.8 + 0.4 * Math.min(solutionVol / 1000, 1.0);

  return tocFactor * volFactor;
}

/**
 * Atmosfer Yönetimi: CO₂ seviyesi + scrubber sağlığı
 * CO₂ yükselince fanlar/scrubber'lar daha çok çalışır;
 * bozulmuş scrubber aynı işi daha çok enerjiyle yapar
 */
function calcAtmoFactor(compartments, degradation, traceContaminants) {
  const habitat = compartments?.habitat || {};
  const co2Pct = habitat.co2Level ?? 0.04; // yüzde cinsinden

  // CO₂ seviyesi: normal ~0.04%, yüksek → daha çok güç
  // 0.04% → 0.7x, 0.10% → 1.0x, 0.20%+ → 1.5x
  const co2Factor = 0.7 + Math.min((co2Pct / 0.12), 1.0) * 0.8;

  // Scrubber sağlığı: bozulmuş scrubber verimsiz → daha çok enerji
  // health 0-100 aralığında, 0-1'e dönüştür
  const scrubberHealth = (degradation?.components?.co2Scrubber?.health ?? 100) / 100;
  const scrubberPenalty = 1 + (1 - scrubberHealth) * 0.5; // %0 sağlık → 1.5x

  // TCCS eser kirletici sistemi aktifse ek yük
  const tccsActive = (traceContaminants?.scrubberHealth ?? 100) < 100;
  const tccsFactor = tccsActive ? 1.1 : 1.0;

  return co2Factor * scrubberPenalty * tccsFactor;
}

/**
 * Atık İşleme: biyoreaktör ayrışma hızı
 * Aktif ayrışma daha çok enerji gerektirir
 */
function calcWasteFactor(compartments) {
  const waste = compartments?.waste || {};
  const decompRate = waste.decompositionRate ?? 0.5; // 0-1

  // Ayrışma hızı: 0 → 0.3x (standby), 1.0 → 1.2x (tam kapasite)
  return 0.3 + decompRate * 0.9;
}

/**
 * Mürettebat Desteği: aktif kişi sayısı + aktivite yoğunluğu
 * Uyku saatlerinde düşük, egzersiz/çalışma saatlerinde yüksek
 */
function calcCrewFactor(crewActivity, hour) {
  const crewHeat = crewActivity?.totals?.heatOutput ?? 125;
  const baseHeat = 125; // 1 × 125W ortalama

  // Metabolik çıktı oranı (uyku ~80W, egzersiz ~500W, orta ~125W)
  const activityRatio = crewHeat / baseHeat;

  // 0.4x (uyku) → 1.0x (normal) → 1.6x (yoğun egzersiz)
  return 0.4 + Math.min(activityRatio, 2.0) * 0.6;
}

/**
 * Sensörler: aktif modül sayısına göre hafif değişim
 */
function calcSensorFactor(compartments) {
  const modules = compartments?.growth?.modules || {};
  const moduleCount = Object.keys(modules).length || 4;

  // Modül başına hafif ek yük, min 0.7x
  return 0.7 + Math.min(moduleCount / 6, 1.0) * 0.5;
}

// ── Yardımcı ──
function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}
