import React from 'react';
import { useGenesis } from '../../context/GenesisContext';
import { PLANTS, INITIAL_PLANTS } from '../../simulation/constants';
import { calculatePlantGrowth } from '../../simulation/plantGrowthModel';
import { formatNumber } from '../../utils/formatters';
import {
  FiCpu, FiAlertTriangle, FiTrendingUp, FiShield, FiCheckCircle,
  FiZap, FiTool, FiSun, FiDroplet, FiWind, FiActivity, FiDisc
} from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const TOOLTIP_STYLE = { background: '#1a1c23', border: '1px solid #2a2c35', borderRadius: 8 };

function SystemHealthScore({ state }) {
  const health = state.resources?.healthScore ?? 94;
  const anomalyCount = state.ai?.anomalies?.length || 0;
  const critCount = (state.ai?.anomalies || []).filter(a => a.severity === 'critical').length;
  const plantScore = state.ai?.plantHealth?.overallScore || 95;
  const degradation = state.degradation?.averageHealth || 100;

  const overallScore = Math.round((health + plantScore + degradation) / 3);
  const color = overallScore >= 80 ? '#4ead5b' : overallScore >= 60 ? '#d4903a' : '#d45555';

  const r = 52;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - overallScore / 100 * 0.75);

  return (
    <div className="bg-nexus-card rounded-lg border border-nexus-border p-4 flex items-center gap-4">
      <svg width={120} height={120} viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#2a2c35" strokeWidth="8"
          strokeDasharray={`${circ * 0.75} ${circ * 0.25}`}
          transform="rotate(135 60 60)" />
        <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${circ * 0.75} ${circ * 0.25}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(135 60 60)"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
        <text x="60" y="55" textAnchor="middle" fill={color} fontSize="24" fontWeight="600" fontFamily="monospace">{overallScore}</text>
        <text x="60" y="72" textAnchor="middle" fill="#6c6e78" fontSize="9">GENEL SKOR</text>
      </svg>
      <div className="flex-1 space-y-2">
        <ScoreLine label="Sistem Sağlığı" value={health} />
        <ScoreLine label="Bitki Sağlığı" value={plantScore} />
        <ScoreLine label="Bileşen Sağlığı" value={Math.round(degradation)} />
        <div className="pt-2 border-t border-nexus-border flex items-center gap-3 text-xs">
          {critCount > 0 ? (
            <span style={{ color: '#d45555' }} className="flex items-center gap-1"><FiAlertTriangle size={12} /> {critCount} kritik alarm</span>
          ) : anomalyCount > 0 ? (
            <span style={{ color: '#d4903a' }} className="flex items-center gap-1"><FiAlertTriangle size={12} /> {anomalyCount} uyarı</span>
          ) : (
            <span style={{ color: '#4ead5b' }} className="flex items-center gap-1"><FiCheckCircle size={12} /> Tüm sistemler nominal</span>
          )}
        </div>
      </div>
    </div>
  );
}

