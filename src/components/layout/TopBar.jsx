import { useGenesis } from '../../context/GenesisContext';
import { FiPlay, FiPause, FiAlertTriangle, FiClock, FiSun, FiMoon, FiWind, FiDroplet, FiZap } from 'react-icons/fi';
import { formatTime } from '../../utils/formatters';

const SPEED_OPTIONS = [1, 5, 10, 50];

export default function TopBar() {
  const { state, dispatch } = useGenesis();
  const { time, resources, ai, scenario, power, compartments } = state;
  const anomalyCount = ai.anomalies.filter(a => a.severity === 'critical').length;
  const healthScore = resources.healthScore ?? 94;
  const isDaytime = time.hour >= 6 && time.hour < 22;
  const o2 = compartments?.habitat?.o2Level || 21;
  const co2 = compartments?.habitat?.co2Level || 0.04;

  return (
    <header className="h-11 bg-nexus-card border-b border-nexus-border flex items-center justify-between px-4 gap-3">
      {/* Left: Health + Alerts */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${
            healthScore > 80 ? 'bg-emerald-500' : healthScore > 50 ? 'bg-amber-500' : 'bg-red-500'
          } animate-pulse`} />
          <span className="text-xs font-mono">
            <span className={`font-bold ${
              healthScore > 80 ? 'text-emerald-400' : healthScore > 50 ? 'text-amber-400' : 'text-red-400'
            }`}>{healthScore}</span>
            <span className="text-nexus-text-dim">/100</span>
          </span>
        </div>

        {/* Quick resource pills */}
        <div className="hidden xl:flex items-center gap-2">
          <QuickPill icon={<FiWind size={10} />} value={`${o2.toFixed(1)}%`} color={o2 > 19.5 ? '#22c55e' : '#ef4444'} />
          <QuickPill icon={<FiDroplet size={10} />} value={`${co2.toFixed(2)}%`} color={co2 < 0.08 ? '#22c55e' : '#f59e0b'} />
          <QuickPill icon={<FiZap size={10} />} value={`${power?.utilizationPercent?.toFixed(0)}%`} color={power?.powerDeficit ? '#ef4444' : '#22c55e'} />
        </div>

        {anomalyCount > 0 && (
          <div className="flex items-center gap-1 text-red-400 text-xs animate-blink">
            <FiAlertTriangle size={12} />
            <span className="font-medium">{anomalyCount} Kritik</span>
          </div>
        )}
      </div>

      {/* Center: Time + Day/Night */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-mono">
          <FiClock size={12} className="text-nexus-text-dim" />
          <span className="text-nexus-accent font-bold">Gun {time.day}</span>
          <span className="text-nexus-border">|</span>
          <span className="text-nexus-text font-bold">{formatTime(time.hour, time.minute)}</span>
          <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] ${
            isDaytime ? 'bg-yellow-500/10 text-yellow-400' : 'bg-indigo-500/10 text-indigo-400'
          }`}>
            {isDaytime ? <FiSun size={10} /> : <FiMoon size={10} />}
            <span>{isDaytime ? 'LED' : 'Gece'}</span>
          </div>
        </div>
        {scenario.active && (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-red-500/10 text-red-400 text-[10px] font-mono">
            <span className="animate-blink">!</span>
            <span>Senaryo</span>
          </div>
        )}
      </div>

      {/* Right: Speed + Play/Pause */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-0.5 bg-nexus-bg rounded-lg p-0.5">
          {SPEED_OPTIONS.map((spd) => (
            <button
              key={spd}
              onClick={() => dispatch({ type: 'SET_SPEED', payload: spd })}
              className={`px-1.5 py-0.5 rounded text-[11px] font-mono transition-all ${
                time.speed === spd
                  ? 'bg-nexus-accent text-nexus-bg font-bold'
                  : 'text-nexus-text-dim hover:text-nexus-text'
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>

        <button
          onClick={() => dispatch({ type: 'TOGGLE_SIMULATION' })}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
            time.isRunning
              ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
              : 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
          }`}
          title={time.isRunning ? 'Durdur' : 'Baslat'}
        >
          {time.isRunning ? <FiPause size={14} /> : <FiPlay size={14} />}
        </button>
      </div>
    </header>
  );
}

function QuickPill({ icon, value, color }) {
  return (
    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-nexus-bg/60 text-[10px] font-mono" style={{ color }}>
      {icon}
      <span>{value}</span>
    </div>
  );
}
