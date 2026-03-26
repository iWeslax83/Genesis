import { PATHOGENS, DISSOLVED_OXYGEN } from './constants';

/**
 * Gelişmiş Patojen Modeli — Hastalık yayılma, kuluçka, tedavi mekanizması
 * Referanslar: Eden ISS külleme, ISS Veg-03 küf, Mir biyofilm kontaminasyonu
 *
 * Hastalık Durumları:
 *   sağlıklı → kuluçka → enfekte → semptomatik → ağır → (iyileşme veya ölüm)
 *
 * Yayılma Mekanizması:
 *   - Proximity bazlı (aynı modüldeki bitkiler)
 *   - Çevresel koşullara bağlı (nem, sıcaklık, çözünmüş O₂)
 *   - Hava sirkülasyonu ile cross-module yayılma (düşük olasılık)
 */

const DISEASE_STATES = ['healthy', 'incubation', 'infected', 'symptomatic', 'severe'];

/**
 * Çözünmüş oksijen bazlı Pythium risk hesabı
 */
function pythiumRiskFromDO(waterTemp) {
  const { a, b, c } = DISSOLVED_OXYGEN.saturationCoeffs;
  const saturation = a + b * waterTemp + c * waterTemp * waterTemp;
  const actualDO = saturation * DISSOLVED_OXYGEN.aerationEfficiency;
  return actualDO < DISSOLVED_OXYGEN.pythiumRiskThreshold
    ? Math.min(1, (DISSOLVED_OXYGEN.pythiumRiskThreshold - actualDO) / 2)
    : 0;
}

/**
 * Patojen modeli — hastalık yayılma ve etki hesaplama
 * Eden ISS külleme, ISS Veg-03 küf referansları
 */
