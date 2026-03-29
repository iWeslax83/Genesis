import { useState } from 'react';
import { useGenesis } from '../../context/GenesisContext';
import ClosedLoopDiagram from './ClosedLoopDiagram';
import StatCard from '../ui/StatCard';
import InfoTooltip from '../ui/InfoTooltip';
import WhatsHappening from '../ui/WhatsHappening';
import { formatNumber, getStatusColor } from '../../utils/formatters';
import { COMPARTMENTS, CLOSURE_TARGETS } from '../../simulation/constants';
import { FiChevronDown, FiChevronUp, FiAlertCircle, FiLayers, FiRefreshCw, FiActivity } from 'react-icons/fi';

/* Collapsible Section wrapper */
function Section({ title, icon, defaultOpen = true, badge, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-nexus-card rounded-lg border border-nexus-border overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-nexus-card-hover transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon && <span className="text-nexus-text-dim">{icon}</span>}
          <span className="text-[11px] font-semibold text-nexus-text uppercase tracking-wider">{title}</span>
          {badge && <span className="text-[10px] px-1.5 py-0.5 rounded bg-nexus-bg text-nexus-text-dim font-mono">{badge}</span>}
        </div>
        {open ? <FiChevronUp size={14} className="text-nexus-text-dim" /> : <FiChevronDown size={14} className="text-nexus-text-dim" />}
      </button>
      {open && <div className="px-4 pb-4 animate-fade-in">{children}</div>}
    </div>
  );
}