function ScoreLine({ label, value }) {
  const color = value >= 80 ? '#4ead5b' : value >= 60 ? '#d4903a' : '#d45555';
  return (
    <div>
      <div className="flex justify-between text-xs mb-0.5">
        <span className="text-nexus-text-dim">{label}</span>
        <span className="font-mono font-semibold" style={{ color }}>{value}</span>
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
    <div className="bg-nexus-card rounded-lg border border-nexus-border p-4">
      <h3 className="text-xs text-nexus-text-dim uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <FiTrendingUp size={12} style={{ color: '#4ead5b' }} /> Hasat Tahmini
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
                  <span className={`text-[10px] font-mono ${growth.isReady ? '' : 'text-nexus-text-dim'}`}
                    style={growth.isReady ? { color: '#4ead5b' } : undefined}>
                    {growth.isReady ? <><FiCheckCircle size={9} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 2 }} />Hazır</> : `${daysLeft}g`}
                  </span>
                </div>
                <div className="h-1.5 bg-nexus-bg rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${growth.progress * 100}%`,
                      backgroundColor: growth.isReady ? '#4ead5b' : growth.progress > 0.7 ? '#d4903a' : '#4a9caa',
                    }}
                  />
                </div>
                <div className="flex justify-between mt-0.5">
                  <span className="text-[9px] text-nexus-text-dim font-mono">%{(growth.progress * 100).toFixed(0)}</span>
                  <span className="text-[9px] text-nexus-text-dim font-mono">Güven: %{confidence.toFixed(0)}</span>
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
    <div className="bg-nexus-card rounded-lg border border-nexus-border p-4">
      <h3 className="text-xs text-nexus-text-dim uppercase tracking-wider mb-3">30 Günlük Kaynak Projeksiyonu</h3>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={projData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2c35" />
          <XAxis dataKey="day" tick={{ fill: '#6c6e78', fontSize: 9 }} />
          <YAxis tick={{ fill: '#6c6e78', fontSize: 9 }} domain={[0, 100]} />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Line type="monotone" dataKey="su" name="Su (%)" stroke="#5b8def" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="o2" name="O2 (%)" stroke="#4ead5b" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="besin" name="Besin (%)" stroke="#8b7fc7" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex gap-4 mt-1.5 justify-center">
        <Legend color="#5b8def" label="Su" />
        <Legend color="#4ead5b" label="O2" />
        <Legend color="#8b7fc7" label="Besin" />
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
  const displayAnomalies = anomalies;

  return (
    <div className="bg-nexus-card rounded-lg border border-nexus-border p-4">
      <h3 className="text-xs text-nexus-text-dim uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <FiShield size={12} style={{ color: '#d4903a' }} /> Anomali Zaman Çizelgesi
      </h3>
      {displayAnomalies.length === 0 ? (
        <div className="flex items-center gap-2 text-xs text-nexus-text-dim py-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Anomali tespit edilmedi</span>
        </div>
      ) : (
      <div className="space-y-2">
        {displayAnomalies.map((a) => (
          <div key={a.id} className="flex items-start gap-2">
            <div className="mt-0.5 w-2 h-2 rounded-full flex-shrink-0"
              style={{
                backgroundColor: a.severity === 'resolved' ? '#4ead5b' :
                  a.severity === 'critical' ? '#d45555' : '#d4903a'
              }} />
            <div className="flex-1 min-w-0">
              <span className="text-xs text-nexus-text">{a.message}</span>
              <div className="text-[9px] text-nexus-text-dim font-mono">
                Gün {a.timestamp?.day || '—'}, {String(a.timestamp?.hour || 0).padStart(2, '0')}:00
              </div>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
}

function AIInsights({ optimizations }) {
  const iconMap = {
    zap: FiZap,
    tool: FiTool,
    sun: FiSun,
    activity: FiActivity,
  };

  return (
    <div className="bg-nexus-card rounded-lg border border-nexus-border p-4">
      <h3 className="text-xs text-nexus-text-dim uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <FiCpu size={12} style={{ color: '#4a9caa' }} /> AI Öneriler
      </h3>
      {optimizations.length === 0 ? (
        <div className="flex items-center gap-2 text-xs text-nexus-text-dim py-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Şu an aktif öneri bulunmuyor</span>
        </div>
      ) : (
        <div className="space-y-2">
          {optimizations.map((ins) => {
            const IconComp = iconMap[ins.icon] || FiDisc;
            return (
              <div key={ins.id} className="bg-nexus-bg rounded-lg p-2.5 border border-nexus-border/30 hover:border-nexus-accent/20 transition-colors">
                <div className="flex items-start gap-2">
                  <IconComp size={14} style={{ color: '#4a9caa', marginTop: 1, flexShrink: 0 }} />
                  <div>
                    <p className="text-xs text-nexus-text">{ins.suggestion}</p>
                    <p className="text-[10px] mt-0.5 font-mono" style={{ color: '#4a9caa' }}>{ins.impact}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
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
    return val > 80 ? '#d45555' : val > 50 ? '#d4903a' : val > 20 ? '#d4903a' : '#4ead5b';
  };

  return (
    <div className="bg-nexus-card rounded-lg border border-nexus-border p-4">
      <h3 className="text-xs text-nexus-text-dim uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <FiAlertTriangle size={12} style={{ color: '#d45555' }} /> Risk Göstergeleri
      </h3>
      <div className="space-y-3">
        <RiskItem
          icon={<FiActivity size={13} />} label="Spirulina Kontaminasyon" value={contRisk}
          color={riskColor(contRisk)}
          desc={contRisk > 50 ? 'pH ve sıcaklık stabilize edilmeli' : 'Normal aralıkta'}
        />
        <RiskItem
          icon={<FiDisc size={13} />} label="Mantar Substrat" value={subLevel}
          color={riskColor(subLevel, true)}
          desc={subLevel < 40 ? 'Atık işleme hızı artırılmalı' : 'Yeterli seviye'}
        />
        <div className="pt-2 border-t border-nexus-border space-y-1">
          <div className="flex justify-between items-center text-xs">
            <span className="text-nexus-text flex items-center gap-1"><FiShield size={11} /> Habitat O2</span>
            <span className="font-mono" style={{ color: compartments.habitat?.o2Level < 19.5 ? '#d45555' : '#4ead5b' }}>
              %{(compartments.habitat?.o2Level || 21).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-nexus-text flex items-center gap-1"><FiWind size={11} /> Habitat CO2</span>
            <span className="font-mono" style={{ color: compartments.habitat?.co2Level > 0.08 ? '#d4903a' : '#4ead5b' }}>
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
        <span className="text-nexus-text flex items-center gap-1">{icon} {label}</span>
        <span className="font-mono font-semibold" style={{ color }}>%{value.toFixed(1)}</span>
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
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(74, 156, 170, 0.1)' }}>
          <FiCpu style={{ color: '#4a9caa' }} size={18} />
        </div>
        <div>
          <h2 className="text-base font-semibold text-nexus-text">AI Tahmin ve Analiz</h2>
          <p className="text-[10px] text-nexus-text-dim">Makine öğrenimi tabanlı anomali tespiti, hasat tahmini ve optimizasyon önerileri</p>
        </div>
      </div>

      {/* System health score + Resource projection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <SystemHealthScore state={state} />
        <ResourceProjection resources={state.resources} />
      </div>

      {/* Harvest + Anomalies + Insights + Risks */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0 overflow-hidden">
        <div className="col-span-12 lg:col-span-4 overflow-y-auto">
          <HarvestPrediction currentDay={state.time.day} />
        </div>
        <div className="col-span-12 lg:col-span-4 space-y-3 overflow-y-auto">
          <AnomalyTimeline anomalies={state.ai.anomalies} />
          <AIInsights optimizations={state.ai.optimizations} />
        </div>
        <div className="col-span-12 lg:col-span-4 overflow-y-auto">
          <SystemRiskPanel compartments={state.compartments} />
        </div>
      </div>
    </div>
  );
}
