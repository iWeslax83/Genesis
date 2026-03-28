import { NDVI, PLANTS } from './constants';

/**
 * NDVI (Normalized Difference Vegetation Index) hesaplama
 * Eden ISS referans — bitki sağlığı erken uyarı sistemi
 */
export function calculateNDVI(plants, conditions, currentDay) {
  const results = {};

  for (const pg of plants) {
    const plantDef = PLANTS[pg.type];
    if (!plantDef) continue;

    const daysSincePlanting = currentDay - pg.plantedDay;
    const progress = Math.min(1, daysSincePlanting / plantDef.growthDays);

    // Sigmoid büyüme eğrisi üzerinde beklenen NDVI
    // Çimlenme: 0.18 → Olgunluk: 0.92 (sigmoid)
    // Referans: Eden ISS olgun marul NDVI 0.82-0.90, ISS APH buğday 0.85-0.93
    const k = 8;
    const midpoint = 0.35; // %35 ilerleme noktasında hızlı artış
    const baseNDVI = 0.18 + 0.75 / (1 + Math.exp(-k * (progress - midpoint)));

    // Çevresel stres faktörleri
    let stressFactor = 1.0;

    // Sıcaklık stresi — hafifletildi (gerçek seralarda 4°C sapma tolere edilir)
    const tempDev = Math.abs(conditions.temperature - plantDef.optimalTemp);
    if (tempDev > 10) stressFactor *= 0.65;
    else if (tempDev > 6) stressFactor *= 0.85;
    else if (tempDev > 3) stressFactor *= 0.95;

    // Işık stresi — gece saatlerinde PAR=0 bitkiyi stresli yapmaz
    // NDVI yapısal bir ölçümdür, anlık ışığa bağlı değildir
    // Sadece kronik ışık eksikliği (gündüz PAR düşük) stres yapar
    // Gece PAR=0 normaldir, stres faktörü uygulanmaz
    const effectivePAR = conditions.lightPAR;
    const isNightTime = effectivePAR < 10; // Gece modu tespiti
    if (!isNightTime) {
      if (effectivePAR < 100) stressFactor *= 0.75;
      else if (effectivePAR < 200) stressFactor *= 0.92;
    }
    // Gece: stres faktörü değişmez (1.0 kalır)

    // CO₂ etkisi
    if (conditions.co2 < 300) stressFactor *= 0.8;
    else if (conditions.co2 < 400) stressFactor *= 0.92;

    const ndvi = Math.max(0, Math.min(1, baseNDVI * stressFactor));

    // Durum değerlendirme
    let status = 'healthy';
    if (ndvi < NDVI.critical.max) status = 'critical';
    else if (ndvi < NDVI.warning.max) status = 'warning';

    const key = `${pg.type}_${pg.plantedDay}`;
    results[key] = {
      type: pg.type,
      name: plantDef.name,
      ndvi: Math.round(ndvi * 1000) / 1000,
      expectedNDVI: Math.round(baseNDVI * 1000) / 1000,
      stressFactor: Math.round(stressFactor * 100) / 100,
      progress,
      status,
      count: pg.count,
    };
  }

  return results;
}

/**
 * Modül bazında ortalama NDVI hesapla
 */
export function calculateModuleNDVI(moduleData, currentDay) {
  const conditions = {
    temperature: moduleData.temperature,
    lightPAR: moduleData.lightPAR || 0,
    co2: moduleData.co2 || 800,
  };

  const plantResults = calculateNDVI(moduleData.plants || [], conditions, currentDay);
  const values = Object.values(plantResults);

  if (values.length === 0) return { average: 0, plants: {}, status: 'nominal' };

  const totalWeighted = values.reduce((s, v) => s + v.ndvi * v.count, 0);
  const totalCount = values.reduce((s, v) => s + v.count, 0);
  const average = totalCount > 0 ? totalWeighted / totalCount : 0;

  let status = 'nominal';
  if (average < NDVI.critical.max) status = 'critical';
  else if (average < NDVI.warning.max) status = 'warning';

  return { average: Math.round(average * 1000) / 1000, plants: plantResults, status };
}
