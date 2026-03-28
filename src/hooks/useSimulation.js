import { useEffect, useRef } from 'react';
import { useGenesis } from '../context/GenesisContext';
import { generateAllSensors } from '../simulation/sensorSimulator';
import {
  calculateResourceFlow,
  calculateHealthScore,
  calculateVitaminIntake,
  calculateBiodiversityScore,
} from '../simulation/resourceFlowEngine';
import { detectAnomalies, generateAIInsights } from '../simulation/anomalyDetector';
import { calculatePlantGrowth } from '../simulation/plantGrowthModel';
import { PLANTS, HABITAT_VOLUME, SPIRULINA, CREW } from '../simulation/constants';
import { calculatePowerSystem } from '../simulation/powerSystem';
import { calculateThermalBalance } from '../simulation/thermalSystem';
import { calculateDegradation } from '../simulation/degradationModel';
import { calculateModuleNDVI } from '../simulation/ndviModel';
import { calculatePathogenRisk } from '../simulation/pathogenModel';
import { calculateWaterProcessing } from '../simulation/waterProcessing';
import { calculateTraceContaminants } from '../simulation/traceContaminants';
import { calculateRadiation } from '../simulation/radiationModel';
import { calculateMissionStatus } from '../simulation/missionPlanner';
import { calculateCrewMetabolics } from '../simulation/crewActivityModel';

const TICK_FRACTION = 1 / 288; // Her tick = 5 dakika = 1/288 gün

// ======================================================
// Kompartman durum değerlendirme
// ======================================================
function evaluateCompartmentStatus(sensors) {
  const statuses = {};

  statuses.waste = 'nominal';
  statuses.nutrient = 'nominal';

  if (sensors.aeroponic) {
    const a = sensors.aeroponic;
    if (a.temperature < 14 || a.temperature > 35 || a.pH < 4.5 || a.pH > 7.2) {
      statuses.aeroponic = 'critical';
    } else if (a.temperature < 18 || a.temperature > 30 || a.pH < 5.2 || a.pH > 6.5) {
      statuses.aeroponic = 'warning';
    } else {
      statuses.aeroponic = 'nominal';
    }
  }

  if (sensors.nft) {
    const n = sensors.nft;
    if (n.temperature < 12 || n.temperature > 34 || n.pH < 4.5 || n.pH > 7.2) {
      statuses.nft = 'critical';
    } else if (n.temperature < 16 || n.temperature > 28 || n.pH < 5.2 || n.pH > 6.5) {
      statuses.nft = 'warning';
    } else {
      statuses.nft = 'nominal';
    }
  }

  if (sensors.spirulina) {
    const sp = sensors.spirulina;
    if (sp.temperature < 22 || sp.temperature > 38 || sp.density < 0.1) {
      statuses.spirulina = 'critical';
    } else if (sp.temperature < 26 || sp.temperature > 34 || sp.density < 0.3) {
      statuses.spirulina = 'warning';
    } else {
      statuses.spirulina = 'nominal';
    }
  }

  if (sensors.mushroom) {
    const m = sensors.mushroom;
    if (m.temperature < 10 || m.temperature > 28 || m.humidity < 65) {
      statuses.mushroom = 'critical';
    } else if (m.temperature < 14 || m.temperature > 22 || m.humidity < 80) {
      statuses.mushroom = 'warning';
    } else {
      statuses.mushroom = 'nominal';
    }
  }

  if (sensors.habitat) {
    const h = sensors.habitat;
    if (h.o2 < 18.0 || h.co2 > 0.15) {
      statuses.habitat = 'critical';
    } else if (h.o2 < 19.5 || h.co2 > 0.08 || h.temperature < 19 || h.temperature > 26) {
      statuses.habitat = 'warning';
    } else {
      statuses.habitat = 'nominal';
    }
  }

  const growthModules = ['aeroponic', 'nft', 'spirulina', 'mushroom'];
  const severityOrder = { critical: 2, warning: 1, nominal: 0 };
  let worstGrowth = 'nominal';
  for (const mod of growthModules) {
    if (statuses[mod] && severityOrder[statuses[mod]] > severityOrder[worstGrowth]) {
      worstGrowth = statuses[mod];
    }
  }
  statuses.growth = worstGrowth;

  return statuses;
}

