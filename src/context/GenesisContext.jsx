import { createContext, useContext, useReducer, useCallback } from 'react';
import { INITIAL_PLANTS, SCENARIOS } from '../simulation/constants';

const GenesisContext = createContext(null);

const STORAGE_KEY = 'genesis_simulation_state';

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
      },
    },
    habitat: {
      crewCount: 1, o2Level: 21.0, co2Level: 0.04,
      temperature: 22, humidity: 50, waterReserve: 170,
      status: 'nominal',
    },
  },

  resources: {
    water: {
      total: 600, inPlants: 220, inNutrient: 180,
      inHabitat: 170, inProcessing: 20,
      recycleRate: 0.98, dailyLoss: 0.02,
    },
    oxygen: {
      production: 5500, consumption: 630, balance: 4870,
    },
    co2: {
      production: 550, absorption: 4200, balance: -3650,
    },
    nutrients: {
      nitrogen: 20, phosphorus: 10, potassium: 35,
      recycledFromWaste: 13,
    },
    calories: {
      dailyTarget: 2500, dailyProduction: 2249,
      bySource: { aeroponic: 2173, nft: 76 },
      protein: 143, carbs: 226, fat: 107,
    },
    vitaminStatus: {},
    biodiversityScore: 0,
    healthScore: 94,
    healthIssues: [],
    closure: { o2: 100, co2: 100, water: 98, food: 90, material: 97 },
  },

  ai: {
    anomalies: [],
    plantHealth: {
      overallScore: 95,
      issues: [
        { plant: 'TatlıPatates-3', issue: 'Hafif N eksikliği', confidence: 82, severity: 'warning' },
      ],
    },
    optimizations: [],
  },

  // Güç ve enerji sistemi
  power: {
    subsystems: {},
    totalConsumption: 22.3,
    generation: 32,
    balance: 9.7,
    utilizationPercent: 70,
    sourceType: 'solar',
    location: 'marsSurface',
    lightingFactor: 1,
    powerDeficit: false,
    curtailedSystems: [],
  },

  // Isıl kontrol
  thermal: {
    heatSources: { crew: 0.125, avionics: 2, electrical: 8, total: 10.125 },
    heatRejection: { radiatorCapacity: 6, actualRejection: 6, utilizationPercent: 80 },
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
    growingArea: { total: 47, perPerson: 47, targetPerPerson: 40, adequate: true },
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
    // Always start fresh on page load
    () => initialState,
  );

  // dispatch from useReducer is already stable — no wrapper needed

  // Auto-save disabled: simulation resets on every page refresh

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
