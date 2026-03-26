import { useGenesis } from '../../context/GenesisContext';
import ClosedLoopDiagram from './ClosedLoopDiagram';
import StatCard from '../ui/StatCard';
import { formatNumber, getStatusColor } from '../../utils/formatters';
import { COMPARTMENTS, CLOSURE_TARGETS, LED_SPECTRUM, PHOTOPERIOD } from '../../simulation/constants';

function ResourceCycleCard({ title, icon, value, unit, percentage, color, subtitle }) {
  return (
    <div className="bg-nexus-card rounded-xl border border-nexus-border p-3 hover:border-opacity-50 transition-all" style={{ borderColor: `${color}20` }}>
      <div className="flex items-center gap-2 mb-2">
        <span>{icon}</span>
        <span className="text-xs text-nexus-text-dim uppercase tracking-wider">{title}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-lg font-bold font-mono" style={{ color }}>{value}</span>
        <span className="text-xs text-nexus-text-dim">{unit}</span>
      </div>
      <div className="mt-2 h-1.5 bg-nexus-bg rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${Math.min(100, percentage)}%`, backgroundColor: color }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-nexus-text-dim mt-1">
        <span>{subtitle || ''}</span>
        <span>{percentage.toFixed(1)}%</span>
      </div>
    </div>
  );
}

