import React from 'react';
import { useGenesis } from '../../context/GenesisContext';
import { formatNumber, formatPercent } from '../../utils/formatters';
import {
  FiMapPin, FiPackage, FiShield, FiWind, FiDroplet, FiClock, FiUsers,
  FiMoon, FiCoffee, FiActivity, FiTool, FiSettings, FiSearch, FiTarget,
  FiMessageCircle, FiNavigation, FiUser, FiAlertTriangle, FiZap,
  FiHome, FiFlag, FiStar, FiCheckCircle
} from 'react-icons/fi';

const ACTIVITY_ICON_MAP = {
  sleep: FiMoon,
  rest: FiCoffee,
  exercise: FiActivity,
  work: FiTool,
  maintenance: FiSettings,
  science: FiSearch,
  meal: FiTarget,
  hygiene: FiDroplet,
  social: FiMessageCircle,
  eva: FiNavigation,
};

const ACTIVITY_COLORS = {
  sleep: '#6366f1', rest: '#8b7fc7', exercise: '#d4903a',
  work: '#4ead5b', maintenance: '#4a9caa', science: '#5b8def',
  meal: '#d4903a', hygiene: '#94a3b8', social: '#ec4899', eva: '#d45555',
};

const MILESTONE_ICONS = {
  launch: FiNavigation,
  blss: FiStar,
  full: FiCheckCircle,
  halfway: FiFlag,
  return: FiHome,
};

