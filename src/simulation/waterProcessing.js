import { WATER_PROCESSING } from './constants';

/**
 * Çok aşamalı su işleme modeli
 * MELiSSA + Yuegong-1 referansı
 */
export function calculateWaterProcessing(state, flowData) {
  const totalWaterInput = flowData ? flowData.water.totalConsumption : 30; // L/gün
  const stages = {};
  let processedWater = 0;
  let totalEfficiency = 1.0;

  // Bileşen bozulması etkisi
  const pumpEfficiency = state.degradation?.components?.waterPump?.efficiency || 1.0;

  for (const [stageId, stageDef] of Object.entries(WATER_PROCESSING.stages)) {
    const stageInput = totalWaterInput * stageDef.fraction;
    const stageEfficiency = stageDef.efficiency * pumpEfficiency;
    const stageOutput = stageInput * stageEfficiency;
    const stageLoss = stageInput - stageOutput;

    stages[stageId] = {
      label: stageDef.label,
      input: Math.round(stageInput * 100) / 100,
      output: Math.round(stageOutput * 100) / 100,
      loss: Math.round(stageLoss * 100) / 100,
      efficiency: Math.round(stageEfficiency * 1000) / 1000,
    };
    processedWater += stageOutput;
    totalEfficiency *= stageEfficiency;
  }

  const overallRecovery = totalWaterInput > 0 ? processedWater / totalWaterInput : 0;
  const dailyLoss = totalWaterInput - processedWater;

  // Su kalitesi
  const tocLevel = (1 - totalEfficiency) * 5; // mg/L basitleştirilmiş
  const waterQuality = tocLevel < WATER_PROCESSING.tocLimit ? 'potable' :
                       tocLevel < 2.0 ? 'marginal' : 'contaminated';

  return {
    stages,
    totalInput: Math.round(totalWaterInput * 100) / 100,
    totalOutput: Math.round(processedWater * 100) / 100,
    dailyLoss: Math.round(dailyLoss * 100) / 100,
    overallRecovery: Math.round(overallRecovery * 1000) / 1000,
    tocLevel: Math.round(tocLevel * 100) / 100,
    waterQuality,
    bufferLevel: state.resources?.water?.total || 2000,
    status: overallRecovery >= 0.95 ? 'nominal' : overallRecovery >= 0.85 ? 'warning' : 'critical',
  };
}
