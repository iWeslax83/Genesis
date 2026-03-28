import { useState } from 'react';
import { useGenesis } from '../../context/GenesisContext';
import ClosedLoopDiagram from './ClosedLoopDiagram';
import StatCard from '../ui/StatCard';
import InfoTooltip from '../ui/InfoTooltip';
import WhatsHappening from '../ui/WhatsHappening';
import { formatNumber, getStatusColor } from '../../utils/formatters';
import { COMPARTMENTS, CLOSURE_TARGETS, LED_SPECTRUM, PHOTOPERIOD } from '../../simulation/constants';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

/* ─── Collapsible Section wrapper ─── */
function Section({ title, icon, defaultOpen = true, badge, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-nexus-card rounded-xl border border-nexus-border overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-nexus-card-hover transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon && <span className="text-sm">{icon}</span>}
          <span className="text-xs font-bold text-nexus-text uppercase tracking-wider">{title}</span>
          {badge && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-nexus-accent/10 text-nexus-accent font-mono">{badge}</span>}
        </div>
        {open ? <FiChevronUp size={14} className="text-nexus-text-dim" /> : <FiChevronDown size={14} className="text-nexus-text-dim" />}
      </button>
      {open && <div className="px-4 pb-4 animate-fade-in">{children}</div>}
    </div>
  );
}