// ======================================================
// Hasat kontrolü — olgunlaşan bitkiler otomatik hasat + yeni ekim
// ======================================================
function checkHarvests(state) {
  const harvests = [];
  const { growth } = state.compartments;
  const currentDay = state.time.day;

  for (const moduleKey of ['aeroponic', 'nft']) {
    const mod = growth.modules[moduleKey];
    const conditions = {
      temperature: mod.temperature,
      lightPAR: mod.lightPAR,
      co2: mod.co2,
      waterAvailable: true,
    };

    mod.plants.forEach((pg, plantIndex) => {
      const plantDef = PLANTS[pg.type];
      if (!plantDef) return;

      const daysSincePlanting = currentDay - pg.plantedDay;
      const growthResult = calculatePlantGrowth(pg.type, daysSincePlanting, conditions);

      if (growthResult.isReady) {
        harvests.push({
          moduleKey,
          plantIndex,
          plantType: pg.type,
          count: pg.count,
          yieldKg: Math.round(growthResult.yield * pg.count / 1000 * 10) / 10,
          newPlantedDay: currentDay, // Yeni döngü başlat
        });
      }
    });
  }

  return harvests;
}

// ======================================================
// Spirulina kontaminasyon riski hesaplama
// ======================================================
function calculateContaminationRisk(spirulinaModule) {
  const phDeviation = Math.abs((spirulinaModule.pH || 9.5) - SPIRULINA.optimalPH);
  const tempDeviation = Math.abs((spirulinaModule.temperature || 30) - SPIRULINA.optimalTemp);

  // pH sapması >1.5 veya sıcaklık sapması >5°C → risk artar
  if (phDeviation > 1.5 || tempDeviation > 5) {
    return 3; // Yüksek risk artışı
  } else if (phDeviation > 0.8 || tempDeviation > 3) {
    return 1; // Orta risk artışı
  } else {
    return -2; // Koşullar iyi → risk azalır
  }
}

