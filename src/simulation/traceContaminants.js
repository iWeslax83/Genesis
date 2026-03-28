import { TRACE_CONTAMINANTS, TCCS, TICK_FRACTION } from './constants';

/**
 * Eser kirletici birikim ve kontrol modeli
 * ISS TCCS (Trace Contaminant Control Subassembly) referansı
 */
export function calculateTraceContaminants(currentLevels, crewCount, carbonBedHealth, missionDay) {
  const levels = {};
  let alarmCount = 0;
  const scrubberEfficiency = carbonBedHealth || 1.0;

  for (const [contId, contDef] of Object.entries(TRACE_CONTAMINANTS)) {
    const raw = currentLevels && currentLevels[contId];
    const current = (typeof raw === 'object' && raw !== null) ? (raw.level || 0) : (raw || 0);

    // Üretim hızı (mg/m³/gün) — mürettebat sayısına bağlı
    const productionRate = contDef.baseRate * (crewCount / 6);

    // Temizleme hızı (TCCS)
    const removalRate = current * contDef.scrubberEff * scrubberEfficiency;

    // Net değişim per tick
    const netChange = (productionRate - removalRate) * TICK_FRACTION;
    const newLevel = Math.max(0, current + netChange);

    // SMAC kontrolü
    const smacRatio = newLevel / contDef.smac180;
    let status = 'nominal';
    if (smacRatio >= 1.0) { status = 'critical'; alarmCount++; }
    else if (smacRatio >= 0.7) { status = 'warning'; }

    levels[contId] = {
      name: contDef.name,
      level: Math.round(newLevel * 1000) / 1000,
      unit: contDef.unit,
      smac: contDef.smac180,
      smacRatio: Math.round(smacRatio * 100) / 100,
      source: contDef.source,
      status,
    };
  }

  return {
    levels,
    alarmCount,
    scrubberHealth: Math.round(scrubberEfficiency * 100),
    tccsPower: TCCS.powerDraw,
    carbonBedRemaining: Math.max(0, Math.round(scrubberEfficiency * TCCS.carbonLifespan - (missionDay || 0))),
    status: alarmCount > 0 ? 'critical' : Object.values(levels).some(l => l.status === 'warning') ? 'warning' : 'nominal',
  };
}