/* Narrative Hero — plain-language summary */
function NarrativeHero({ state }) {
  const { resources, time, mission, compartments } = state;
  const cal = resources.calories;
  const o2 = compartments.habitat?.o2Level || 21;
  const foodPct = cal.dailyTarget > 0 ? (cal.dailyProduction / cal.dailyTarget * 100) : 0;
  const waterPct = (resources.water?.recycleRate || 0.98) * 100;
  const progress = mission?.missionProgress || 0;

  const overallGood = o2 > 19.5 && foodPct > 70 && waterPct > 95;

  return (
    <div className="bg-nexus-card rounded-lg border border-nexus-border p-4 relative overflow-hidden">
      {/* Left accent */}
      <div className={`absolute top-0 left-0 bottom-0 w-[3px] ${overallGood ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ opacity: 0.6 }} />

      <div className="flex items-start gap-4 pl-2">
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-nexus-text mb-1">
            Gün {time.day} — {overallGood ? 'Tüm Sistemler Normal' : 'Bazı Sistemler Dikkat Gerektiriyor'}
          </h2>
          <p className="text-xs text-nexus-text-dim leading-relaxed">
            {crewSummary(o2, foodPct, waterPct, progress, time)}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-xl font-semibold font-mono text-nexus-text">{progress.toFixed(0)}%</div>
          <div className="text-[10px] text-nexus-text-dim">görev ilerleme</div>
        </div>
      </div>
    </div>
  );
}

function crewSummary(o2, foodPct, waterPct, progress, time) {
  const parts = [];
  parts.push(`Mürettebat ${o2 > 20 ? 'rahatça' : 'zorlanarak'} nefes alıyor`);
  parts.push(`bitkiler ihtiyacın %${foodPct.toFixed(0)}'ini karşılıyor`);
  parts.push(`su geri kazanımı %${waterPct.toFixed(1)}`);

  if (progress < 15) parts.push('görev henüz başında');
  else if (progress > 50) parts.push('yarı yol geçildi');

  const isDaytime = time.hour >= 6 && time.hour < 22;
  parts.push(isDaytime ? 'LED paneller aktif' : 'gece modu');

  return parts.join(' · ') + '.';
}

/* Key Metrics Bar */
function KeyMetrics({ state }) {
  const { resources, power } = state;
  const cal = resources.calories;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <StatCard
        title="Günlük Üretim" value={formatNumber(cal.dailyProduction)}
        unit="kcal" icon={<FiActivity size={14} />} color="#4ead5b"
        subtitle={`Hedef: ${formatNumber(cal.dailyTarget)} kcal`}
      />
      <div className="relative">
        <StatCard
          title="O2 Dengesi"
          value={`${resources.oxygen.balance > 0 ? '+' : ''}${formatNumber(resources.oxygen.balance)}`}
          unit="L/gün"
          color={resources.oxygen.balance >= 0 ? '#4ead5b' : '#d45555'}
        />
        <InfoTooltip metricKey="o2" className="absolute top-2 right-8" />
      </div>
      <StatCard
        title="Güç Kullanımı" value={`${(power?.utilizationPercent || 0).toFixed(0)}`}
        unit="%" color={power?.powerDeficit ? '#d45555' : '#5b8def'}
        subtitle={`${(power?.generation || 0).toFixed(1)} kW üretim`}
      />
    </div>
  );
}

/* Alert Panel */
function AlertPanel({ anomalies }) {
  if (!anomalies || anomalies.length === 0) {
    return (
      <div className="flex items-center gap-2 text-emerald-400 text-xs px-1">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        <span>Tüm sistemler nominal</span>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-40 overflow-y-auto">
      {anomalies.map((a, i) => (
        <div key={a.id || i} className={`text-xs flex items-start gap-2 ${
          a.severity === 'critical' ? 'text-red-400' : 'text-amber-400'
        }`}>
          <span className="mt-0.5 font-mono text-[10px] font-semibold">{a.severity === 'critical' ? '!!' : '!'}</span>
          <span>{a.message}</span>
        </div>
      ))}
    </div>
  );
}

/* Compartment Status */
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
            <span className="text-xs font-mono text-nexus-text-dim w-4">{c.shortName}</span>
            <span className="text-xs text-nexus-text">{c.name}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full`}
              style={{ backgroundColor: getStatusColor(c.status) }} />
            <span className="text-[11px] capitalize font-mono" style={{ color: getStatusColor(c.status) }}>
              {c.status === 'nominal' ? 'Normal' : c.status === 'warning' ? 'Uyarı' : 'Kritik'}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* Closure Rates */
function ClosureRatesPanel({ closure }) {
  const c = closure || { o2: 0, co2: 0, water: 0, food: 0, material: 0 };
  const items = [
    { key: 'o2', label: 'O2', target: CLOSURE_TARGETS.o2.target, color: '#4ead5b' },
    { key: 'co2', label: 'CO2', target: CLOSURE_TARGETS.co2.target, color: '#4ead5b' },
    { key: 'water', label: 'Su', target: CLOSURE_TARGETS.water.target, color: '#5b8def' },
    { key: 'food', label: 'Gıda', target: CLOSURE_TARGETS.food.target, color: '#d4903a' },
  ];
  const overall = c.material || 0;
  const overallColor = overall >= 90 ? '#4ead5b' : overall >= 70 ? '#d4903a' : '#d45555';

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1">
          <span className="text-xs text-nexus-text-dim">Genel:</span>
          <span className="text-sm font-mono font-semibold" style={{ color: overallColor }}>%{overall.toFixed(0)}</span>
          <InfoTooltip metricKey="closure" size={11} />
        </div>
      </div>
      <div className="space-y-1.5">
        {items.map(({ key, label, target, color }) => {
          const val = c[key] || 0;
          const barColor = val >= target * 0.95 ? color : val >= target * 0.7 ? '#d4903a' : '#d45555';
          return (
            <div key={key}>
              <div className="flex justify-between text-xs mb-0.5">
                <span className="text-nexus-text-dim">{label}</span>
                <span className="font-mono" style={{ color: barColor }}>%{val.toFixed(1)}</span>
              </div>
              <div className="h-1 bg-nexus-bg rounded-full overflow-hidden relative">
                <div className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(100, val)}%`, backgroundColor: barColor }} />
                <div className="absolute top-0 h-full w-px bg-white/20"
                  style={{ left: `${Math.min(100, target)}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* MAIN PAGE */
export default function OverviewPage() {
  const { state } = useGenesis();
  const { resources, ai } = state;

  return (
    <div className="h-full flex flex-col gap-3 animate-fade-in">
      {/* 1. Narrative Hero */}
      <NarrativeHero state={state} />

      {/* 2. Key Metrics */}
      <KeyMetrics state={state} />

      {/* 3. Main content: 3 columns */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">

        {/* LEFT COLUMN */}
        <div className="col-span-12 lg:col-span-3 space-y-3 overflow-y-auto">
          <WhatsHappening />

          <Section title="Alarmlar" icon={<FiAlertCircle size={13} />} badge={ai.anomalies.length > 0 ? `${ai.anomalies.length}` : null}>
            <AlertPanel anomalies={ai.anomalies} />
          </Section>

          <Section title="Kompartıman Durumu" icon={<FiLayers size={13} />} defaultOpen={true}>
            <CompartmentStatusGrid />
          </Section>
        </div>

        {/* CENTER: MELiSSA Diagram */}
        <div className="col-span-12 lg:col-span-6 bg-nexus-card rounded-lg border border-nexus-border p-3 flex flex-col overflow-hidden">
          <div className="flex items-center gap-2 mb-1 flex-shrink-0">
            <h3 className="text-[11px] text-nexus-text-dim uppercase tracking-wider">
              MELiSSA Kapalı Döngü Kaynak Akışı
            </h3>
            <InfoTooltip metricKey="melissa" size={12} />
          </div>
          <div className="flex-1 min-h-0 flex items-center justify-center">
            <ClosedLoopDiagram />
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="col-span-12 lg:col-span-3 space-y-3 overflow-y-auto">
          <Section title="BLSS Kapalılık Oranları" icon={<FiRefreshCw size={13} />} defaultOpen={true}>
            <ClosureRatesPanel closure={resources.closure} />
          </Section>
        </div>
      </div>
    </div>
  );
}
