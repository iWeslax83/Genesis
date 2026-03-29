# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Genesis is a real-time closed-loop biological life support system (BLSS) simulator for long-duration Mars missions. It models ESA's MELiSSA protocol — air, water, food, waste, and energy cycles — with scientific data from NASA VEGGIE/APH, BIOS-3, Yuegong-1, and Eden ISS. The UI language is Turkish.

## Commands

```bash
npm run dev       # Vite dev server → http://localhost:3000
npm run build     # Production build → /build
npm run preview   # Serve production build locally
```

No test runner or linter is configured.

## Architecture

### State Management

Single global state via React Context + `useReducer` in `src/context/GenesisContext.jsx`. All simulation data, UI state, and resource tracking lives here. The reducer handles ~25 action types (TICK, UPDATE_SENSORS, UPDATE_RESOURCES, HARVEST_PLANTS, ACTIVATE_SCENARIO, etc.).

### Simulation Loop

`src/hooks/useSimulation.js` orchestrates 15 simulation engines on every tick. One tick = 5 minutes of simulation time (1/288 of a day). The hook calls each engine, then dispatches results to the reducer.

**Simulation engines** (`src/simulation/`):

| Engine | File | What it computes |
|--------|------|-----------------|
| Constants | `constants.js` | All scientific reference data (~45KB): crops, crew, MELiSSA compartments, power, radiation, scenarios |
| Plant Growth | `plantGrowthModel.js` | Sigmoid growth, GDD/DLI, yield per crop, growth phases |
| Resource Flow | `resourceFlowEngine.js` | O₂/CO₂ balance, water cycle, calorie/vitamin production, MELiSSA closure % |
| Sensors | `sensorSimulator.js` | 180+ virtual sensors with sinusoidal cycles + Gaussian noise |
| Anomaly Detection | `anomalyDetector.js` | Z-score baseline, rate-of-change, threshold alarms, root cause inference |
| Power | `powerSystem.js` | Solar/nuclear generation, 7 subsystem loads, load shedding |
| Thermal | `thermalSystem.js` | Heat sources, Stefan-Boltzmann radiator, cabin temperature |
| Water Processing | `waterProcessing.js` | Multi-stage treatment (urine, greywater, condensate, membrane, ion exchange) |
| Degradation | `degradationModel.js` | Component health (HEPA, carbon bed, pump, LED, scrubber) over mission days |
| NDVI | `ndviModel.js` | Plant health index, stress factors |
| Pathogen | `pathogenModel.js` | Disease lifecycle, spread, treatment, yield penalty |
| Radiation | `radiationModel.js` | GCR chronic dose, stochastic SPE events, crop growth penalty |
| Mission Planner | `missionPlanner.js` | 3-phase mission (transit→surface→return), stored food, BLSS ramp-up |
| Crew Activity | `crewActivityModel.js` | Hourly schedule, metabolic O₂/CO₂/heat output, shift rotation |
| Trace Contaminants | `traceContaminants.js` | 5 trace gases (NH₃, HCHO, CO, CH₄, VOC), TCCS scrubber |

### Component Pages

`src/components/layout/AppLayout.jsx` handles page routing (no react-router — state-based via `ui.currentPage`).

7 pages under `src/components/`: `overview/`, `growth/`, `nutrition/`, `power/`, `mission/`, `digital-twin/` (Three.js 3D), `ai/`. Shared UI components in `ui/`. Farm zone view in `farm-view/`.

### Data Flow

```
useSimulation (hook)
  → calls 13 engines with current state
  → dispatches UPDATE_* actions to GenesisContext reducer
  → components read from context and render
```

### Crop System

6 plant types defined in `PLANTS` object in `constants.js`: `potato`, `peanut`, `lettuce`, `spinach`, `basil`, `mint`. Each has growth phases, nutritional values, module assignment (aeroponic or nft), and succession planting config. Food sources are exclusively plant-based (no spirulina, mushroom, or mealworm).

`INITIAL_PLANTS` seeds staggered batches for continuous harvest. `VITAMINS` maps micronutrients to their plant sources. `NUTRIENT_RECIPES` defines hydroponic solutions per crop category (leafy, root, aromatic).

### Styling

Tailwind CSS with custom dark theme. Key color tokens: `nexus-bg`, `nexus-card`, `nexus-accent`, `nexus-green`, `nexus-orange`, `nexus-red`, `nexus-border`, `nexus-text`, `nexus-text-dim`. Defined in `tailwind.config.cjs`.

## Key Conventions

- All scientific constants and crop data are centralized in `src/simulation/constants.js` — never hardcode values in components.
- Crop keys (e.g. `potato`, `spinach`) must be consistent across PLANTS, INITIAL_PLANTS, VITAMINS, NUTRIENT_RECIPES, RADIATION.cropSensitivity, MORALE.luxuryCrops, and VERTICAL_FARM_PLAN.
- Simulation engines are pure functions: they take state, return computed values. Side effects happen only through dispatches in `useSimulation.js`.
- Component files reference crops dynamically via `Object.keys(PLANTS)` or similar iteration — avoid hardcoding crop lists in components.
