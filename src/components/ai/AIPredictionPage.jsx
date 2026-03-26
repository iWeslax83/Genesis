import React from 'react';
import { useGenesis } from '../../context/GenesisContext';
import { PLANTS, INITIAL_PLANTS } from '../../simulation/constants';
import { calculatePlantGrowth } from '../../simulation/plantGrowthModel';
import { formatNumber } from '../../utils/formatters';
import { FiCpu, FiAlertTriangle, FiTrendingUp, FiShield, FiCheckCircle } from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const TOOLTIP_STYLE = { background: '#1a1f36', border: '1px solid #2a3154', borderRadius: 8 };

function SystemHealthScore({ state }) {
  const health = state.resources?.healthScore ?? 94;
  const anomalyCount = state.ai?.anomalies?.length || 0;
  const critCount = (state.ai?.anomalies || []).filter(a => a.severity === 'critical').length;
  const plantScore = state.ai?.plantHealth?.overallScore || 95;
  const degradation = state.degradation?.averageHealth || 100;

  const overallScore = Math.round((health + plantScore + degradation) / 3);
  const color = overallScore >= 80 ? '#22c55e' : overallScore >= 60 ? '#f59e0b' : '#ef4444';

  const r = 52;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - overallScore / 100 * 0.75);

  return (
    <div className="bg-nexus-card rounded-xl border border-nexus-border p-4 flex items-center gap-4">
      <svg width={120} height={120} viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#1e293b" strokeWidth="8"
          strokeDasharray={`${circ * 0.75} ${circ * 0.25}`}
          transform="rotate(135 60 60)" />
        <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${circ * 0.75} ${circ * 0.25}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(135 60 60)"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
        <text x="60" y="55" textAnchor="middle" fill={color} fontSize="24" fontWeight="bold" fontFamily="monospace">{overallScore}</text>
        <text x="60" y="72" textAnchor="middle" fill="#94a3b8" fontSize="9">GENEL SKOR</text>
      </svg>
      <div className="flex-1 space-y-2">
        <ScoreLine label="Sistem Sagligi" value={health} />
        <ScoreLine label="Bitki Sagligi" value={plantScore} />
        <ScoreLine label="Bilesen Sagligi" value={Math.round(degradation)} />
        <div className="pt-2 border-t border-nexus-border flex items-center gap-3 text-xs">
          {critCount > 0 ? (
            <span className="text-red-400 flex items-center gap-1"><FiAlertTriangle size={12} /> {critCount} kritik alarm</span>
          ) : anomalyCount > 0 ? (
            <span className="text-amber-400 flex items-center gap-1"><FiAlertTriangle size={12} /> {anomalyCount} uyari</span>
          ) : (
            <span className="text-emerald-400 flex items-center gap-1"><FiCheckCircle size={12} /> Tum sistemler nominal</span>
          )}
        </div>
      </div>
    </div>
  );
}