function AlertPanel({ anomalies }) {
  if (!anomalies || anomalies.length === 0) {
    return (
      <div className="bg-nexus-card rounded-xl border border-nexus-border p-4">
        <h3 className="text-xs text-nexus-text-dim uppercase tracking-wider mb-3">Alarmlar</h3>
        <div className="flex items-center gap-2 text-emerald-400 text-sm">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Tum sistemler nominal</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-nexus-card rounded-xl border border-nexus-border p-4">
      <h3 className="text-xs text-nexus-text-dim uppercase tracking-wider mb-3">
        Alarmlar <span className="text-red-400 font-mono">({anomalies.length})</span>
      </h3>
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {anomalies.map((a, i) => (
          <div key={a.id || i} className={`text-xs flex items-start gap-2 ${
            a.severity === 'critical' ? 'text-red-400' : 'text-amber-400'
          }`}>
            <span className="mt-0.5">{a.severity === 'critical' ? '!!' : '!'}</span>
            <span>{a.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CompartmentStatusGrid() {
  const { state } = useGenesis();
  const comps = state.compartments;

  const statuses = [
    { ...COMPARTMENTS.waste, status: comps.waste.status },
    { ...COMPARTMENTS.nutrient, status: comps.nutrient.status },
    { ...COMPARTMENTS.growth, status: comps.growth?.status || 'nominal' },
    { ...COMPARTMENTS.habitat, status: comps.habitat.status },
  ];

  return (
    <div className="bg-nexus-card rounded-xl border border-nexus-border p-4">
      <h3 className="text-xs text-nexus-text-dim uppercase tracking-wider mb-3">Kompartman Durumu</h3>
      <div className="space-y-2">
        {statuses.map((c) => (
          <div key={c.id} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm">{c.icon}</span>
              <span className="text-xs text-nexus-text">{c.shortName}: {c.name}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${c.status === 'critical' ? 'animate-blink' : ''}`}
                style={{ backgroundColor: getStatusColor(c.status) }} />
              <span className="text-xs capitalize" style={{ color: getStatusColor(c.status) }}>
                {c.status === 'nominal' ? 'Normal' : c.status === 'warning' ? 'Uyari' : 'Kritik'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const SOURCE_COLORS = {
  aeroponic: '#22c55e', nft: '#06b6d4', spirulina: '#00f0ff',
  mushroom: '#a855f7', mealworm: '#ff8800',
};
const SOURCE_LABELS = {
  aeroponic: 'Aeroponik', nft: 'NFT', spirulina: 'Spirulina',
  mushroom: 'Mantar', mealworm: 'Bocek P.',
};

function ClosureRatesPanel({ closure }) {
  const c = closure || { o2: 0, co2: 0, water: 0, food: 0, material: 0 };
  const items = [
    { key: 'o2', label: 'O2 Kapaliligi', icon: '🫁', target: CLOSURE_TARGETS.o2.target, color: '#34d399' },
    { key: 'co2', label: 'CO2 Kapaliligi', icon: '🌿', target: CLOSURE_TARGETS.co2.target, color: '#22c55e' },
    { key: 'water', label: 'Su Kapaliligi', icon: '💧', target: CLOSURE_TARGETS.water.target, color: '#3b82f6' },
    { key: 'food', label: 'Gida Kapaliligi', icon: '🌾', target: CLOSURE_TARGETS.food.target, color: '#ff8800' },
  ];

  const overall = c.material || 0;
  const overallColor = overall >= 90 ? '#00ff88' : overall >= 70 ? '#ff8800' : '#ff4466';

  return (
    <div className="bg-nexus-card rounded-xl border border-nexus-border p-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs text-nexus-text-dim uppercase tracking-wider">BLSS Kapalilık Oranlari</h3>
        <div className="flex items-center gap-1">
          <span className="text-xs font-mono font-bold" style={{ color: overallColor }}>%{overall.toFixed(0)}</span>
          <span className="text-[10px] text-nexus-text-dim">genel</span>
        </div>
      </div>
      <div className="space-y-1.5">
        {items.map(({ key, label, icon, target, color }) => {
          const val = c[key] || 0;
          const ratio = Math.min(100, val);
          const barColor = val >= target * 0.95 ? color : val >= target * 0.7 ? '#ff8800' : '#ff4466';
          return (
            <div key={key}>
              <div className="flex justify-between text-xs mb-0.5">
                <span className="text-nexus-text-dim">{icon} {label}</span>
                <span className="font-mono" style={{ color: barColor }}>%{val.toFixed(1)}</span>
              </div>
              <div className="h-1 bg-nexus-bg rounded-full overflow-hidden relative">
                <div className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${ratio}%`, backgroundColor: barColor }} />
                <div className="absolute top-0 h-full w-px bg-white/30"
                  style={{ left: `${Math.min(100, target)}%` }} />
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-[9px] text-nexus-text-dim mt-2 italic">
        Referans: Yuegong-1 %98.2 malzeme kapaliligi (370 gun)
      </p>
    </div>
  );
}

function LEDSpectrumMini({ hour }) {
  const isDaytime = hour >= PHOTOPERIOD.lightOn && hour < PHOTOPERIOD.lightOff;
  if (!isDaytime) {
    return (
      <div className="bg-nexus-card rounded-xl border border-nexus-border p-3">
        <h3 className="text-xs text-nexus-text-dim uppercase tracking-wider mb-2">LED Spektrum</h3>
        <div className="flex items-center justify-center h-8 text-xs text-indigo-400">
          🌙 Gece Modu — LED Kapali
        </div>
      </div>
    );
  }

  return (
    <div className="bg-nexus-card rounded-xl border border-nexus-border p-3">
      <h3 className="text-xs text-nexus-text-dim uppercase tracking-wider mb-2">LED Spektrum (VEGGIE)</h3>
      <div className="flex gap-1 h-8 items-end">
        {Object.entries(LED_SPECTRUM).map(([key, spec]) => (
          <div key={key} className="flex-1 flex flex-col items-center">
            <div
              className="w-full rounded-t transition-all duration-500"
              style={{
                height: `${spec.ratio * 100}%`,
                backgroundColor: spec.color,
                opacity: 0.8,
                minHeight: '4px',
                boxShadow: `0 0 8px ${spec.color}40`,
              }}
            />
            <span className="text-[8px] text-nexus-text-dim mt-0.5">{spec.wavelength < 1000 ? `${spec.wavelength}nm` : 'W'}</span>
          </div>
        ))}
      </div>
      <p className="text-[9px] text-nexus-text-dim mt-1">12R:3B:1G orani — {PHOTOPERIOD.totalLight}h foto / {PHOTOPERIOD.totalDark}h karanlik</p>
    </div>
  );
}

function QuickGauge({ value, max, label, unit, color }) {
  const pct = Math.min(100, (value / max) * 100);
  const r = 28;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct / 100 * 0.75);

  return (
    <div className="flex flex-col items-center">
      <svg width={72} height={72} viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={r} fill="none" stroke="#1e293b" strokeWidth="5"
          strokeDasharray={`${circ * 0.75} ${circ * 0.25}`}
          transform="rotate(135 36 36)" />
        <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={`${circ * 0.75} ${circ * 0.25}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(135 36 36)"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
        <text x="36" y="33" textAnchor="middle" fill={color} fontSize="13" fontWeight="bold" fontFamily="monospace">
          {typeof value === 'number' ? (value > 999 ? formatNumber(value) : value.toFixed(0)) : value}
        </text>
        <text x="36" y="45" textAnchor="middle" fill="#94a3b8" fontSize="7">{unit}</text>
      </svg>
      <span className="text-[9px] text-nexus-text-dim mt-0.5">{label}</span>
    </div>
  );
}

export default function OverviewPage() {
  const { state } = useGenesis();
  const { resources, ai, time, power, degradation, mission } = state;
  const cal = resources.calories;

  const o2Ratio = resources.oxygen.production > 0
    ? (resources.oxygen.production / resources.oxygen.consumption * 100) : 100;
  const co2Ratio = resources.co2.absorption > 0
    ? (resources.co2.absorption / resources.co2.production * 100) : 100;
  const waterRate = resources.water.recycleRate * 100;
  const nutrientRate = resources.nutrients.recycledFromWaste || 78;

  return (
    <div className="h-full flex flex-col gap-3 animate-fade-in">
      {/* Top row: Key metric cards */}
      <div className="grid grid-cols-5 gap-3">
        <StatCard
          title="Gunluk Uretim" value={formatNumber(cal.dailyProduction)}
          unit="kcal" icon="🌾" color="#00ff88"
          subtitle={`Hedef: ${formatNumber(cal.dailyTarget)} kcal`}
        />
        <StatCard
          title="O2 Dengesi"
          value={`${resources.oxygen.balance > 0 ? '+' : ''}${formatNumber(resources.oxygen.balance)}`}
          unit="L/gun" icon="🫁"
          color={resources.oxygen.balance >= 0 ? '#00ff88' : '#ff4466'}
        />
        <StatCard
          title="Su Geri Kazanim" value={waterRate.toFixed(1)}
          unit="%" icon="💧" color="#3b82f6"
          subtitle="Hedef: %98.7"
        />
        <StatCard
          title="Guc Kullanimi" value={`${(power?.utilizationPercent || 0).toFixed(0)}`}
          unit="%" icon="⚡" color={power?.powerDeficit ? '#ff4466' : '#00f0ff'}
          subtitle={`${(power?.generation || 0).toFixed(1)} kW uretim`}
        />
        <StatCard
          title="Gorev Ilerleme" value={`${(mission?.missionProgress || 0).toFixed(1)}`}
          unit="%" icon="🚀" color="#a855f7"
          subtitle={`Gun ${time.day} / ${mission?.totalMissionDays || 980}`}
        />
      </div>

      {/* Main content: 3 columns */}
      <div className="flex-1 grid grid-cols-12 gap-3 min-h-0">
        {/* Left: Closure + LED + Resource Cycles */}
        <div className="col-span-3 space-y-3 overflow-y-auto">
          <ClosureRatesPanel closure={resources.closure} />
          <LEDSpectrumMini hour={time.hour} />

          {/* Quick gauges */}
          <div className="bg-nexus-card rounded-xl border border-nexus-border p-3">
            <h3 className="text-xs text-nexus-text-dim uppercase tracking-wider mb-2">Kaynak Dongusu</h3>
            <div className="flex justify-around">
              <QuickGauge value={o2Ratio} max={150} label="O2 Oran" unit="%" color="#34d399" />
              <QuickGauge value={co2Ratio} max={150} label="CO2 Emilim" unit="%" color="#22c55e" />
              <QuickGauge value={nutrientRate} max={100} label="Besin G.D." unit="%" color="#c084fc" />
            </div>
          </div>

          <ResourceCycleCard
            title="Bilesen Sagligi" icon="🔧"
            value={(degradation?.averageHealth || 100).toFixed(0)} unit="%"
            percentage={degradation?.averageHealth || 100}
            color={(degradation?.averageHealth || 100) > 70 ? '#22c55e' : '#f59e0b'}
            subtitle="HEPA, Pompa, LED, CO2"
          />
        </div>

        {/* Center: MELiSSA Closed Loop Diagram */}
        <div className="col-span-6 bg-nexus-card rounded-xl border border-nexus-border p-3 flex flex-col">
          <h3 className="text-xs text-nexus-text-dim uppercase tracking-wider mb-1">
            MELiSSA Bazli Kapali Dongu Kaynak Akisi
          </h3>
          <div className="flex-1 min-h-0">
            <ClosedLoopDiagram />
          </div>
        </div>

        {/* Right: Alerts + Compartments + Calories */}
        <div className="col-span-3 space-y-3 overflow-y-auto">
          <AlertPanel anomalies={ai.anomalies} />
          <CompartmentStatusGrid />

          {/* Calorie sources */}
          <div className="bg-nexus-card rounded-xl border border-nexus-border p-4">
            <h3 className="text-xs text-nexus-text-dim uppercase tracking-wider mb-3">Kalori Kaynaklari</h3>
            {Object.entries(cal.bySource).map(([key, val]) => (
              <div key={key} className="mb-2">
                <div className="flex justify-between text-xs mb-0.5">
                  <span className="text-nexus-text">{SOURCE_LABELS[key] || key}</span>
                  <span className="text-nexus-text-dim font-mono">{formatNumber(val)} kcal</span>
                </div>
                <div className="h-1.5 bg-nexus-bg rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${cal.dailyProduction > 0 ? (val / cal.dailyProduction * 100) : 0}%`,
                      backgroundColor: SOURCE_COLORS[key] || '#94a3b8',
                    }}
                  />
                </div>
              </div>
            ))}
            <div className="mt-2 pt-2 border-t border-nexus-border flex justify-between text-xs">
              <span className="text-nexus-text-dim">Protein</span>
              <span className="font-mono text-cyan-400">{formatNumber(cal.protein)} g</span>
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span className="text-nexus-text-dim">Karb. / Yag</span>
              <span className="font-mono text-nexus-text-dim">{formatNumber(cal.carbs)}g / {formatNumber(cal.fat)}g</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