// ======================================================
// Ana simülasyon döngüsü
// ======================================================
export default function useSimulation() {
  const { state, dispatch } = useGenesis();
  const intervalRef = useRef(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    if (!state.time.isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      const s = stateRef.current;

      // 1. Zamanı ilerlet (senaryo auto-expiry dahil)
      dispatch({ type: 'TICK' });

      // 2. Sensör verilerini üret
      const scenario = s.scenario.active
        ? { active: true, effects: s.scenario.effects }
        : null;
      const sensors = generateAllSensors(s.time, scenario);
      dispatch({ type: 'UPDATE_SENSORS', payload: { sensors } });

      // 3. Kompartman durumlarını güncelle
      const compartmentStatuses = evaluateCompartmentStatus(sensors);
      dispatch({ type: 'UPDATE_COMPARTMENT_STATUS', payload: compartmentStatuses });

      // 4. Kaynak akışlarını hesapla
      const flow = calculateResourceFlow(s);
      const health = calculateHealthScore(flow, s.compartments);

      dispatch({
        type: 'UPDATE_RESOURCES',
        payload: {
          oxygen: flow.oxygen,
          co2: flow.co2,
          water: {
            ...s.resources.water,
            dailyLoss: flow.water.loss,
            recycleRate: flow.water.recycleRate,
          },
          calories: {
            dailyTarget: flow.calories.target,
            dailyProduction: flow.calories.total,
            bySource: flow.calories.bySource,
            protein: flow.calories.protein,
            carbs: flow.calories.carbs,
            fat: flow.calories.fat,
          },
          nutrients: {
            ...s.resources.nutrients,
            recycledFromWaste: flow.nutrients.recyclePercent,
          },
          healthScore: health.score,
          healthIssues: health.issues,
          closure: flow.closure,
        },
      });

      // 5. Gaz Rezervuar Modeli — O₂/CO₂ hacim bazlı birikim
      // PV=nRT basitleştirilmiş: ΔYüzde = (Denge L/gün × TICK) / (Hacim L) × 100
      const o2DeltaPercent = (flow.oxygen.balance * TICK_FRACTION / HABITAT_VOLUME) * 100;
      const co2DeltaPercent = (flow.co2.balance * TICK_FRACTION / HABITAT_VOLUME) * 100;
      dispatch({
        type: 'UPDATE_GAS_LEVELS',
        payload: { o2Delta: o2DeltaPercent, co2Delta: co2DeltaPercent },
      });

      // 6. Mantar substrat güncelleme
      const substrateDeltaPerTick = flow.substrate.delta * TICK_FRACTION;
      dispatch({
        type: 'UPDATE_SUBSTRATE',
        payload: { delta: substrateDeltaPerTick },
      });

      // 7. Spirulina kontaminasyon riski
      const contRiskDelta = calculateContaminationRisk(s.compartments.growth.modules.spirulina);
      const contRiskDeltaPerTick = contRiskDelta * TICK_FRACTION * 50; // Günlük risk değişiminin tick oranı
      dispatch({
        type: 'UPDATE_CONTAMINATION',
        payload: { riskDelta: contRiskDeltaPerTick },
      });

      // 8. Otomatik hasat kontrolü — her saat (dakika=0)
      if (s.time.minute === 0) {
        const harvests = checkHarvests(s);
        if (harvests.length > 0) {
          dispatch({ type: 'HARVEST_PLANTS', payload: { harvests } });
        }
      }

      // 9. Mürettebat aktivite modeli (güç ve ısıl sistemden ÖNCE — onlar crew heat'e bağımlı)
      const crewMembers = CREW.members || Array.from({ length: s.compartments.habitat.crewCount || 6 }, (_, i) => ({ id: i+1, name: `Crew ${i+1}`, role: 'Genel' }));
      const crewMetabolics = calculateCrewMetabolics(crewMembers, s.time.hour, s.time.minute);
      dispatch({ type: 'UPDATE_CREW_ACTIVITY', payload: crewMetabolics });

      // 10. Güç sistemi hesaplama
      const powerData = calculatePowerSystem(s);
      dispatch({ type: 'UPDATE_POWER', payload: powerData });

      // 11. Isıl denge hesaplama
      const thermalData = calculateThermalBalance(s, powerData);
      dispatch({ type: 'UPDATE_THERMAL', payload: thermalData });

      // 12. Radyasyon modeli
      const radiationData = calculateRadiation(s, s.radiation);
      dispatch({ type: 'UPDATE_RADIATION', payload: radiationData });

      // 13. Eser kirletici kontrol (her 5. tick'te — performans)
      if (s.time.minute % 5 === 0) {
        const carbonHealth = s.degradation?.components?.carbonBed?.adsorptionEfficiency || 1.0;
        const contaminantData = calculateTraceContaminants(
          s.traceContaminants?.levels || {},
          s.compartments.habitat.crewCount || 6,
          carbonHealth,
          s.time.day
        );
        dispatch({ type: 'UPDATE_TRACE_CONTAMINANTS', payload: contaminantData });
      }

      // 14. AI, vitamin, NDVI, patojen, görev — her 30 dakikada bir
      if (s.time.minute % 30 === 0) {
        const anomalies = detectAnomalies(s.sensorHistory, sensors, s.time);
        const insights = generateAIInsights(flow, s.compartments, s.time, s.sensorHistory);

        // Vitamin ve biyoçeşitlilik hesapla
        const vitaminStatus = calculateVitaminIntake(s);
        const biodiversityScore = calculateBiodiversityScore(flow.calories.bySource);

        dispatch({
          type: 'UPDATE_AI',
          payload: {
            anomalies: anomalies.length > 0 ? anomalies.slice(0, 8) : s.ai.anomalies,
            optimizations: insights,
          },
        });

        dispatch({
          type: 'UPDATE_RESOURCES',
          payload: {
            vitaminStatus,
            biodiversityScore,
          },
        });

        // Bileşen bozulma modeli
        const degradationData = calculateDegradation(s);
        dispatch({ type: 'UPDATE_DEGRADATION', payload: degradationData });

        // NDVI bitki sağlığı
        const aeroNDVI = calculateModuleNDVI(s.compartments.growth.modules.aeroponic, s.time.day);
        const nftNDVI = calculateModuleNDVI(s.compartments.growth.modules.nft, s.time.day);
        dispatch({ type: 'UPDATE_NDVI', payload: { aeroponic: aeroNDVI, nft: nftNDVI } });

        // Patojen modeli
        const aeroPathogen = calculatePathogenRisk(
          s.compartments.growth.modules.aeroponic,
          s.pathogens?.aeroponic?.infections || {},
          TICK_FRACTION * 6 // 30 dakikalık aralık
        );
        const nftPathogen = calculatePathogenRisk(
          s.compartments.growth.modules.nft,
          s.pathogens?.nft?.infections || {},
          TICK_FRACTION * 6
        );
        dispatch({ type: 'UPDATE_PATHOGENS', payload: { aeroponic: aeroPathogen, nft: nftPathogen } });

        // Su işleme
        const waterProcData = calculateWaterProcessing(s, flow);
        dispatch({ type: 'UPDATE_WATER_PROCESSING', payload: waterProcData });

        // Görev planlama
        const missionData = calculateMissionStatus(s);
        dispatch({ type: 'UPDATE_MISSION', payload: missionData });

      }
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [state.time.isRunning, state.time.speed, dispatch]);
}
