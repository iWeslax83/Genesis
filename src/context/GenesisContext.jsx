import { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';
import { INITIAL_PLANTS, SCENARIOS } from '../simulation/constants';

const GenesisContext = createContext(null);

const STORAGE_KEY = 'genesis_simulation_state';
const SAVE_DEBOUNCE_MS = 2000;

/** Try to load previously saved state from localStorage */
function loadSavedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (_err) {
    // Corrupted or unreadable data — fall back to default
    localStorage.removeItem(STORAGE_KEY);
  }
  return null;
}

const MAX_HISTORY = 288; // 24 saat × 12 tick/saat (5 dk aralık)

const initialState = {
  time: {
    day: 1,
    hour: 8,
    minute: 0,
    speed: 1,
    isRunning: true,
  },

  compartments: {
    waste: {
      temperature: 55, pH: 6.8,
      decompositionRate: 0.85, outputNH4: 120, outputCO2: 340,
      status: 'nominal',
    },
    nutrient: {
      pH: 5.8, ec: 2.1, temperature: 22,
      nitrificationRate: 0.92, solutionVolume: 500,
      status: 'nominal',
    },
    growth: {
      status: 'nominal',
      harvestLog: [],
      modules: {
        aeroponic: {
          plants: INITIAL_PLANTS.aeroponic,
          temperature: 24, humidity: 65, co2: 800, lightPAR: 450,
          pH: 5.8, ec: 2.1, waterUsage: 12, status: 'nominal',
        },
        nft: {
          plants: INITIAL_PLANTS.nft,
          temperature: 22, humidity: 60, co2: 750, lightPAR: 350,
          pH: 5.8, ec: 1.8, waterUsage: 8, status: 'nominal',
        },
        spirulina: {
          temperature: 30, pH: 9.5, density: 1.2,
          lightIntensity: 200, harvestRate: 60, o2Production: 96,
          contaminationRisk: 0,
          status: 'nominal',
        },
        mushroom: {
          temperature: 18, humidity: 90, co2: 1200,
          substrateLevel: 85, harvestRate: 714, status: 'nominal',
        },
      },
    },
    habitat: {
      crewCount: 6, o2Level: 21.0, co2Level: 0.04,
      temperature: 22, humidity: 50, waterReserve: 1000,
      status: 'nominal',
    },
  },

  resources: {
    water: {
      total: 2000, inPlants: 400, inNutrient: 500,
      inHabitat: 1000, inProcessing: 100,
      recycleRate: 0.98, dailyLoss: 0.4,
    },
    oxygen: {
      production: 5200, consumption: 5040, balance: 160,
      spirulinaContribution: 96,
    },
    co2: {
      production: 6000, absorption: 5800, balance: 200,
    },
    nutrients: {
      nitrogen: 100, phosphorus: 50, potassium: 200,
      recycledFromWaste: 78,
    },
    calories: {
      dailyTarget: 15000, dailyProduction: 13500,
      bySource: { aeroponic: 7200, nft: 1600, spirulina: 2100, mushroom: 1500, mealworm: 1100 },
      protein: 420, carbs: 1350, fat: 190,
    },
    vitaminStatus: {},
    biodiversityScore: 0,
    healthScore: 94,
    healthIssues: [],
    closure: { o2: 95, co2: 92, water: 98, food: 72, material: 89 },
  },

  ai: {
    anomalies: [],
    plantHealth: {
      overallScore: 95,
      issues: [
        { plant: 'Patates-3', issue: 'Hafif N eksikliği', confidence: 82, severity: 'warning' },
      ],
    },
    optimizations: [],
  },

  // Güç ve enerji sistemi
  power: {
    subsystems: {},
    totalConsumption: 34,
    generation: 40,
    balance: 6,
    utilizationPercent: 85,
    sourceType: 'solar',
    location: 'marsSurface',
    lightingFactor: 1,
    powerDeficit: false,
    curtailedSystems: [],
  },

  // Isıl kontrol
  thermal: {
    heatSources: { crew: 0.75, avionics: 2, electrical: 30, total: 32.75 },
    heatRejection: { radiatorCapacity: 25, actualRejection: 25, utilizationPercent: 80 },
    netHeatFlux: 0,
    deltaTemp: 0,
    currentTemp: 22,
    thermalStatus: 'nominal',
  },

  // Bileşen bozulma
  degradation: {
    components: {},
    averageHealth: 100,
  },

  // NDVI bitki sağlığı
  ndvi: {
    aeroponic: { average: 0.75, plants: {}, status: 'nominal' },
    nft: { average: 0.78, plants: {}, status: 'nominal' },
  },

  // Patojen durumu
  pathogens: {
    aeroponic: { infections: {}, yieldPenalty: 0 },
    nft: { infections: {}, yieldPenalty: 0 },
  },

  // Su işleme
  waterProcessing: {
    stages: {},
    overallRecovery: 0.987,
    dailyLoss: 0.4,
    tocLevel: 0.2,
    waterQuality: 'potable',
    status: 'nominal',
  },

  // Eser kirleticiler — ISS nominal seviyeleri ile başlat (SMAC-180 limitlerinin ~%10-20'si)
  traceContaminants: {
    levels: {
      ammonia:      { name: 'Amonyak',        level: 0.8,  unit: 'mg/m\u00B3', smac: 7.0,  smacRatio: 0.11, source: 'M\u00FCrettebat metabolizmas\u0131', status: 'nominal' },
      formaldehyde: { name: 'Formaldehit',    level: 0.005, unit: 'mg/m\u00B3', smac: 0.05, smacRatio: 0.10, source: 'Polimer gaz sal\u0131m\u0131',       status: 'nominal' },
      co:           { name: 'Karbon Monoksit', level: 1.2,  unit: 'mg/m\u00B3', smac: 17.0, smacRatio: 0.07, source: 'Ekipman, metabolizma',          status: 'nominal' },
      methane:      { name: 'Metan',          level: 250,  unit: 'mg/m\u00B3', smac: 3800, smacRatio: 0.07, source: 'M\u00FCrettebat, malzeme',       status: 'nominal' },
      voc:          { name: 'Toplam VOC',     level: 2.5,  unit: 'mg/m\u00B3', smac: 25.0, smacRatio: 0.10, source: 'Yap\u0131\u015Ft\u0131r\u0131c\u0131lar, contalar',    status: 'nominal' },
    },
    alarmCount: 0,
    scrubberHealth: 100,
    tccsPower: 0.12,
    status: 'nominal',
  },

  // Radyasyon
  radiation: {
    cumulativeDose: 0,
    dailyDose: 0.0001,
    gcrDose: 0.0001,
    activeEvent: null,
    eventHistory: [],
    cropGrowthPenalty: 0,
    status: 'nominal',
  },

  // Görev planlama
  mission: {
    currentPhase: { name: 'Mars Yüzey Operasyonları', blssActive: true },
    missionDay: 47,
    totalMissionDays: 980,
    missionProgress: 4.8,
    storedFood: { total: 10584, consumed: 500, remaining: 10084, daysRemaining: 900, emergencyReserve: 972 },
    blss: { rampUpProgress: 39, operational: false, closurePercent: 0, contribution: 0 },
    growingArea: { total: 52, perPerson: 8.7, targetPerPerson: 8, adequate: true },
    status: 'nominal',
  },

  // Mürettebat aktivite
  crewActivity: {
    crew: [],
    totals: { o2Consumption: 0, co2Production: 0, heatOutput: 0, caloriesBurning: 0 },
  },

  scenario: {
    active: null,
    effects: null,
    startDay: null,
  },

  sensorHistory: {
    aeroponic: { temp: [], humidity: [], co2: [], ph: [], ec: [], par: [], ethylene: [] },
    nft: { temp: [], humidity: [], co2: [], ph: [], ec: [], par: [], ethylene: [] },
    spirulina: { temp: [], ph: [], density: [], o2: [] },
    mushroom: { temp: [], humidity: [], co2: [] },
    habitat: { o2: [], co2: [], temp: [], humidity: [], ethylene: [] },
  },

  ui: {
    currentPage: 'overview',
    selectedModule: 'aeroponic',
    selectedCompartment: null,
    sidebarCollapsed: false,
  },
};