function ScoreLine({ label, value }) {
  const color = value >= 80 ? '#22c55e' : value >= 60 ? '#f59e0b' : '#ef4444';
  return (
    <div>
      <div className="flex justify-between text-xs mb-0.5">
        <span className="text-nexus-text-dim">{label}</span>
        <span className="font-mono font-bold" style={{ color }}>{value}</span>
      </div>
      <div className="h-1 bg-nexus-bg rounded-full">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function HarvestPrediction({ currentDay }) {
  const allPlants = [...INITIAL_PLANTS.aeroponic, ...INITIAL_PLANTS.nft];

  return (
    <div className="bg-nexus-card rounded-xl border border-nexus-border p-4">
      <h3 className="text-xs text-nexus-text-dim uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <FiTrendingUp size={12} className="text-emerald-400" /> Hasat Tahmini
      </h3>
      <div className="space-y-2.5">
        {allPlants.map((pg, i) => {
          const plantDef = PLANTS[pg.type];
          if (!plantDef) return null;
          const growth = calculatePlantGrowth(pg.type, currentDay - pg.plantedDay);
          const daysLeft = growth.daysRemaining;
          const confidence = Math.min(99, 70 + growth.progress * 25);

          return (
            <div key={i} className="flex items-center gap-2.5">
              <span className="text-sm w-5">{plantDef.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                  <span className="text-xs text-nexus-text truncate">{plantDef.name} <span className="text-nexus-text-dim">x{pg.count}</span></span>
                  <span className={`text-[10px] font-mono ${growth.isReady ? 'text-emerald-400' : 'text-nexus-text-dim'}`}>
                    {growth.isReady ? '✓ Hazir' : `${daysLeft}g`}
                  </span>
                </div>
                <div className="h-1.5 bg-nexus-bg rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${growth.progress * 100}%`,
                      backgroundColor: growth.isReady ? '#22c55e' : growth.progress > 0.7 ? '#f59e0b' : '#06b6d4',
                    }}
                  />
                </div>
                <div className="flex justify-between mt-0.5">
                  <span className="text-[9px] text-nexus-text-dim font-mono">%{(growth.progress * 100).toFixed(0)}</span>
                  <span className="text-[9px] text-nexus-text-dim font-mono">Guven: %{confidence.toFixed(0)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ResourceProjection({ resources }) {
  const projData = Array.from({ length: 30 }, (_, i) => {
    const day = i + 1;
    const waterLoss = resources.water.dailyLoss * day;
    const waterRemaining = Math.max(0, resources.water.total - waterLoss);

    return {
      day,
      su: Math.round((waterRemaining / resources.water.total) * 100),
      o2: Math.min(100, Math.round(100 + (resources.oxygen.balance / resources.oxygen.consumption) * 100 - day * 0.3)),
      besin: Math.max(0, Math.round(100 - day * 0.8)),
    };
  });

  return (
    <div className="bg-nexus-card rounded-xl border border-nexus-border p-4">
      <h3 className="text-xs text-nexus-text-dim uppercase tracking-wider mb-3">30 Gunluk Kaynak Projeksiyonu</h3>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={projData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1a1f36" />
          <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 9 }} />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 9 }} domain={[0, 100]} />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Line type="monotone" dataKey="su" name="Su (%)" stroke="#3b82f6" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="o2" name="O2 (%)" stroke="#34d399" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="besin" name="Besin (%)" stroke="#c084fc" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex gap-4 mt-1.5 justify-center">
        <Legend color="#3b82f6" label="Su" />
        <Legend color="#34d399" label="O2" />
        <Legend color="#c084fc" label="Besin" />
      </div>
    </div>
  );
}

function Legend({ color, label }) {
  return (
    <div className="flex items-center gap-1.5 text-[10px]">
      <div className="w-3 h-0.5 rounded" style={{ backgroundColor: color }} />
      <span className="text-nexus-text-dim">{label}</span>
    </div>
  );
}

function AnomalyTimeline({ anomalies }) {
  const displayAnomalies = anomalies.length > 0 ? anomalies : [
    { id: 1, message: 'NFT pH dalgalanmasi — Cozuldu', severity: 'resolved', timestamp: { day: 12, hour: 14 } },
    { id: 2, message: 'Aeroponik sicaklik spike — Cozuldu', severity: 'resolved', timestamp: { day: 23, hour: 8 } },
    { id: 3, message: 'CO2 yukselis trendi — Izleniyor', severity: 'warning', timestamp: { day: 45, hour: 20 } },
  ];

  return (
    <div className="bg-nexus-card rounded-xl border border-nexus-border p-4">
      <h3 className="text-xs text-nexus-text-dim uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <FiShield size={12} className="text-amber-400" /> Anomali Zaman Cizelgesi
      </h3>
      <div className="space-y-2">
        {displayAnomalies.map((a) => (
          <div key={a.id} className="flex items-start gap-2">
            <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
              a.severity === 'resolved' ? 'bg-emerald-500' :
              a.severity === 'critical' ? 'bg-red-500 animate-pulse' : 'bg-amber-500'
            }`} />
            <div className="flex-1 min-w-0">
              <span className="text-xs text-nexus-text">{a.message}</span>
              <div className="text-[9px] text-nexus-text-dim font-mono">
                Gun {a.timestamp?.day || '—'}, {String(a.timestamp?.hour || 0).padStart(2, '0')}:00
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AIInsights({ optimizations }) {
  const insights = optimizations.length > 0 ? optimizations : [
    { id: 1, icon: '💡', suggestion: 'Spirulina hasat sikligini %15 artirin.', impact: 'Gunluk +180 kcal' },
    { id: 2, icon: '🔧', suggestion: 'NFT pH kalibrasyon gerektiriyor.', impact: 'Besin alimi %12 artacak' },
    { id: 3, icon: '🌱', suggestion: 'Yeni marul ve ispanak ekimi oneriliyor.', impact: '25 gun icinde ek vitamin' },
    { id: 4, icon: '���', suggestion: 'LED spektrumunda kirmizi oranini artirin.', impact: 'Buyume hizi %8 artacak' },
  ];

  return (
    <div className="bg-nexus-card rounded-xl border border-nexus-border p-4">
      <h3 className="text-xs text-nexus-text-dim uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <FiCpu size={12} className="text-cyan-400" /> AI Oneriler
      </h3>
      <div className="space-y-2">
        {insights.map((ins) => (
          <div key={ins.id} className="bg-nexus-bg rounded-lg p-2.5 border border-nexus-border/30 hover:border-nexus-accent/20 transition-colors">
            <div className="flex items-start gap-2">
              <span className="text-sm">{ins.icon}</span>
              <div>
                <p className="text-xs text-nexus-text">{ins.suggestion}</p>
                <p className="text-[10px] text-cyan-400 mt-0.5 font-mono">{ins.impact}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SystemRiskPanel({ compartments }) {
  const spirulina = compartments.growth?.modules?.spirulina || {};
  const mushroom = compartments.growth?.modules?.mushroom || {};
  const contRisk = spirulina.contaminationRisk || 0;
  const subLevel = mushroom.substrateLevel || 85;

  const riskColor = (v, inv = false) => {
    const val = inv ? 100 - v : v;
    return val > 80 ? '#ef4444' : val > 50 ? '#f59e0b' : val > 20 ? '#eab308' : '#22c55e';
  };

  return (
    <div className="bg-nexus-card rounded-xl border border-nexus-border p-4">
      <h3 className="text-xs text-nexus-text-dim uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <FiAlertTriangle size={12} className="text-red-400" /> Risk Gostergeleri
      </h3>
      <div className="space-y-3">
        <RiskItem
          icon="🧬" label="Spirulina Kontaminasyon" value={contRisk}
          color={riskColor(contRisk)}
          desc={contRisk > 50 ? 'pH ve sicaklik stabilize edilmeli' : 'Normal aralikta'}
        />
        <RiskItem
          icon="🍄" label="Mantar Substrat" value={subLevel}
          color={riskColor(subLevel, true)}
          desc={subLevel < 40 ? 'Atik isleme hizi artirilmali' : 'Yeterli seviye'}
        />
        <div className="pt-2 border-t border-nexus-border space-y-1">
          <div className="flex justify-between items-center text-xs">
            <span className="text-nexus-text">🛡️ Habitat O2</span>
            <span className="font-mono" style={{ color: compartments.habitat?.o2Level < 19.5 ? '#ef4444' : '#22c55e' }}>
              %{(compartments.habitat?.o2Level || 21).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-nexus-text">☁️ Habitat CO2</span>
            <span className="font-mono" style={{ color: compartments.habitat?.co2Level > 0.08 ? '#f59e0b' : '#22c55e' }}>
              %{(compartments.habitat?.co2Level || 0.04).toFixed(4)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function RiskItem({ icon, label, value, color, desc }) {
  return (
    <div>
      <div className="flex justify-between items-center text-xs mb-1">
        <span className="text-nexus-text">{icon} {label}</span>
        <span className="font-mono font-bold" style={{ color }}>%{value.toFixed(1)}</span>
      </div>
      <div className="h-1.5 bg-nexus-bg rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${Math.min(100, value)}%`, backgroundColor: color }} />
      </div>
      <p className="text-[9px] text-nexus-text-dim mt-0.5">{desc}</p>
    </div>
  );
}

export default function AIPredictionPage() {
  const { state } = useGenesis();

  return (
    <div className="h-full flex flex-col gap-3 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-cyan-500/10 flex items-center justify-center">
          <FiCpu className="text-cyan-400" size={18} />
        </div>
        <div>
          <h2 className="text-base font-bold text-nexus-text">AI Tahmin ve Analiz</h2>
          <p className="text-[10px] text-nexus-text-dim">Makine ogrenimi tabanli anomali tespiti, hasat tahmini ve optimizasyon onerileri</p>
        </div>
      </div>

      {/* System health score + Resource projection */}
      <div className="grid grid-cols-2 gap-3">
        <SystemHealthScore state={state} />
        <ResourceProjection resources={state.resources} />
      </div>

      {/* Harvest + Anomalies + Insights + Risks */}
      <div className="flex-1 grid grid-cols-12 gap-3 min-h-0 overflow-hidden">
        <div className="col-span-4 overflow-y-auto">
          <HarvestPrediction currentDay={state.time.day} />
        </div>
        <div className="col-span-4 space-y-3 overflow-y-auto">
          <AnomalyTimeline anomalies={state.ai.anomalies} />
          <AIInsights optimizations={state.ai.optimizations} />
        </div>
        <div className="col-span-4 overflow-y-auto">
          <SystemRiskPanel compartments={state.compartments} />
        </div>
      </div>
    </div>
  );
}
