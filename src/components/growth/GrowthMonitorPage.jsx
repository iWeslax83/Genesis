import React from 'react';
import { useGenesis } from '../../context/GenesisContext';
import GaugeCircle from '../ui/GaugeCircle';
import NDVIHeatmap from './NDVIHeatmap';
import { PLANTS, INITIAL_PLANTS } from '../../simulation/constants';
import { calculatePlantGrowth, calculateDLI, getCurrentGrowthPhase } from '../../simulation/plantGrowthModel';
import { NUTRIENT_RECIPES } from '../../simulation/constants';
import { formatNumber } from '../../utils/formatters';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const MODULE_TABS = [
  { id: 'aeroponic', label: 'Aeroponik', icon: '🌱', color: '#22c55e' },
  { id: 'nft', label: 'NFT Hidroponik', icon: '💧', color: '#06b6d4' },
  { id: 'spirulina', label: 'Spirulina', icon: '🧬', color: '#00f0ff' },
  { id: 'mushroom', label: 'Mantar', icon: '🍄', color: '#a855f7' },
];

function SensorGauges({ module }) {
  const gauges = [];

  if (module.temperature !== undefined) {
    gauges.push(
      <GaugeCircle key="temp" value={module.temperature} min={10} max={40}
        label="Sıcaklık" unit="°C" size={110}
        warningThresholds={{ warning: [16, 32], critical: [12, 38] }}
      />
    );
  }
  if (module.humidity !== undefined) {
    gauges.push(
      <GaugeCircle key="hum" value={module.humidity} min={0} max={100}
        label="Nem" unit="%" size={110}
        warningThresholds={{ warning: [25, 85], critical: [15, 95] }}
      />
    );
  }
  if (module.co2 !== undefined) {
    gauges.push(
      <GaugeCircle key="co2" value={module.co2} min={200} max={2000}
        label="CO₂" unit="ppm" size={110}
        warningThresholds={{ warning: [300, 1500], critical: [200, 2000] }}
      />
    );
  }
  if (module.pH !== undefined) {
    gauges.push(
      <GaugeCircle key="ph" value={module.pH} min={3} max={11}
        label="pH" unit="" size={110}
        warningThresholds={{ warning: [5.0, 7.0], critical: [4.0, 8.0] }}
      />
    );
  }
  if (module.ec !== undefined) {
    gauges.push(
      <GaugeCircle key="ec" value={module.ec} min={0} max={5}
        label="EC" unit="mS/cm" size={110}
        warningThresholds={{ warning: [0.5, 4.0], critical: [0.2, 5.0] }}
      />
    );
  }
  if (module.lightPAR !== undefined) {
    gauges.push(
      <GaugeCircle key="par" value={module.lightPAR} min={0} max={1000}
        label="PAR" unit="µmol" size={110}
      />
    );
  }
  if (module.density !== undefined) {
    gauges.push(
      <GaugeCircle key="dens" value={module.density} min={0} max={3}
        label="Yoğunluk" unit="g/L" size={110}
      />
    );
  }
  if (module.ethylene !== undefined) {
    gauges.push(
      <GaugeCircle key="eth" value={module.ethylene} min={0} max={80}
        label="Etilen" unit="ppb" size={110}
        warningThresholds={{ warning: [0, 25], critical: [0, 50] }}
      />
    );
  }

  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {gauges}
    </div>
  );
}

function GrowthTimeline({ plants, currentDay, moduleConditions }) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs text-nexus-text-dim uppercase tracking-wider">Büyüme Durumu</h3>
      {plants.map((pg, idx) => {
        const plantDef = PLANTS[pg.type];
        if (!plantDef) return null;
        const daysSincePlanting = currentDay - pg.plantedDay;
        const growth = calculatePlantGrowth(pg.type, daysSincePlanting, moduleConditions);
        const phase = getCurrentGrowthPhase(pg.type, daysSincePlanting);

        return (
          <div key={idx} className="flex items-center gap-3">
            <span className="text-sm w-6">{plantDef.icon}</span>
            <div className="w-28">
              <span className="text-xs text-nexus-text truncate block">{plantDef.name} x{pg.count}</span>
              {phase && (
                <span className="text-[10px] text-nexus-accent">{phase.name}</span>
              )}
            </div>
            <div className="flex-1 h-2 bg-nexus-bg rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${growth.progress * 100}%`,
                  backgroundColor: growth.isReady ? '#00ff88' : '#00f0ff',
                }}
              />
            </div>
            <span className={`text-xs font-mono w-12 text-right ${growth.isReady ? 'text-nexus-green' : 'text-nexus-text-dim'}`}>
              {(growth.progress * 100).toFixed(0)}%
            </span>
            {growth.isReady && <span className="text-xs text-nexus-green">Hasat</span>}
          </div>
        );
      })}
    </div>
  );
}

