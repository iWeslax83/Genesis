import React from 'react';
import { useGenesis } from '../../context/GenesisContext';
import { formatNumber, formatPercent } from '../../utils/formatters';
import { FiMapPin, FiPackage, FiShield, FiSmile, FiWind, FiDroplet, FiClock } from 'react-icons/fi';

function MissionTimeline({ missionDay, totalDays, currentPhase, blss }) {
  const progress = (missionDay / totalDays) * 100;
  const milestones = [
    { day: 0, label: 'Kalkis', icon: '🚀' },
    { day: 120, label: 'BLSS Devreye Alma', icon: '🌱' },
    { day: 200, label: 'Tam Kapasite', icon: '🌿' },
    { day: 500, label: 'Yari Yol', icon: '📍' },
    { day: 980, label: 'Donus', icon: '🏠' },
  ];

  return (
    <div className="bg-nexus-card rounded-xl border border-nexus-border p-4">
      <h3 className="text-xs text-nexus-text-dim uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <FiClock size={12} /> Gorev Zaman Cizelgesi
      </h3>
      <div className="relative">
        {/* Track */}
        <div className="h-2 bg-nexus-bg rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-emerald-500 to-purple-500 transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>
        {/* Milestones */}
        <div className="relative mt-1" style={{ height: 40 }}>
          {milestones.map((m) => {
            const left = (m.day / totalDays) * 100;
            const isPast = missionDay >= m.day;
            return (
              <div
                key={m.day}
                className="absolute -translate-x-1/2 flex flex-col items-center"
                style={{ left: `${left}%` }}
              >
                <div className={`w-3 h-3 rounded-full border-2 ${
                  isPast ? 'bg-emerald-500 border-emerald-400' : 'bg-nexus-bg border-nexus-border'
                }`} />
                <span className="text-[8px] text-nexus-text-dim mt-0.5 whitespace-nowrap">{m.icon} {m.label}</span>
                <span className="text-[7px] text-nexus-text-dim/50 font-mono">G{m.day}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex justify-between mt-2 text-xs">
        <span className="text-nexus-text-dim">Faz: <span className="text-nexus-accent">{currentPhase?.name || 'Yuzey Op.'}</span></span>
        <span className="text-nexus-text-dim">BLSS: <span className={blss?.operational ? 'text-emerald-400' : 'text-amber-400'}>{blss?.operational ? 'Operasyonel' : `%${blss?.rampUpProgress || 0} devrede`}</span></span>
      </div>
    </div>
  );
}

export default function MissionPage() {
  const { state } = useGenesis();
  const mission = state.mission || {};
  const radiation = state.radiation || {};
  const morale = state.morale || {};
  const traceContaminants = state.traceContaminants || {};
  const waterProc = state.waterProcessing || {};

  const storedFood = mission.storedFood || {};
  const blss = mission.blss || {};
  const contaminantLevels = traceContaminants.levels || {};
  const moraleFactors = morale.factors || {};

  return (
    <div className="h-full flex flex-col gap-3 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center">
            <FiMapPin className="text-purple-400" size={18} />
          </div>
          <div>
            <h2 className="text-base font-bold text-nexus-text">Gorev Planlama ve Cevre</h2>
            <p className="text-[10px] text-nexus-text-dim">Erzak, BLSS devreye alma, radyasyon, moral ve cevre kalitesi</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-lg text-xs font-mono font-medium bg-purple-500/10 text-purple-400">
            Gun {mission.missionDay || state.time.day} / {mission.totalMissionDays || 980}
          </div>
          <div className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
            (mission.status || 'nominal') === 'critical' ? 'bg-red-500/10 text-red-400' :
            (mission.status || 'nominal') === 'warning' ? 'bg-amber-500/10 text-amber-400' :
            'bg-emerald-500/10 text-emerald-400'
          }`}>
            {mission.currentPhase?.name || 'Yuzey Operasyonlari'}
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
      <div className="grid grid-cols-4 gap-3">
        <MiniStat icon={<FiPackage />} label="Kalan Erzak" value={`${formatNumber(storedFood.remaining || 0)} kg`} sub={`${storedFood.daysRemaining || '∞'} gun`} color="text-amber-400" />
        <MiniStat icon={<FiShield />} label="Radyasyon Dozu" value={`${(radiation.cumulativeDose || 0).toFixed(3)} Gy`} sub={radiation.activeEvent ? 'SPE Aktif!' : 'Normal GCR'} color={radiation.status === 'nominal' ? 'text-emerald-400' : 'text-red-400'} />
        <MiniStat icon={<FiSmile />} label="Murettebat Morali" value={`${morale.score || 70}/100`} sub={morale.status === 'good' ? 'Iyi' : morale.status === 'moderate' ? 'Orta' : 'Dusuk'} color={morale.score >= 70 ? 'text-emerald-400' : morale.score >= 40 ? 'text-amber-400' : 'text-red-400'} />
        <MiniStat icon={<FiDroplet />} label="Su Geri Kazanim" value={formatPercent((waterProc.overallRecovery || 0.98) * 100)} sub={`Kayip: ${waterProc.dailyLoss || 0} L/gun`} color="text-cyan-400" />
      </div>

      {/* Main grid */}
      <div className="flex-1 grid grid-cols-12 gap-3 min-h-0 overflow-hidden">
        {/* Stored food */}
        <div className="col-span-4 bg-nexus-card border border-nexus-border rounded-xl p-4 overflow-y-auto">
          <h3 className="text-xs text-nexus-text-dim uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <FiPackage size={12} className="text-amber-400" /> Depolanan Erzak
          </h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-nexus-text-dim">Kalan / Toplam</span>
                <span className="text-nexus-text font-mono">{formatNumber(storedFood.remaining || 0)} / {formatNumber(storedFood.total || 0)} kg</span>
              </div>
              <div className="w-full h-2.5 bg-nexus-bg rounded-full">
                <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${storedFood.total > 0 ? (storedFood.remaining / storedFood.total) * 100 : 100}%` }} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 rounded-lg bg-nexus-bg">
                <div className="text-[9px] text-nexus-text-dim">Tuketilen</div>
                <div className="text-sm font-mono text-nexus-text">{formatNumber(storedFood.consumed || 0)} kg</div>
              </div>
              <div className="p-2 rounded-lg bg-nexus-bg">
                <div className="text-[9px] text-nexus-text-dim">Acil Yedek</div>
                <div className="text-sm font-mono text-amber-400">{formatNumber(storedFood.emergencyReserve || 0)} kg</div>
              </div>
            </div>
            <div className="p-2 rounded-lg bg-nexus-bg">
              <div className="text-[9px] text-nexus-text-dim">BLSS Katkisi</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-nexus-border rounded-full">
                  <div className="h-full bg-emerald-400 rounded-full transition-all" style={{ width: `${blss.contribution || 0}%` }} />
                </div>
                <span className="text-xs font-mono text-emerald-400">{formatPercent(blss.contribution || 0)}</span>
              </div>
              <div className="text-[9px] text-nexus-text-dim mt-1">
                Devreye alma: {formatPercent(blss.rampUpProgress || 0)} — {blss.operational ? '✓ Operasyonel' : 'Devrede degil'}
              </div>
            </div>
          </div>
        </div>

        {/* Morale */}
        <div className="col-span-4 bg-nexus-card border border-nexus-border rounded-xl p-4 overflow-y-auto">
          <h3 className="text-xs text-nexus-text-dim uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <FiSmile size={12} className="text-emerald-400" /> Murettebat Morali
          </h3>
          <div className="flex items-center justify-center mb-3">
            <div className={`text-3xl font-bold font-mono ${
              (morale.score || 70) >= 70 ? 'text-emerald-400' :
              (morale.score || 70) >= 40 ? 'text-amber-400' : 'text-red-400'
            }`}>
              {morale.score || 70}
            </div>
            <span className="text-nexus-text-dim text-sm ml-1">/100</span>
          </div>
          <div className="space-y-2">
            {Object.entries(moraleFactors).map(([key, factor]) => (
              <div key={key}>
                <div className="flex justify-between text-xs mb-0.5">
                  <span className="text-nexus-text-dim">{factor.label}</span>
                  <span className="text-nexus-text font-mono">{Math.round(factor.score)}</span>
                </div>
                <div className="w-full h-1 bg-nexus-bg rounded-full">
                  <div className={`h-full rounded-full transition-all ${
                    factor.score >= 70 ? 'bg-emerald-400' : factor.score >= 40 ? 'bg-amber-400' : 'bg-red-400'
                  }`} style={{ width: `${factor.score}%` }} />
                </div>
              </div>
            ))}
          </div>
          {morale.isLow && (
            <div className="mt-3 p-2 rounded-lg bg-red-500/10 text-xs text-red-400">
              ⚠ Dusuk moral — verimlilik %{Math.round((morale.efficiencyMultiplier || 1) * 100)}
            </div>
          )}
        </div>

        {/* Trace contaminants */}
        <div className="col-span-4 bg-nexus-card border border-nexus-border rounded-xl p-4 overflow-y-auto">
          <h3 className="text-xs text-nexus-text-dim uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <FiWind size={12} className="text-nexus-accent" /> Eser Kirleticiler (TCCS)
          </h3>
          <div className="space-y-2">
            {Object.entries(contaminantLevels).map(([key, cont]) => (
              <div key={key} className="p-2 rounded-lg bg-nexus-bg">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-nexus-text-dim">{cont.name}</span>
                  <span className={`font-mono ${
                    cont.status === 'critical' ? 'text-red-400' :
                    cont.status === 'warning' ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {cont.level} {cont.unit}
                  </span>
                </div>
                <div className="w-full h-1 bg-nexus-border rounded-full">
                  <div className={`h-full rounded-full transition-all ${
                    cont.smacRatio >= 1 ? 'bg-red-400' :
                    cont.smacRatio >= 0.7 ? 'bg-amber-400' : 'bg-emerald-400'
                  }`} style={{ width: `${Math.min(100, cont.smacRatio * 100)}%` }} />
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
      <div className="grid grid-cols-2 gap-3">
        {/* Radiation */}
        <div className="bg-nexus-card border border-nexus-border rounded-xl p-3">
          <h3 className="text-xs text-nexus-text-dim uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <FiShield size={12} className="text-purple-400" /> Radyasyon Izleme
          </h3>
          <div className="grid grid-cols-3 gap-2 mb-2">
            <div className="p-2 rounded-lg bg-nexus-bg text-center">
              <div className="text-[9px] text-nexus-text-dim">Kumulatif</div>
              <div className="text-xs font-mono text-purple-400">{(radiation.cumulativeDose || 0).toFixed(4)} Gy</div>
            </div>
            <div className="p-2 rounded-lg bg-nexus-bg text-center">
              <div className="text-[9px] text-nexus-text-dim">Gunluk</div>
              <div className="text-xs font-mono text-nexus-text">{(radiation.dailyDose || 0).toFixed(4)} Gy</div>
            </div>
            <div className="p-2 rounded-lg bg-nexus-bg text-center">
              <div className="text-[9px] text-nexus-text-dim">Bitki Etkisi</div>
              <div className={`text-xs font-mono ${(radiation.cropGrowthPenalty || 0) > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {(radiation.cropGrowthPenalty || 0) > 0 ? `-${formatPercent(radiation.cropGrowthPenalty * 100)}` : 'Yok'}
              </div>
            </div>
          </div>
          {radiation.activeEvent && (
            <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400">
              ☢️ SPE Aktif! {radiation.activeEvent.type === 'major' ? 'Buyuk' : 'Kucuk'} — {radiation.activeEvent.dose.toFixed(3)} Gy
            </div>
          )}
        </div>

        {/* Water processing */}
        <div className="bg-nexus-card border border-nexus-border rounded-xl p-3">
          <h3 className="text-xs text-nexus-text-dim uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <FiDroplet size={12} className="text-cyan-400" /> Su Isleme
          </h3>
          <div className="flex gap-2">
            {Object.entries(waterProc.stages || {}).map(([key, stage]) => (
              <div key={key} className="flex-1 p-2 rounded-lg bg-nexus-bg text-center">
                <div className="text-[9px] text-nexus-text-dim truncate">{stage.label}</div>
                <div className="text-xs font-mono text-cyan-400">{formatPercent(stage.efficiency * 100)}</div>
              </div>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2">
            <div className="p-1.5 rounded-lg bg-nexus-bg text-center">
              <div className="text-[8px] text-nexus-text-dim">Geri Kaz.</div>
              <div className="text-xs font-mono text-cyan-400">{formatPercent((waterProc.overallRecovery || 0.98) * 100)}</div>
            </div>
            <div className="p-1.5 rounded-lg bg-nexus-bg text-center">
              <div className="text-[8px] text-nexus-text-dim">TOC</div>
              <div className="text-xs font-mono text-nexus-text">{waterProc.tocLevel || 0} mg/L</div>
            </div>
            <div className="p-1.5 rounded-lg bg-nexus-bg text-center">
              <div className="text-[8px] text-nexus-text-dim">Kalite</div>
              <div className={`text-xs font-mono ${
                waterProc.waterQuality === 'potable' ? 'text-emerald-400' :
                waterProc.waterQuality === 'marginal' ? 'text-amber-400' : 'text-red-400'
              }`}>
                {waterProc.waterQuality === 'potable' ? 'Icilebilir' : waterProc.waterQuality === 'marginal' ? 'Sinirda' : 'Kontamine'}
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
    <div className="bg-nexus-card border border-nexus-border rounded-xl p-3">
      <div className="flex items-center gap-1.5 mb-1">
        <span className={`${color}`}>{icon}</span>
        <span className="text-[10px] text-nexus-text-dim uppercase">{label}</span>
      </div>
      <div className={`text-base font-bold font-mono ${color}`}>{value}</div>
      {sub && <div className="text-[9px] text-nexus-text-dim mt-0.5">{sub}</div>}
    </div>
  );
}