/* ─── Narrative Hero — plain-language summary ─── */
function NarrativeHero({ state }) {
  const { resources, time, mission, compartments } = state;
  const cal = resources.calories;
  const o2 = compartments.habitat?.o2Level || 21;
  const foodPct = cal.dailyTarget > 0 ? (cal.dailyProduction / cal.dailyTarget * 100) : 0;
  const waterPct = (resources.water?.recycleRate || 0.98) * 100;
  const progress = mission?.missionProgress || 0;

  // Pick a status emoji
  const overallGood = o2 > 19.5 && foodPct > 70 && waterPct > 95;

  return (
    <div className="bg-gradient-to-r from-nexus-card to-nexus-card/80 rounded-xl border border-nexus-border p-4 relative overflow-hidden">
      {/* Subtle gradient accent */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 via-cyan-500 to-purple-500 opacity-50" />

      <div className="flex items-start gap-4">
        <div className="text-3xl">{overallGood ? '🟢' : '🟡'}</div>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-bold text-nexus-text mb-1">
            Gün {time.day} — {overallGood ? 'Tüm Sistemler Normal' : 'Bazı Sistemler Dikkat Gerektiriyor'}
          </h2>
          <p className="text-xs text-nexus-text-dim leading-relaxed">
            {crew6Summary(o2, foodPct, waterPct, progress, time)}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-2xl font-bold font-mono text-nexus-accent">{progress.toFixed(0)}%</div>
          <div className="text-[10px] text-nexus-text-dim">görev ilerleme</div>
        </div>
      </div>
    </div>
  );
}

function crew6Summary(o2, foodPct, waterPct, progress, time) {
  const parts = [];
  parts.push(`6 kişilik mürettebat ${o2 > 20 ? 'rahatça' : 'zorlanarak'} nefes alıyor`);
  parts.push(`bitkiler ihtiyacın %${foodPct.toFixed(0)}'ini karşılıyor`);
  parts.push(`su geri kazanımı %${waterPct.toFixed(1)}`);

  if (progress < 15) parts.push('görev henüz başında');
  else if (progress > 50) parts.push('yarı yol geçildi');

  const isDaytime = time.hour >= 6 && time.hour < 22;
  parts.push(isDaytime ? 'LED paneller aktif' : 'gece modu');

  return parts.join(' · ') + '.';
}

/* ─── Key Metrics Bar ─── */
function KeyMetrics({ state }) {
  const { resources, power, mission, time } = state;
  const cal = resources.calories;
  const waterRate = (resources.water?.recycleRate || 0.98) * 100;

  return (
    <div className="grid grid-cols-5 gap-3">
      <StatCard
        title="Günlük Üretim" value={formatNumber(cal.dailyProduction)}
        unit="kcal" icon="🌾" color="#00ff88"
        subtitle={`Hedef: ${formatNumber(cal.dailyTarget)} kcal`}
      />
      <div className="relative">
        <StatCard
          title="O2 Dengesi"
          value={`${resources.oxygen.balance > 0 ? '+' : ''}${formatNumber(resources.oxygen.balance)}`}
          unit="L/gun" icon="🫁"
          color={resources.oxygen.balance >= 0 ? '#00ff88' : '#ff4466'}
        />
        <InfoTooltip metricKey="o2" className="absolute top-2 right-8" />
      </div>
      <div className="relative">
        <StatCard
          title="Su Geri Kazanım" value={waterRate.toFixed(1)}
          unit="%" icon="💧" color="#3b82f6"
          subtitle="Hedef: %98.7"
        />
        <InfoTooltip metricKey="waterRecycle" className="absolute top-2 right-8" />
      </div>
      <StatCard
        title="Güç Kullanımı" value={`${(power?.utilizationPercent || 0).toFixed(0)}`}
        unit="%" icon="⚡" color={power?.powerDeficit ? '#ff4466' : '#00f0ff'}
        subtitle={`${(power?.generation || 0).toFixed(1)} kW uretim`}
      />
      <StatCard
        title="Görev İlerleme" value={`${(mission?.missionProgress || 0).toFixed(1)}`}
        unit="%" icon="🚀" color="#a855f7"
        subtitle={`Gün ${time.day} / ${mission?.totalMissionDays || 980}`}
      />
    </div>
  );
}

/* ─── Simplified Resource Cards ─── */
function ResourceCycleCard({ title, icon, value, unit, percentage, color, subtitle, metricKey }) {
  return (
    <div className="bg-nexus-card rounded-xl border border-nexus-border p-3 hover:border-opacity-50 transition-all" style={{ borderColor: `${color}20` }}>
      <div className="flex items-center gap-2 mb-2">
        <span>{icon}</span>
        <span className="text-xs text-nexus-text-dim uppercase tracking-wider">{title}</span>
        {metricKey && <InfoTooltip metricKey={metricKey} size={11} />}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-lg font-bold font-mono" style={{ color }}>{value}</span>
        <span className="text-xs text-nexus-text-dim">{unit}</span>
      </div>
      <div className="mt-2 h-1.5 bg-nexus-bg rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${Math.min(100, percentage)}%`, backgroundColor: color }} />
      </div>
      <div className="flex justify-between text-[10px] text-nexus-text-dim mt-1">
        <span>{subtitle || ''}</span>
        <span>{percentage.toFixed(1)}%</span>
      </div>
    </div>
  );
}

/* ─── Alert Panel ─── */
function AlertPanel({ anomalies }) {
  if (!anomalies || anomalies.length === 0) {
    return (
      <div className="flex items-center gap-2 text-emerald-400 text-sm px-1">
        <div className="w-2 h-2 rounded-full bg-emerald-500" />
        <span className="text-xs">Tüm sistemler nominal</span>
      </div>
    );
  }

  return (
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
  );
}

/* ─── Compartment Status ─── */
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
              {c.status === 'nominal' ? 'Normal' : c.status === 'warning' ? 'Uyarı' : 'Kritik'}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Closure Rates ─── */
function ClosureRatesPanel({ closure }) {
  const c = closure || { o2: 0, co2: 0, water: 0, food: 0, material: 0 };
  const items = [
    { key: 'o2', label: 'O2', target: CLOSURE_TARGETS.o2.target, color: '#34d399' },
    { key: 'co2', label: 'CO2', target: CLOSURE_TARGETS.co2.target, color: '#22c55e' },
    { key: 'water', label: 'Su', target: CLOSURE_TARGETS.water.target, color: '#3b82f6' },
    { key: 'food', label: 'Gıda', target: CLOSURE_TARGETS.food.target, color: '#ff8800' },
  ];
  const overall = c.material || 0;
  const overallColor = overall >= 90 ? '#00ff88' : overall >= 70 ? '#ff8800' : '#ff4466';

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1">
          <span className="text-xs text-nexus-text-dim">Genel:</span>
          <span className="text-sm font-mono font-bold" style={{ color: overallColor }}>%{overall.toFixed(0)}</span>
          <InfoTooltip metricKey="closure" size={11} />
        </div>
      </div>
      <div className="space-y-1.5">
        {items.map(({ key, label, target, color }) => {
          const val = c[key] || 0;
          const barColor = val >= target * 0.95 ? color : val >= target * 0.7 ? '#ff8800' : '#ff4466';
          return (
            <div key={key}>
              <div className="flex justify-between text-xs mb-0.5">
                <span className="text-nexus-text-dim">{label}</span>
                <span className="font-mono" style={{ color: barColor }}>%{val.toFixed(1)}</span>
              </div>
              <div className="h-1 bg-nexus-bg rounded-full overflow-hidden relative">
                <div className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(100, val)}%`, backgroundColor: barColor }} />
                <div className="absolute top-0 h-full w-px bg-white/30"
                  style={{ left: `${Math.min(100, target)}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Quick Gauge ─── */
function QuickGauge({ value, max, label, unit, color, metricKey }) {
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
      <div className="flex items-center gap-0.5">
        <span className="text-[9px] text-nexus-text-dim mt-0.5">{label}</span>
        {metricKey && <InfoTooltip metricKey={metricKey} size={9} />}
      </div>
    </div>
  );
}

/* ─── LED Spectrum Mini ─── */
function LEDSpectrumMini({ hour }) {
  const isDaytime = hour >= PHOTOPERIOD.lightOn && hour < PHOTOPERIOD.lightOff;
  if (!isDaytime) {
    return (
      <div className="flex items-center justify-center h-8 text-xs text-indigo-400">
        🌙 Gece Modu — LED Kapali
      </div>
    );
  }
  return (
    <div>
      <div className="flex gap-1 h-8 items-end">
        {Object.entries(LED_SPECTRUM).map(([key, spec]) => (
          <div key={key} className="flex-1 flex flex-col items-center">
            <div className="w-full rounded-t transition-all duration-500"
              style={{
                height: `${spec.ratio * 100}%`,
                backgroundColor: spec.color,
                opacity: 0.8,
                minHeight: '4px',
                boxShadow: `0 0 8px ${spec.color}40`,
              }} />
            <span className="text-[8px] text-nexus-text-dim mt-0.5">{spec.wavelength < 1000 ? `${spec.wavelength}nm` : 'W'}</span>
          </div>
        ))}
      </div>
      <p className="text-[9px] text-nexus-text-dim mt-1">12R:3B:1G — {PHOTOPERIOD.totalLight}h foto / {PHOTOPERIOD.totalDark}h karanlik</p>
    </div>
  );
}

/* ─── Calorie Sources ─── */
const SOURCE_COLORS = {
  aeroponic: '#22c55e', nft: '#06b6d4', spirulina: '#00f0ff',
  mushroom: '#a855f7', mealworm: '#ff8800',
};
const SOURCE_LABELS = {
  aeroponic: 'Aeroponik', nft: 'NFT', spirulina: 'Spirulina',
  mushroom: 'Mantar', mealworm: 'Bocek P.',
};

function CalorieSources({ cal }) {
  return (
    <div>
      {Object.entries(cal.bySource).map(([key, val]) => (
        <div key={key} className="mb-2">
          <div className="flex justify-between text-xs mb-0.5">
            <div className="flex items-center gap-1">
              <span className="text-nexus-text">{SOURCE_LABELS[key] || key}</span>
              {(key === 'aeroponic' || key === 'nft' || key === 'spirulina') && (
                <InfoTooltip metricKey={key} size={10} />
              )}
            </div>
            <span className="text-nexus-text-dim font-mono">{formatNumber(val)} kcal</span>
          </div>
          <div className="h-1.5 bg-nexus-bg rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${cal.dailyProduction > 0 ? (val / cal.dailyProduction * 100) : 0}%`,
                backgroundColor: SOURCE_COLORS[key] || '#94a3b8',
              }} />
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
  );
}

/* ═══════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════ */
export default function OverviewPage() {
  const { state } = useGenesis();
  const { resources, ai, time, power, degradation, mission } = state;
  const cal = resources.calories;

  const o2Ratio = resources.oxygen.production > 0
    ? (resources.oxygen.production / resources.oxygen.consumption * 100) : 100;
  const co2Ratio = resources.co2.absorption > 0
    ? (resources.co2.absorption / resources.co2.production * 100) : 100;
  const nutrientRate = resources.nutrients.recycledFromWaste || 78;

  return (
    <div className="h-full flex flex-col gap-3 animate-fade-in">
      {/* 1. Narrative Hero — plain-language status */}
      <NarrativeHero state={state} />

      {/* 2. Key Metrics — simplified top cards */}
      <KeyMetrics state={state} />

      {/* 3. Main content: 3 columns */}
      <div className="flex-1 grid grid-cols-12 gap-3 min-h-0">

        {/* LEFT COLUMN */}
        <div className="col-span-3 space-y-3 overflow-y-auto">
          {/* What's Happening — narrator panel */}
          <WhatsHappening />

          {/* Alarms — always visible */}
          <Section title="Alarmlar" icon="🔔" badge={ai.anomalies.length > 0 ? `${ai.anomalies.length}` : null}>
            <AlertPanel anomalies={ai.anomalies} />
          </Section>

          {/* Compartment status */}
          <Section title="Kompartıman Durumu" icon="🏗️" defaultOpen={true}>
            <CompartmentStatusGrid />
          </Section>
        </div>

        {/* CENTER: MELiSSA Diagram */}
        <div className="col-span-6 bg-nexus-card rounded-xl border border-nexus-border p-3 flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xs text-nexus-text-dim uppercase tracking-wider">
              MELiSSA Kapalı Döngü Kaynak Akışı
            </h3>
            <InfoTooltip metricKey="melissa" size={12} />
          </div>
          <div className="flex-1 min-h-0">
            <ClosedLoopDiagram />
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="col-span-3 space-y-3 overflow-y-auto">
          {/* Closure rates — key info, always open */}
          <Section title="BLSS Kapalılık Oranları" icon="♻️" defaultOpen={true}>
            <ClosureRatesPanel closure={resources.closure} />
          </Section>

          {/* Calorie sources */}
          <Section title="Kalori Kaynakları" icon="🍽️" defaultOpen={true}>
            <CalorieSources cal={cal} />
          </Section>

          {/* ── ADVANCED: collapsed by default ── */}
          <Section title="Kaynak Döngüsü" icon="⚙️" defaultOpen={false} badge="detay">
            <div className="flex justify-around">
              <QuickGauge value={o2Ratio} max={150} label="O2 Oran" unit="%" color="#34d399" metricKey="o2" />
              <QuickGauge value={co2Ratio} max={150} label="CO2 Emilim" unit="%" color="#22c55e" metricKey="co2" />
              <QuickGauge value={nutrientRate} max={100} label="Besin G.D." unit="%" color="#c084fc" />
            </div>
          </Section>

          <Section title="LED Spektrum" icon="💡" defaultOpen={false} badge="detay">
            <LEDSpectrumMini hour={time.hour} />
          </Section>

          <Section title="Ekipman Sağlığı" icon="🔧" defaultOpen={false} badge="detay">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-nexus-text-dim">Ortalama Sağlık</span>
                  <span className="font-mono" style={{ color: (degradation?.averageHealth || 100) > 70 ? '#22c55e' : '#f59e0b' }}>
                    %{(degradation?.averageHealth || 100).toFixed(0)}
                  </span>
                </div>
                <div className="h-1.5 bg-nexus-bg rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${degradation?.averageHealth || 100}%`,
                      backgroundColor: (degradation?.averageHealth || 100) > 70 ? '#22c55e' : '#f59e0b'
                    }} />
                </div>
              </div>
              <InfoTooltip metricKey="degradation" size={11} />
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