function ClimateRecipePanel({ plants, currentDay, moduleConditions }) {
  if (!plants || plants.length === 0) return null;

  // İlk bitkinin reçetesi gösterilir
  const firstPlant = plants[0];
  const plantDef = PLANTS[firstPlant.type];
  if (!plantDef?.growthPhases) return null;

  const daysSincePlanting = currentDay - firstPlant.plantedDay;
  const phase = getCurrentGrowthPhase(firstPlant.type, daysSincePlanting);
  const dli = calculateDLI(moduleConditions?.lightPAR || 400);
  const recipe = NUTRIENT_RECIPES[plantDef.nutrientCategory];

  if (!phase) return null;

  const compareParam = (label, current, target, unit) => {
    const diff = Math.abs(current - target);
    const ratio = target !== 0 ? diff / target : 0;
    const color = ratio < 0.1 ? '#00ff88' : ratio < 0.25 ? '#ff8800' : '#ff4466';
    return (
      <div className="flex justify-between items-center text-xs">
        <span className="text-nexus-text-dim">{label}</span>
        <div className="flex items-center gap-2">
          <span className="font-mono" style={{ color }}>{typeof current === 'number' ? current.toFixed(1) : '-'}</span>
          <span className="text-nexus-text-dim">/</span>
          <span className="font-mono text-nexus-text-dim">{target}{unit}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-nexus-card rounded-xl border border-nexus-border p-4">
      <h3 className="text-xs text-nexus-text-dim uppercase tracking-wider mb-2">
        Iklim Reçetesi <span className="text-nexus-accent">({plantDef.name})</span>
      </h3>
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm">{plantDef.icon}</span>
          <span className="text-xs text-nexus-accent font-medium">{phase.name}</span>
          <span className="text-[10px] text-nexus-text-dim">
            (Aşama {phase.index + 1}/{phase.totalPhases})
          </span>
        </div>
        {/* Faz progress */}
        <div className="flex gap-1 mb-2">
          {plantDef.growthPhases.map((p, i) => (
            <div key={i} className="flex-1 h-1 rounded-full" style={{
              backgroundColor: i === phase.index ? '#00f0ff' : i < phase.index ? '#00ff88' : '#1a1f36',
            }} />
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="text-[10px] text-nexus-text-dim uppercase mb-1">Mevcut vs Hedef</div>
        {compareParam('Sicaklik', moduleConditions?.temperature, phase.temp, '°C')}
        {compareParam('Nem', moduleConditions?.humidity, phase.humidity, '%')}
        {compareParam('CO2', moduleConditions?.co2, phase.co2, 'ppm')}
        {compareParam('pH', moduleConditions?.pH, phase.ph, '')}
        {compareParam('EC', moduleConditions?.ec, phase.ec, 'mS/cm')}
      </div>

      {/* DLI */}
      <div className="mt-3 pt-2 border-t border-nexus-border">
        <div className="flex justify-between items-center text-xs">
          <span className="text-nexus-text-dim">DLI</span>
          <span className="font-mono" style={{
            color: dli >= (plantDef.dliMin || 0) && dli <= (plantDef.dliMax || 30) ? '#00ff88' : '#ff8800'
          }}>
            {dli.toFixed(1)} <span className="text-nexus-text-dim">mol/m2/gün</span>
          </span>
        </div>
        <div className="flex justify-between items-center text-xs mt-1">
          <span className="text-nexus-text-dim">GDD Taban</span>
          <span className="font-mono text-nexus-text">{plantDef.gddBase || '-'}°C</span>
        </div>
        {recipe && (
          <div className="flex justify-between items-center text-xs mt-1">
            <span className="text-nexus-text-dim">Besin Reçetesi</span>
            <span className="font-mono text-nexus-accent">{recipe.label}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function EnvironmentChart({ history, dataKey, label, color }) {
  const data = (history || []).slice(-60).map((val, i) => ({ time: i, value: val }));

  if (data.length < 2) {
    return (
      <div className="h-32 flex items-center justify-center text-xs text-nexus-text-dim">
        Veri toplanıyor...
      </div>
    );
  }

  return (
    <div>
      <h4 className="text-xs text-nexus-text-dim mb-1">{label}</h4>
      <ResponsiveContainer width="100%" height={120}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1a1f36" />
          <XAxis dataKey="time" hide />
          <YAxis width={40} tick={{ fill: '#94a3b8', fontSize: 10 }} />
          <Tooltip
            contentStyle={{ background: '#1a1f36', border: '1px solid #2a3154', borderRadius: 8 }}
            labelStyle={{ color: '#94a3b8' }}
          />
          <Area type="monotone" dataKey="value" stroke={color} fill={`url(#grad-${dataKey})`} strokeWidth={2} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function GrowthMonitorPage() {
  const { state, dispatch } = useGenesis();
  const { selectedModule } = state.ui;
  const module = state.compartments.growth.modules[selectedModule];
  const history = state.sensorHistory[selectedModule] || {};

  return (
    <div className="h-full flex flex-col gap-3 animate-fade-in">
      {/* Header + Module selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-lg">🌱</div>
          <div>
            <h2 className="text-base font-bold text-nexus-text">Bitki Izleme</h2>
            <p className="text-[10px] text-nexus-text-dim">Canli sensor verileri, buyume durumu ve ortam grafikleri</p>
          </div>
        </div>
        <div className="flex gap-1.5">
          {MODULE_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => dispatch({ type: 'SET_SELECTED_MODULE', payload: tab.id })}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
                selectedModule === tab.id
                  ? 'bg-nexus-accent/10 text-nexus-accent border border-nexus-accent/30'
                  : 'bg-nexus-card text-nexus-text-dim hover:bg-nexus-card-hover border border-nexus-border'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 grid grid-cols-12 gap-3 min-h-0">
        {/* Sol: Sensör Gauge'ları */}
        <div className="col-span-4 bg-nexus-card rounded-xl border border-nexus-border p-4 overflow-y-auto">
          <h3 className="text-xs text-nexus-text-dim uppercase tracking-wider mb-4">
            Canlı Sensör Verileri
          </h3>
          <SensorGauges module={module} />

          {/* AI Bitki Sağlığı */}
          <div className="mt-4 pt-4 border-t border-nexus-border">
            <h3 className="text-xs text-nexus-text-dim uppercase tracking-wider mb-2">AI Bitki Sağlığı</h3>
            <div className="flex items-center gap-2 mb-2">
              <div className="text-2xl font-bold font-mono text-nexus-green">
                {state.ai.plantHealth.overallScore}
              </div>
              <span className="text-xs text-nexus-text-dim">/100</span>
            </div>
            {state.ai.plantHealth.issues.map((issue, i) => (
              <div key={i} className={`text-xs flex items-start gap-1.5 mb-1 ${
                issue.severity === 'critical' ? 'text-nexus-red' : 'text-nexus-orange'
              }`}>
                <span>⚠</span>
                <span>{issue.plant}: {issue.issue} (%{issue.confidence})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sağ: Grafikler ve Büyüme */}
        <div className="col-span-8 space-y-4 overflow-y-auto">
          {/* İklim Reçetesi + Büyüme Zaman Çizelgesi */}
          {module.plants && module.plants.length > 0 && (
            <>
              <ClimateRecipePanel plants={module.plants} currentDay={state.time.day} moduleConditions={module} />
              <div className="bg-nexus-card rounded-xl border border-nexus-border p-4">
                <GrowthTimeline plants={module.plants} currentDay={state.time.day} moduleConditions={module} />
              </div>
            </>
          )}

          {/* Kalori üretim trendi */}
          <div className="bg-nexus-card rounded-xl border border-nexus-border p-4">
            <h3 className="text-xs text-nexus-text-dim uppercase tracking-wider mb-2">
              Kalori Üretimi: <span className="text-nexus-green font-mono">
                {formatNumber(state.resources.calories.bySource[selectedModule] || 0)} kcal/gün
              </span>
            </h3>
            <EnvironmentChart
              history={history.temp}
              dataKey="temp"
              label="Sıcaklık (°C)"
              color="#ff8800"
            />
          </div>

          {/* NDVI Health heatmap */}
          {(selectedModule === 'aeroponic' || selectedModule === 'nft') && (
            <NDVIHeatmap />
          )}

          {/* Ortam grafikleri */}
          <div className="bg-nexus-card rounded-xl border border-nexus-border p-4 grid grid-cols-2 gap-4">
            {history.humidity && (
              <EnvironmentChart history={history.humidity} dataKey="humidity" label="Nem (%)" color="#3b82f6" />
            )}
            {history.co2 && (
              <EnvironmentChart history={history.co2} dataKey="co2" label="CO₂ (ppm)" color="#f97316" />
            )}
            {history.ph && (
              <EnvironmentChart history={history.ph} dataKey="ph" label="pH" color="#c084fc" />
            )}
            {history.par && (
              <EnvironmentChart history={history.par} dataKey="par" label="PAR (µmol/m²/s)" color="#22c55e" />
            )}
            {history.ethylene && (
              <EnvironmentChart history={history.ethylene} dataKey="ethylene" label="Etilen (ppb) — APH limit: 25ppb" color="#ff4466" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
