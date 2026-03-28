import { useState, useEffect, useRef } from 'react';
import { useGenesis } from '../../context/GenesisContext';
import { FiChevronUp, FiChevronDown, FiTerminal, FiTrash2 } from 'react-icons/fi';

const EVENT_TYPES = {
  harvest: { color: '#4ead5b', label: 'HASAT' },
  anomaly: { color: '#d4903a', label: 'ANOMALİ' },
  critical: { color: '#d45555', label: 'KRİTİK' },
  scenario: { color: '#8b7fc7', label: 'SENARYO' },
  system: { color: '#5b8def', label: 'SİSTEM' },
  power: { color: '#5b8def', label: 'GÜÇ' },
  info: { color: '#6c6e78', label: 'BİLGİ' },
};

export default function EventLog() {
  const { state } = useGenesis();
  const [isOpen, setIsOpen] = useState(false);
  const [events, setEvents] = useState([
    { id: 0, type: 'system', message: 'GENESIS simülasyonu başlatıldı', time: { day: 1, hour: 8, minute: 0 } },
  ]);
  const scrollRef = useRef(null);
  const prevAnomaliesRef = useRef([]);
  const prevHarvestLogRef = useRef([]);
  const prevScenarioRef = useRef(null);

  // Watch for new events
  useEffect(() => {
    const newEvents = [];

    const currentAnomalies = state.ai?.anomalies || [];
    if (currentAnomalies.length > prevAnomaliesRef.current.length) {
      const newAnomalies = currentAnomalies.slice(prevAnomaliesRef.current.length);
      newAnomalies.forEach(a => {
        newEvents.push({
          id: Date.now() + Math.random(),
          type: a.severity === 'critical' ? 'critical' : 'anomaly',
          message: a.message,
          time: { day: state.time.day, hour: state.time.hour, minute: state.time.minute },
        });
      });
    }
    prevAnomaliesRef.current = currentAnomalies;

    const currentHarvestLog = state.compartments?.growth?.harvestLog || [];
    if (currentHarvestLog.length > prevHarvestLogRef.current.length) {
      const newHarvests = currentHarvestLog.slice(prevHarvestLogRef.current.length);
      newHarvests.forEach(h => {
        newEvents.push({
          id: Date.now() + Math.random(),
          type: 'harvest',
          message: `${h.type} hasat edildi: ${h.yieldKg} kg (x${h.count})`,
          time: { day: h.day, hour: h.hour, minute: 0 },
        });
      });
    }
    prevHarvestLogRef.current = currentHarvestLog;

    if (state.scenario.active !== prevScenarioRef.current) {
      if (state.scenario.active) {
        newEvents.push({
          id: Date.now() + Math.random(),
          type: 'scenario',
          message: `Senaryo aktif: ${state.scenario.active}`,
          time: { day: state.time.day, hour: state.time.hour, minute: state.time.minute },
        });
      } else if (prevScenarioRef.current) {
        newEvents.push({
          id: Date.now() + Math.random(),
          type: 'system',
          message: 'Senaryo sona erdi — Normal operasyona dönüş',
          time: { day: state.time.day, hour: state.time.hour, minute: state.time.minute },
        });
      }
    }
    prevScenarioRef.current = state.scenario.active;

    if (state.power?.powerDeficit) {
      setEvents(prev => {
        const lastPowerEvent = prev.filter(e => e.type === 'power').slice(-1)[0];
        if (!lastPowerEvent || state.time.day !== lastPowerEvent.time?.day) {
          newEvents.push({
            id: Date.now() + Math.random(),
            type: 'power',
            message: `Güç açığı tespit edildi: ${(state.power.generation - state.power.totalConsumption).toFixed(1)} kW`,
            time: { day: state.time.day, hour: state.time.hour, minute: state.time.minute },
          });
        }
        if (newEvents.length > 0) {
          return [...prev, ...newEvents].slice(-100);
        }
        return prev;
      });
      return;
    }

    if (newEvents.length > 0) {
      setEvents(prev => [...prev, ...newEvents].slice(-100));
    }
  }, [state.ai?.anomalies, state.compartments?.growth?.harvestLog, state.scenario.active, state.power?.powerDeficit, state.time.day, state.time.hour]);

  useEffect(() => {
    if (scrollRef.current && isOpen) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events, isOpen]);

  const formatTime = (t) => {
    if (!t) return '--:--';
    return `G${t.day} ${String(t.hour).padStart(2, '0')}:${String(t.minute || 0).padStart(2, '0')}`;
  };

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-40 transition-all duration-200 ${
      isOpen ? 'h-48' : 'h-7'
    }`}>
      {/* Toggle bar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute top-0 left-0 right-0 h-7 bg-nexus-card border-t border-nexus-border flex items-center justify-between px-4 hover:bg-nexus-card-hover transition-colors"
      >
        <div className="flex items-center gap-2">
          <FiTerminal size={11} className="text-nexus-text-dim" />
          <span className="text-[10px] text-nexus-text-dim uppercase tracking-wider font-medium">Olay Günlüğü</span>
          <span className="text-[10px] text-nexus-text-dim font-mono">({events.length})</span>
        </div>
        <div className="flex items-center gap-2">
          {!isOpen && events.length > 0 && (
            <span className="text-[10px] text-nexus-text-dim font-mono truncate max-w-[400px]">
              {events[events.length - 1]?.message}
            </span>
          )}
          {isOpen ? <FiChevronDown size={12} className="text-nexus-text-dim" /> : <FiChevronUp size={12} className="text-nexus-text-dim" />}
        </div>
      </button>

      {/* Log content */}
      {isOpen && (
        <div className="mt-7 h-[calc(100%-28px)] bg-nexus-bg border-t border-nexus-border">
          <div className="flex items-center justify-end px-3 py-1 border-b border-nexus-border/50">
            <button
              onClick={() => setEvents([])}
              className="text-[10px] text-nexus-text-dim hover:text-nexus-red flex items-center gap-1 transition-colors"
            >
              <FiTrash2 size={10} /> Temizle
            </button>
          </div>
          <div ref={scrollRef} className="h-[calc(100%-28px)] overflow-y-auto px-3 py-1 font-mono text-[11px] space-y-0.5">
            {events.map(event => {
              const evType = EVENT_TYPES[event.type] || EVENT_TYPES.info;
              return (
                <div key={event.id} className="flex items-start gap-2 hover:bg-nexus-card/30 px-1 rounded">
                  <span className="text-nexus-text-dim/40 flex-shrink-0 w-16">{formatTime(event.time)}</span>
                  <span className="flex-shrink-0 w-14 font-semibold" style={{ color: evType.color }}>
                    [{evType.label}]
                  </span>
                  <span className="text-nexus-text-dim">{event.message}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