function MissionTimeline({ missionDay, totalDays, currentPhase, blss }) {
  const progress = (missionDay / totalDays) * 100;
  const milestones = [
    { day: 0, label: 'Kalkış', iconKey: 'launch' },
    { day: 120, label: 'BLSS Devreye Alma', iconKey: 'blss' },
    { day: 200, label: 'Tam Kapasite', iconKey: 'full' },
    { day: 500, label: 'Yarı Yol', iconKey: 'halfway' },
    { day: 980, label: 'Dönüş', iconKey: 'return' },
  ];

  return (
    <div className="bg-nexus-card rounded-lg border border-nexus-border p-4">
      <h3 className="text-xs text-nexus-text-dim uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <FiClock size={12} /> Görev Zaman Çizelgesi
      </h3>
      <div className="relative">
        <div className="h-2 bg-nexus-bg rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${progress}%`, background: `linear-gradient(to right, #5b8def, #4ead5b, #8b7fc7)` }}
          />
        </div>
        <div className="relative mt-1" style={{ height: 40 }}>
          {milestones.map((m) => {
            const left = (m.day / totalDays) * 100;
            const isPast = missionDay >= m.day;
            const IconComp = MILESTONE_ICONS[m.iconKey] || FiFlag;
            return (
              <div
                key={m.day}
                className="absolute -translate-x-1/2 flex flex-col items-center"
                style={{ left: `${left}%` }}
              >
                <div className={`w-3 h-3 rounded-full border-2 ${
                  isPast ? 'border-[#4ead5b]' : 'bg-nexus-bg border-nexus-border'
                }`} style={isPast ? { backgroundColor: '#4ead5b' } : {}} />
                <span className="text-[8px] text-nexus-text-dim mt-0.5 whitespace-nowrap flex items-center gap-0.5">
                  <IconComp size={8} /> {m.label}
                </span>
                <span className="text-[7px] text-nexus-text-dim/50 font-mono">G{m.day}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex justify-between mt-2 text-xs">
        <span className="text-nexus-text-dim">Faz: <span className="text-nexus-accent">{currentPhase?.name || 'Yüzey Op.'}</span></span>
        <span className="text-nexus-text-dim">BLSS: <span style={{ color: blss?.operational ? '#4ead5b' : '#d4903a' }}>{blss?.operational ? 'Operasyonel' : `%${blss?.rampUpProgress || 0} devrede`}</span></span>
      </div>
    </div>
  );
}

function CrewPanel({ crewActivity, time }) {
  const crew = crewActivity?.crew || [];
  const totals = crewActivity?.totals || {};

  return (
    <div className="bg-nexus-card border border-nexus-border rounded-lg p-4 overflow-y-auto">
      <h3 className="text-xs text-nexus-text-dim uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <FiUsers size={12} style={{ color: '#5b8def' }} /> Mürettebat Durumu
      </h3>

      {/* Crew cards */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {crew.map((member) => {
          const actColor = ACTIVITY_COLORS[member.activityKey] || '#94a3b8';
          const ActIcon = ACTIVITY_ICON_MAP[member.activityKey] || FiUser;
          return (
            <div key={member.id} className="p-2.5 rounded-lg bg-nexus-bg border border-nexus-border/30 transition-colors" style={{ '--hover-border': 'rgba(91,141,239,0.2)' }}>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-7 h-7 rounded-full bg-nexus-card flex items-center justify-center">
                  <ActIcon size={14} style={{ color: actColor }} />
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-nexus-text font-medium truncate">{member.name}</div>
                  <div className="text-[9px] text-nexus-text-dim">{member.role}</div>
                </div>
              </div>
              <div className="flex items-center gap-1 mb-1">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: actColor }} />
                <span className="text-[10px] font-medium" style={{ color: actColor }}>{member.activity}</span>
              </div>
              <div className="grid grid-cols-2 gap-1 text-[9px]">
                <div className="text-nexus-text-dim">O2: <span className="text-nexus-text font-mono">{(member.o2Rate * 1000).toFixed(0)} g/h</span></div>
                <div className="text-nexus-text-dim">Isı: <span className="text-nexus-text font-mono">{member.heatOutput} W</span></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Totals */}
      <div className="grid grid-cols-4 gap-2 p-2 rounded-lg bg-nexus-bg/50 border border-nexus-border/20">
        <div className="text-center">
          <div className="text-[8px] text-nexus-text-dim uppercase">O2 Tük.</div>
          <div className="text-xs font-mono" style={{ color: '#5b8def' }}>{(totals.o2Consumption * 1000).toFixed(0)} g/h</div>
        </div>
        <div className="text-center">
          <div className="text-[8px] text-nexus-text-dim uppercase">CO2 Ür.</div>
          <div className="text-xs font-mono" style={{ color: '#d4903a' }}>{(totals.co2Production * 1000).toFixed(0)} g/h</div>
        </div>
        <div className="text-center">
          <div className="text-[8px] text-nexus-text-dim uppercase">Isı</div>
          <div className="text-xs font-mono" style={{ color: '#d45555' }}>{totals.heatOutput?.toFixed(0)} W</div>
        </div>
        <div className="text-center">
          <div className="text-[8px] text-nexus-text-dim uppercase">Kalori</div>
          <div className="text-xs font-mono" style={{ color: '#d4903a' }}>{totals.caloriesBurning?.toFixed(0)} kcal/h</div>
        </div>
      </div>
    </div>
  );
}

export default function MissionPage() {
  const { state } = useGenesis();
  const mission = state.mission || {};
  const radiation = state.radiation || {};
  const traceContaminants = state.traceContaminants || {};
  const waterProc = state.waterProcessing || {};
  const crewActivity = state.crewActivity || {};

  const storedFood = mission.storedFood || {};
  const blss = mission.blss || {};
  const contaminantLevels = traceContaminants.levels || {};

  return (
    <div className="h-full flex flex-col gap-3 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(139,127,199,0.1)' }}>
            <FiMapPin style={{ color: '#8b7fc7' }} size={18} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-nexus-text">Görev Planlama ve Çevre</h2>
            <p className="text-[10px] text-nexus-text-dim">Erzak, mürettebat, radyasyon ve çevre kalitesi</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-lg text-xs font-mono font-medium" style={{ backgroundColor: 'rgba(139,127,199,0.1)', color: '#8b7fc7' }}>
            Gün {mission.missionDay || state.time.day} / {mission.totalMissionDays || 980}
          </div>
          <div className={`px-3 py-1.5 rounded-lg text-xs font-medium`} style={{
            backgroundColor: (mission.status || 'nominal') === 'critical' ? 'rgba(212,85,85,0.1)' :
              (mission.status || 'nominal') === 'warning' ? 'rgba(212,144,58,0.1)' : 'rgba(78,173,91,0.1)',
            color: (mission.status || 'nominal') === 'critical' ? '#d45555' :
              (mission.status || 'nominal') === 'warning' ? '#d4903a' : '#4ead5b'
          }}>
            {mission.currentPhase?.name || 'Yüzey Operasyonları'}
          </div>
        </div>
      </div>

      {/* Mission Timeline */}
      <MissionTimeline
        missionDay={mission.missionDay || state.time.day}
        totalDays={mission.totalMissionDays || 980}
        currentPhase={mission.currentPhase}
        blss={blss}
      />

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <MiniStat icon={<FiShield />} label="Radyasyon Dozu" value={`${(radiation.cumulativeDose || 0).toFixed(3)} Gy`} sub={radiation.activeEvent ? 'SPE Aktif!' : 'Normal GCR'} color={radiation.status === 'nominal' ? '#4ead5b' : '#d45555'} />
        <MiniStat icon={<FiDroplet />} label="Su Geri Kazanım" value={formatPercent((waterProc.overallRecovery || 0.98) * 100)} sub={`Kayıp: ${waterProc.dailyLoss || 0} L/gün`} color="#4a9caa" />
      </div>

      {/* Main grid: Crew + Erzak + Contaminants */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0 overflow-hidden">
        {/* Crew panel - takes more space */}
        <div className="col-span-12 lg:col-span-5">
          <CrewPanel crewActivity={crewActivity} time={state.time} />
        </div>

        {/* Erzak */}
        <div className="col-span-12 lg:col-span-3 bg-nexus-card border border-nexus-border rounded-lg p-4 overflow-y-auto">
          <h3 className="text-xs text-nexus-text-dim uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <FiPackage size={12} style={{ color: '#d4903a' }} /> Depolanan Erzak
          </h3>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-nexus-text-dim">Kalan</span>
            <span className="text-nexus-text font-mono">{formatNumber(storedFood.remaining || 0)} kg</span>
          </div>
          <div className="w-full h-1.5 bg-nexus-bg rounded-full">
            <div className="h-full rounded-full transition-all" style={{
              width: `${storedFood.total > 0 ? (storedFood.remaining / storedFood.total) * 100 : 100}%`,
              backgroundColor: '#d4903a'
            }} />
          </div>
          <div className="flex justify-between text-[9px] text-nexus-text-dim mt-1">
            <span>BLSS: {formatPercent(blss.contribution || 0)}</span>
            <span>{storedFood.daysRemaining || '\u221E'} gün</span>
          </div>
        </div>

        {/* Trace contaminants */}
        <div className="col-span-12 lg:col-span-4 bg-nexus-card border border-nexus-border rounded-lg p-4 overflow-y-auto">
          <h3 className="text-xs text-nexus-text-dim uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <FiWind size={12} className="text-nexus-accent" /> Eser Kirleticiler (TCCS)
          </h3>
          <div className="space-y-2">
            {Object.entries(contaminantLevels).map(([key, cont]) => (
              <div key={key} className="p-2 rounded-lg bg-nexus-bg">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-nexus-text-dim">{cont.name}</span>
                  <span className="font-mono" style={{
                    color: cont.status === 'critical' ? '#d45555' :
                      cont.status === 'warning' ? '#d4903a' : '#4ead5b'
                  }}>
                    {cont.level} {cont.unit}
                  </span>
                </div>
                <div className="w-full h-1 bg-nexus-border rounded-full">
                  <div className="h-full rounded-full transition-all" style={{
                    width: `${Math.min(100, cont.smacRatio * 100)}%`,
                    backgroundColor: cont.smacRatio >= 1 ? '#d45555' :
                      cont.smacRatio >= 0.7 ? '#d4903a' : '#4ead5b'
                  }} />
                </div>
                <div className="flex justify-between text-[9px] text-nexus-text-dim mt-0.5">
                  <span>{cont.source}</span>
                  <span>SMAC: {cont.smac} {cont.unit}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2 text-[10px] text-nexus-text-dim font-mono">
            TCCS: {traceContaminants.tccsPower || 0.12} kW | Karbon: {traceContaminants.scrubberHealth || 100}%
          </div>
        </div>
      </div>

      {/* Bottom: Radiation + Water Processing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Radiation */}
        <div className="bg-nexus-card border border-nexus-border rounded-lg p-3">
          <h3 className="text-xs text-nexus-text-dim uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <FiShield size={12} style={{ color: '#8b7fc7' }} /> Radyasyon İzleme
          </h3>
          <div className="grid grid-cols-3 gap-2 mb-2">
            <div className="p-2 rounded-lg bg-nexus-bg text-center">
              <div className="text-[9px] text-nexus-text-dim">Kümülatif</div>
              <div className="text-xs font-mono" style={{ color: '#8b7fc7' }}>{(radiation.cumulativeDose || 0).toFixed(4)} Gy</div>
            </div>
            <div className="p-2 rounded-lg bg-nexus-bg text-center">
              <div className="text-[9px] text-nexus-text-dim">Günlük</div>
              <div className="text-xs font-mono text-nexus-text">{(radiation.dailyDose || 0).toFixed(4)} Gy</div>
            </div>
            <div className="p-2 rounded-lg bg-nexus-bg text-center">
              <div className="text-[9px] text-nexus-text-dim">Bitki Etkisi</div>
              <div className="text-xs font-mono" style={{
                color: (radiation.cropGrowthPenalty || 0) > 0 ? '#d45555' : '#4ead5b'
              }}>
                {(radiation.cropGrowthPenalty || 0) > 0 ? `-${formatPercent(radiation.cropGrowthPenalty * 100)}` : 'Yok'}
              </div>
            </div>
          </div>
          {radiation.activeEvent && (
            <div className="p-2 rounded-lg border text-xs flex items-center gap-1.5" style={{
              backgroundColor: 'rgba(212,85,85,0.1)',
              borderColor: 'rgba(212,85,85,0.3)',
              color: '#d45555'
            }}>
              <FiZap size={12} /> SPE Aktif! {radiation.activeEvent.type === 'major' ? 'Büyük' : 'Küçük'} — {radiation.activeEvent.dose.toFixed(3)} Gy
            </div>
          )}
        </div>

        {/* Water processing */}
        <div className="bg-nexus-card border border-nexus-border rounded-lg p-3">
          <h3 className="text-xs text-nexus-text-dim uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <FiDroplet size={12} style={{ color: '#4a9caa' }} /> Su İşleme
          </h3>
          <div className="flex gap-2">
            {Object.entries(waterProc.stages || {}).map(([key, stage]) => (
              <div key={key} className="flex-1 p-2 rounded-lg bg-nexus-bg text-center">
                <div className="text-[9px] text-nexus-text-dim truncate">{stage.label}</div>
                <div className="text-xs font-mono" style={{ color: '#4a9caa' }}>{formatPercent(stage.efficiency * 100)}</div>
              </div>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2">
            <div className="p-1.5 rounded-lg bg-nexus-bg text-center">
              <div className="text-[8px] text-nexus-text-dim">Geri Kaz.</div>
              <div className="text-xs font-mono" style={{ color: '#4a9caa' }}>{formatPercent((waterProc.overallRecovery || 0.98) * 100)}</div>
            </div>
            <div className="p-1.5 rounded-lg bg-nexus-bg text-center">
              <div className="text-[8px] text-nexus-text-dim">TOC</div>
              <div className="text-xs font-mono text-nexus-text">{waterProc.tocLevel || 0} mg/L</div>
            </div>
            <div className="p-1.5 rounded-lg bg-nexus-bg text-center">
              <div className="text-[8px] text-nexus-text-dim">Kalite</div>
              <div className="text-xs font-mono" style={{
                color: waterProc.waterQuality === 'potable' ? '#4ead5b' :
                  waterProc.waterQuality === 'marginal' ? '#d4903a' : '#d45555'
              }}>
                {waterProc.waterQuality === 'potable' ? 'İçilebilir' : waterProc.waterQuality === 'marginal' ? 'Sınırda' : 'Kontamine'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ icon, label, value, sub, color }) {
  return (
    <div className="bg-nexus-card border border-nexus-border rounded-lg p-3">
      <div className="flex items-center gap-1.5 mb-1">
        <span style={{ color }}>{icon}</span>
        <span className="text-[10px] text-nexus-text-dim uppercase">{label}</span>
      </div>
      <div className="text-base font-semibold font-mono" style={{ color }}>{value}</div>
      {sub && <div className="text-[9px] text-nexus-text-dim mt-0.5">{sub}</div>}
    </div>
  );
}