export function calculatePathogenRisk(moduleConditions, currentInfections, tickFraction) {
  const results = { ...currentInfections };
  const { temperature, humidity } = moduleConditions;
  const waterTemp = moduleConditions.waterTemp || temperature - 2;

  for (const [pathId, pathDef] of Object.entries(PATHOGENS)) {
    const current = results[pathId] || {
      active: false, state: 'healthy', severity: 0,
      daysSinceOnset: 0, affectedPercent: 0, incubationDays: 0,
    };

    if (!current.active || current.state === 'healthy') {
      // ═══ ENFEKSİYON BAŞLAMA OLASILIGI ═══
      const tempProximity = 1 - Math.min(1, Math.abs(temperature - pathDef.optimalTemp) / 10);
      const humProximity = humidity > 70 ? Math.min(1, (humidity - 60) / 30) : 0;

      // Pythium (kök çürümesi) için özel DO bazlı risk
      let doRisk = 0;
      if (pathId === 'rootRot') {
        doRisk = pythiumRiskFromDO(waterTemp);
      }

      const baseChance = tempProximity * humProximity * 0.001;
      const infectionChance = (baseChance + doRisk * 0.002) * tickFraction;

      if (Math.random() < infectionChance) {
        results[pathId] = {
          active: true,
          state: 'incubation',
          severity: 2,
          daysSinceOnset: 0,
          affectedPercent: 1,
          incubationDays: 0,
          detected: false,
          name: pathDef.name,
          treatmentApplied: false,
          quarantined: false,
        };
      } else {
        results[pathId] = current;
      }
    } else {
      // ═══ HASTALIK İLERLEMESİ ═══
      const newDays = current.daysSinceOnset + tickFraction;
      let newState = current.state;
      let newAffected = current.affectedPercent;
      let newSeverity = current.severity;
      let incubationDays = (current.incubationDays || 0) + tickFraction;

      // Tedavi etkisi: yayılma %70 yavaşlar, iyileşme başlar
      const treatmentMod = current.treatmentApplied ? 0.3 : 1.0;
      // Karantina etkisi: yayılma %50 yavaşlar
      const quarantineMod = current.quarantined ? 0.5 : 1.0;

      // Durum geçişleri
      switch (current.state) {
        case 'incubation':
          // Kuluçka süresi (2-5 gün) — belirtisiz
          incubationDays += tickFraction;
          if (incubationDays >= pathDef.detectionLag * 0.5) {
            newState = 'infected';
            newAffected = Math.min(100, current.affectedPercent + 3);
          }
          break;

        case 'infected':
          // Yayılma hızlanır
          newAffected = Math.min(100,
            current.affectedPercent +
            pathDef.spreadRate * tickFraction * current.affectedPercent * treatmentMod * quarantineMod
          );
          newSeverity = Math.min(100, current.severity + pathDef.spreadRate * tickFraction * 30 * treatmentMod);
          if (newSeverity > 40) newState = 'symptomatic';
          break;

        case 'symptomatic':
          // Görünür belirtiler, verim kaybı belirgin
          newAffected = Math.min(100,
            current.affectedPercent +
            pathDef.spreadRate * tickFraction * current.affectedPercent * 0.5 * treatmentMod * quarantineMod
          );
          newSeverity = Math.min(100, current.severity + pathDef.spreadRate * tickFraction * 20 * treatmentMod);
          if (newSeverity > 75) newState = 'severe';
          // Tedavi ile iyileşme
          if (current.treatmentApplied && newSeverity < 30) {
            newState = 'infected';
          }
          break;

        case 'severe':
          // Ağır — yayılma yavaşlar ama hasar yüksek
          newAffected = Math.min(100,
            current.affectedPercent + pathDef.spreadRate * tickFraction * 5 * quarantineMod
          );
          newSeverity = Math.min(100, current.severity + tickFraction * 5);
          // Tedavi + uygun koşullar = yavaş iyileşme
          if (current.treatmentApplied) {
            const optimalConditions = Math.abs(temperature - pathDef.optimalTemp) > 5 && humidity < 65;
            if (optimalConditions) {
              newSeverity = Math.max(0, newSeverity - tickFraction * 10);
              if (newSeverity < 50) newState = 'symptomatic';
            }
          }
          break;
      }

      // NDVI ile tespit (detectionLag gün sonra)
      const detected = newDays >= pathDef.detectionLag || current.detected;

      // Doğal iyileşme: koşullar uygun değilse hastalık geri çekilir
      if (Math.abs(temperature - pathDef.optimalTemp) > 8 || humidity < 50) {
        newSeverity = Math.max(0, newSeverity - tickFraction * 3);
        newAffected = Math.max(0, newAffected - tickFraction * 1);
      }

      // Tamamen iyileşme
      if (newAffected < 0.5 && newSeverity < 1) {
        results[pathId] = {
          active: false, state: 'healthy', severity: 0,
          daysSinceOnset: 0, affectedPercent: 0, incubationDays: 0,
          detected: false, name: pathDef.name,
          treatmentApplied: false, quarantined: false,
        };
        continue;
      }

      results[pathId] = {
        active: newAffected > 0.5,
        state: newState,
        severity: Math.round(newSeverity * 10) / 10,
        daysSinceOnset: newDays,
        affectedPercent: Math.round(newAffected * 10) / 10,
        incubationDays: Math.round(incubationDays * 10) / 10,
        detected,
        name: pathDef.name,
        treatmentApplied: current.treatmentApplied || false,
        quarantined: current.quarantined || false,
      };
    }
  }

  // Toplam verim etkisi
  let yieldPenalty = 0;
  for (const [pathId, inf] of Object.entries(results)) {
    if (inf.active && PATHOGENS[pathId]) {
      // Durum bazlı verim etkisi
      const stateMod = {
        incubation: 0.05,
        infected: 0.3,
        symptomatic: 0.7,
        severe: 1.0,
      }[inf.state] || 0;
      yieldPenalty += (inf.affectedPercent / 100) * PATHOGENS[pathId].yieldReduction * stateMod;
    }
  }
  yieldPenalty = Math.min(0.8, yieldPenalty);

  return { infections: results, yieldPenalty };
}

/**
 * Modüller arası cross-kontaminasyon hesabı
 * Hava sirkülasyonu ile düşük olasılıklı yayılma
 */
export function calculateCrossContamination(aeroponicInfections, nftInfections, tickFraction) {
  const crossRate = 0.001; // Çok düşük — modüller arası yayılma

  for (const pathId of Object.keys(PATHOGENS)) {
    const aeroInf = aeroponicInfections[pathId];
    const nftInf = nftInfections[pathId];

    // Aeroponikten NFT'ye
    if (aeroInf?.active && aeroInf.affectedPercent > 30 && (!nftInf?.active)) {
      if (Math.random() < crossRate * tickFraction * aeroInf.affectedPercent / 100) {
        nftInfections[pathId] = {
          active: true, state: 'incubation', severity: 1,
          daysSinceOnset: 0, affectedPercent: 0.5, incubationDays: 0,
          detected: false, name: PATHOGENS[pathId].name,
          treatmentApplied: false, quarantined: false,
        };
      }
    }

    // NFT'den aeroponike
    if (nftInf?.active && nftInf.affectedPercent > 30 && (!aeroInf?.active)) {
      if (Math.random() < crossRate * tickFraction * nftInf.affectedPercent / 100) {
        aeroponicInfections[pathId] = {
          active: true, state: 'incubation', severity: 1,
          daysSinceOnset: 0, affectedPercent: 0.5, incubationDays: 0,
          detected: false, name: PATHOGENS[pathId].name,
          treatmentApplied: false, quarantined: false,
        };
      }
    }
  }

  return { aeroponicInfections, nftInfections };
}