function pushToHistory(arr, value) {
  const next = [...arr, value];
  return next.length > MAX_HISTORY ? next.slice(-MAX_HISTORY) : next;
}

function genesisReducer(state, action) {
  switch (action.type) {
    case 'TICK': {
      const { time } = state;
      let newMinute = time.minute + (5 * time.speed);
      let newHour = time.hour;
      let newDay = time.day;

      while (newMinute >= 60) {
        newMinute -= 60;
        newHour++;
      }
      while (newHour >= 24) {
        newHour -= 24;
        newDay++;
      }

      // Senaryo süre kontrolü — otomatik bitiş
      let newScenario = state.scenario;
      if (state.scenario.active && state.scenario.startDay !== null) {
        const scenarioDef = SCENARIOS.find(s => s.id === state.scenario.active);
        if (scenarioDef && newDay - state.scenario.startDay >= scenarioDef.duration) {
          newScenario = { active: null, effects: null, startDay: null };
        }
      }

      return {
        ...state,
        time: { ...time, day: newDay, hour: newHour, minute: Math.floor(newMinute) },
        scenario: newScenario,
      };
    }

    case 'SET_SPEED':
      return { ...state, time: { ...state.time, speed: action.payload } };

    case 'TOGGLE_SIMULATION':
      return { ...state, time: { ...state.time, isRunning: !state.time.isRunning } };

    case 'UPDATE_SENSORS': {
      const { sensors } = action.payload;
      const { growth, habitat } = state.compartments;

      // Sensör geçmişini güncelle
      const newHistory = { ...state.sensorHistory };

      const addHistory = (module, field, value) => {
        if (newHistory[module] && newHistory[module][field] !== undefined) {
          newHistory[module] = {
            ...newHistory[module],
            [field]: pushToHistory(newHistory[module][field], value),
          };
        }
      };

      if (sensors.aeroponic) {
        addHistory('aeroponic', 'temp', sensors.aeroponic.temperature);
        addHistory('aeroponic', 'humidity', sensors.aeroponic.humidity);
        addHistory('aeroponic', 'co2', sensors.aeroponic.co2);
        addHistory('aeroponic', 'ph', sensors.aeroponic.pH);
        addHistory('aeroponic', 'ec', sensors.aeroponic.ec);
        addHistory('aeroponic', 'par', sensors.aeroponic.par);
        addHistory('aeroponic', 'ethylene', sensors.aeroponic.ethylene);
      }
      if (sensors.nft) {
        addHistory('nft', 'temp', sensors.nft.temperature);
        addHistory('nft', 'humidity', sensors.nft.humidity);
        addHistory('nft', 'co2', sensors.nft.co2);
        addHistory('nft', 'ph', sensors.nft.pH);
        addHistory('nft', 'ec', sensors.nft.ec);
        addHistory('nft', 'par', sensors.nft.par);
        addHistory('nft', 'ethylene', sensors.nft.ethylene);
      }
      if (sensors.spirulina) {
        addHistory('spirulina', 'temp', sensors.spirulina.temperature);
        addHistory('spirulina', 'ph', sensors.spirulina.pH);
        addHistory('spirulina', 'density', sensors.spirulina.density);
        addHistory('spirulina', 'o2', sensors.spirulina.o2);
      }
      if (sensors.mushroom) {
        addHistory('mushroom', 'temp', sensors.mushroom.temperature);
        addHistory('mushroom', 'humidity', sensors.mushroom.humidity);
        addHistory('mushroom', 'co2', sensors.mushroom.co2);
      }
      if (sensors.habitat) {
        addHistory('habitat', 'o2', sensors.habitat.o2);
        addHistory('habitat', 'co2', sensors.habitat.co2);
        addHistory('habitat', 'temp', sensors.habitat.temperature);
        addHistory('habitat', 'humidity', sensors.habitat.humidity);
        addHistory('habitat', 'ethylene', sensors.habitat.ethylene);
      }

      // Sensör anahtarlarını state anahtarlarına dönüştür
      const mapGrowthModule = (sensorData) => {
        if (!sensorData) return {};
        const mapped = { ...sensorData };
        if (mapped.par !== undefined) {
          mapped.lightPAR = mapped.par;
          delete mapped.par;
        }
        return mapped;
      };

      // Habitat: o2/co2 gaz rezervuar modeli tarafından kontrol ediliyor
      // Sensör verileri sadece geçmişe kaydedilir, o2Level/co2Level'i güncellemez
      const mapHabitat = (sensorData) => {
        if (!sensorData) return {};
        const mapped = { ...sensorData };
        delete mapped.o2;  // Gaz modeli kontrol ediyor
        delete mapped.co2; // Gaz modeli kontrol ediyor
        return mapped;
      };

      return {
        ...state,
        compartments: {
          ...state.compartments,
          growth: {
            ...growth,
            modules: {
              ...growth.modules,
              aeroponic: { ...growth.modules.aeroponic, ...mapGrowthModule(sensors.aeroponic) },
              nft: { ...growth.modules.nft, ...mapGrowthModule(sensors.nft) },
              spirulina: { ...growth.modules.spirulina, ...sensors.spirulina },
              mushroom: { ...growth.modules.mushroom, ...sensors.mushroom },
            },
          },
          habitat: { ...habitat, ...mapHabitat(sensors.habitat) },
        },
        sensorHistory: newHistory,
      };
    }

    case 'UPDATE_RESOURCES': {
      const updatedResources = { ...state.resources, ...action.payload };

      // Su rezervini günlük kayba göre azalt (her tick 5 dakika = 1/288 gün)
      if (action.payload.water) {
        const tickFraction = 1 / 288;
        const waterLossPerTick = (action.payload.water.dailyLoss || 0) * tickFraction;
        updatedResources.water = {
          ...updatedResources.water,
          total: Math.max(0, (state.resources.water.total || 2000) - waterLossPerTick),
        };
      }

      return {
        ...state,
        resources: updatedResources,
      };
    }

    case 'UPDATE_AI':
      return {
        ...state,
        ai: { ...state.ai, ...action.payload },
      };

    case 'UPDATE_COMPARTMENT_STATUS': {
      const statuses = action.payload;
      return {
        ...state,
        compartments: {
          ...state.compartments,
          waste: { ...state.compartments.waste, status: statuses.waste || state.compartments.waste.status },
          nutrient: { ...state.compartments.nutrient, status: statuses.nutrient || state.compartments.nutrient.status },
          growth: {
            ...state.compartments.growth,
            status: statuses.growth || 'nominal',
            modules: {
              ...state.compartments.growth.modules,
              aeroponic: { ...state.compartments.growth.modules.aeroponic, status: statuses.aeroponic || 'nominal' },
              nft: { ...state.compartments.growth.modules.nft, status: statuses.nft || 'nominal' },
              spirulina: { ...state.compartments.growth.modules.spirulina, status: statuses.spirulina || 'nominal' },
              mushroom: { ...state.compartments.growth.modules.mushroom, status: statuses.mushroom || 'nominal' },
            },
          },
          habitat: { ...state.compartments.habitat, status: statuses.habitat || state.compartments.habitat.status },
        },
      };
    }

    // Gaz rezervuar modeli — O2/CO2 hacim bazlı birikim
    case 'UPDATE_GAS_LEVELS': {
      const { o2Delta, co2Delta } = action.payload;
      const hab = state.compartments.habitat;
      return {
        ...state,
        compartments: {
          ...state.compartments,
          habitat: {
            ...hab,
            o2Level: Math.max(15, Math.min(25, hab.o2Level + o2Delta)),
            co2Level: Math.max(0, Math.min(5, hab.co2Level + co2Delta)),
          },
        },
      };
    }

    // Otomatik hasat — olgunlaşan bitkilerin plantedDay'ini sıfırla
    case 'HARVEST_PLANTS': {
      const { harvests } = action.payload;
      const growth = state.compartments.growth;
      const newModules = { ...growth.modules };
      const harvestLog = [...(growth.harvestLog || [])];

      for (const h of harvests) {
        const mod = { ...newModules[h.moduleKey] };
        const plants = mod.plants.map((p, i) =>
          i === h.plantIndex ? { ...p, plantedDay: h.newPlantedDay } : p
        );
        mod.plants = plants;
        newModules[h.moduleKey] = mod;
        harvestLog.push({
          day: state.time.day,
          hour: state.time.hour,
          type: h.plantType,
          count: h.count,
          yieldKg: h.yieldKg,
        });
      }

      // Son 30 hasatı tut
      const trimmedLog = harvestLog.length > 30 ? harvestLog.slice(-30) : harvestLog;

      return {
        ...state,
        compartments: {
          ...state.compartments,
          growth: { ...growth, modules: newModules, harvestLog: trimmedLog },
        },
      };
    }

    // Mantar substrat güncelleme
    case 'UPDATE_SUBSTRATE': {
      const { delta } = action.payload;
      const mushroom = state.compartments.growth.modules.mushroom;
      return {
        ...state,
        compartments: {
          ...state.compartments,
          growth: {
            ...state.compartments.growth,
            modules: {
              ...state.compartments.growth.modules,
              mushroom: {
                ...mushroom,
                substrateLevel: Math.max(0, Math.min(100, mushroom.substrateLevel + delta)),
              },
            },
          },
        },
      };
    }

    // Spirulina kontaminasyon risk güncelleme
    case 'UPDATE_CONTAMINATION': {
      const { riskDelta } = action.payload;
      const spirulina = state.compartments.growth.modules.spirulina;
      const newRisk = Math.max(0, Math.min(100, (spirulina.contaminationRisk || 0) + riskDelta));
      return {
        ...state,
        compartments: {
          ...state.compartments,
          growth: {
            ...state.compartments.growth,
            modules: {
              ...state.compartments.growth.modules,
              spirulina: { ...spirulina, contaminationRisk: newRisk },
            },
          },
        },
      };
    }

    // Yeni alt sistem güncellemeleri
    case 'UPDATE_POWER':
      return { ...state, power: { ...state.power, ...action.payload } };

    case 'UPDATE_THERMAL':
      return { ...state, thermal: { ...state.thermal, ...action.payload } };

    case 'UPDATE_DEGRADATION':
      return { ...state, degradation: { ...state.degradation, ...action.payload } };

    case 'UPDATE_NDVI':
      return { ...state, ndvi: { ...state.ndvi, ...action.payload } };

    case 'UPDATE_PATHOGENS':
      return { ...state, pathogens: { ...state.pathogens, ...action.payload } };

    case 'UPDATE_WATER_PROCESSING':
      return { ...state, waterProcessing: { ...state.waterProcessing, ...action.payload } };

    case 'UPDATE_TRACE_CONTAMINANTS':
      return { ...state, traceContaminants: { ...state.traceContaminants, ...action.payload } };

    case 'UPDATE_RADIATION':
      return { ...state, radiation: { ...state.radiation, ...action.payload } };

    case 'UPDATE_MISSION':
      return { ...state, mission: { ...state.mission, ...action.payload } };

    case 'UPDATE_CREW_ACTIVITY':
      return { ...state, crewActivity: { ...state.crewActivity, ...action.payload } };

    case 'ACTIVATE_SCENARIO':
      return {
        ...state,
        scenario: {
          active: action.payload.id,
          effects: action.payload.effects,
          startDay: state.time.day,
        },
      };

    case 'DEACTIVATE_SCENARIO':
      return {
        ...state,
        scenario: { active: null, effects: null, startDay: null },
      };

    case 'SET_PAGE':
      return { ...state, ui: { ...state.ui, currentPage: action.payload } };

    case 'SET_SELECTED_MODULE':
      return { ...state, ui: { ...state.ui, selectedModule: action.payload } };

    case 'SET_SELECTED_COMPARTMENT':
      return { ...state, ui: { ...state.ui, selectedCompartment: action.payload } };

    case 'TOGGLE_SIDEBAR':
      return { ...state, ui: { ...state.ui, sidebarCollapsed: !state.ui.sidebarCollapsed } };

    case 'RESET_SIMULATION':
      return { ...initialState };

    default:
      return state;
  }
}

export function GenesisProvider({ children }) {
  const [state, dispatch] = useReducer(
    genesisReducer,
    initialState,
    // Lazy initializer: use saved state if available, otherwise initialState
    () => loadSavedState() || initialState,
  );

  // dispatch from useReducer is already stable — no wrapper needed

  // --- Debounced auto-save to localStorage ---
  const saveTimerRef = useRef(null);

  useEffect(() => {
    // Clear any pending save timer
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    // Schedule a save after the debounce period
    saveTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (_err) {
        // localStorage full or unavailable — silently ignore
      }
    }, SAVE_DEBOUNCE_MS);

    // Cleanup on unmount or before next effect run
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [state]);

  // Reset simulation: clear saved state and dispatch reset action
  const resetSimulation = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (_err) {
      // ignore
    }
    dispatch({ type: 'RESET_SIMULATION' });
  }, []);

  return (
    <GenesisContext.Provider value={{ state, dispatch, resetSimulation }}>
      {children}
    </GenesisContext.Provider>
  );
}

export function useGenesis() {
  const context = useContext(GenesisContext);
  if (!context) throw new Error('useGenesis must be used within GenesisProvider');
  return context;
}
