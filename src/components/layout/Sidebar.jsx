import { useGenesis } from '../../context/GenesisContext';
import { FiGrid, FiActivity, FiBox, FiCpu, FiHeart, FiZap, FiEye, FiChevronLeft, FiChevronRight, FiDownload, FiFileText, FiDatabase, FiBarChart2, FiTool } from 'react-icons/fi';
import { exportSimulationJSON, exportSensorHistoryCSV, generateReport } from '../../utils/exportData';
import { TourResetButton } from '../ui/OnboardingTour';
import { useState } from 'react';

const NAV_ITEMS = [
  { id: 'overview', label: 'Genel Bakış', icon: FiGrid, group: 'ana', key: '1' },
  { id: 'growth', label: 'Bitki İzleme', icon: FiActivity, group: 'izleme', key: '2' },
  { id: 'nutrition', label: 'Beslenme', icon: FiHeart, group: 'izleme', key: '3' },
  { id: 'power', label: 'Güç & Enerji', icon: FiZap, group: 'sistem', key: '4' },
  { id: 'mission', label: 'Görev Planlama', icon: FiEye, group: 'sistem', key: '5' },
  { id: 'design', label: 'Donanım Tasarımı', icon: FiTool, group: 'analiz', key: '6' },
  { id: 'digital-twin', label: 'Dijital İkiz', icon: FiBox, group: 'analiz', key: '7' },
  { id: 'ai', label: 'AI Tahmin', icon: FiCpu, group: 'analiz', key: '8' },
];

const GROUP_LABELS = {
  ana: 'Ana Panel',
  izleme: 'İzleme',
  sistem: 'Sistem',
  analiz: 'Analiz',
};

function getPageStatus(id, state) {
  switch (id) {
    case 'overview': {
      const health = state.resources?.healthScore ?? 94;
      return health > 80 ? 'nominal' : health > 50 ? 'warning' : 'critical';
    }
    case 'growth': {
      const aero = state.compartments?.growth?.modules?.aeroponic?.status;
      const nft = state.compartments?.growth?.modules?.nft?.status;
      if (aero === 'critical' || nft === 'critical') return 'critical';
      if (aero === 'warning' || nft === 'warning') return 'warning';
      return 'nominal';
    }
    case 'power':
      return state.power?.powerDeficit ? 'critical' : 'nominal';
    case 'mission':
      return state.mission?.status || 'nominal';
    case 'ai': {
      const crits = (state.ai?.anomalies || []).filter(a => a.severity === 'critical').length;
      return crits > 0 ? 'critical' : (state.ai?.anomalies || []).length > 0 ? 'warning' : 'nominal';
    }
    case 'nutrition': {
      const vit = state.resources?.vitaminStatus || {};
      const deficient = Object.values(vit).some(v => v.status === 'deficient');
      return deficient ? 'warning' : 'nominal';
    }
    default:
      return 'nominal';
  }
}

const STATUS_COLORS = {
  nominal: 'bg-emerald-500',
  warning: 'bg-amber-500',
  critical: 'bg-red-500',
};

export default function Sidebar() {
  const { state, dispatch } = useGenesis();
  const { currentPage, sidebarCollapsed: collapsed } = state.ui;
  const [showExport, setShowExport] = useState(false);

  const groups = ['ana', 'izleme', 'sistem', 'analiz'];

  return (
    <aside className={`h-full bg-nexus-card border-r border-nexus-border flex flex-col transition-all duration-200 ${
      collapsed ? 'w-[60px]' : 'w-56'
    }`}>
      {/* Logo */}
      <div className="px-3 py-4 border-b border-nexus-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-nexus-accent flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            G
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-nexus-text leading-tight">GENESIS</h1>
              <p className="text-[9px] text-nexus-text-dim truncate">Uzay Tarımı Yaşam Destek</p>
            </div>
          )}
        </div>

        {/* Mini stats under logo */}
        {!collapsed && (
          <div className="mt-3 grid grid-cols-2 gap-1.5">
            <div className="bg-nexus-bg rounded px-2 py-1">
              <div className="text-[8px] text-nexus-text-dim uppercase">Gün</div>
              <div className="text-xs font-mono font-semibold text-nexus-text">{state.time.day}</div>
            </div>
            <div className="bg-nexus-bg rounded px-2 py-1">
              <div className="text-[8px] text-nexus-text-dim uppercase">Sağlık</div>
              <div className="text-xs font-mono font-semibold text-nexus-green">{state.resources?.healthScore ?? 94}</div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-2 px-1.5 overflow-y-auto space-y-0.5">
        {groups.map((group) => {
          const items = NAV_ITEMS.filter(i => i.group === group);
          return (
            <div key={group}>
              {!collapsed && (
                <div className="px-2 pt-3 pb-1">
                  <span className="text-[9px] text-nexus-text-dim/50 uppercase tracking-widest font-medium">
                    {GROUP_LABELS[group]}
                  </span>
                </div>
              )}
              {collapsed && group !== 'ana' && (
                <div className="mx-2 my-2 h-px bg-nexus-border/50" />
              )}
              {items.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                const status = getPageStatus(item.id, state);
                const showDot = status !== 'nominal';

                return (
                  <button
                    key={item.id}
                    onClick={() => dispatch({ type: 'SET_PAGE', payload: item.id })}
                    className={`group w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] transition-colors relative ${
                      isActive
                        ? 'bg-nexus-accent/10 text-nexus-accent'
                        : 'text-nexus-text-dim hover:bg-nexus-card-hover hover:text-nexus-text'
                    }`}
                    title={`${item.label} (${item.key})`}
                  >
                    {/* Active indicator bar */}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r bg-nexus-accent" />
                    )}

                    <div className="relative flex-shrink-0">
                      <Icon size={16} />
                      {showDot && (
                        <div className={`absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ${STATUS_COLORS[status]}`} />
                      )}
                    </div>
                    {!collapsed && (
                      <>
                        <span className="truncate flex-1 text-left">{item.label}</span>
                        <span className="text-[10px] text-nexus-text-dim/30 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                          {item.key}
                        </span>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Bottom: Tour + Export + Mission progress + collapse */}
      <div className="border-t border-nexus-border p-2.5 space-y-2">
        {/* Tour reset button */}
        {!collapsed && <TourResetButton />}

        {/* Export button */}
        {!collapsed && (
          <div className="relative">
            <button
              onClick={() => setShowExport(!showExport)}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-nexus-text-dim hover:text-nexus-text hover:bg-nexus-bg/50 transition-colors"
            >
              <FiDownload size={13} />
              <span>Veri Aktar</span>
            </button>
            {showExport && (
              <div className="absolute bottom-full left-0 right-0 mb-1 bg-nexus-card border border-nexus-border rounded-lg p-1.5 shadow-xl z-10 animate-slide-up">
                <button
                  onClick={() => { generateReport(state); setShowExport(false); }}
                  className="w-full text-left px-2 py-1.5 rounded text-[11px] text-nexus-text-dim hover:bg-nexus-bg hover:text-nexus-text transition-colors flex items-center gap-1.5"
                >
                  <FiFileText size={11} /> Rapor Oluştur (.txt)
                </button>
                <button
                  onClick={() => { exportSimulationJSON(state); setShowExport(false); }}
                  className="w-full text-left px-2 py-1.5 rounded text-[11px] text-nexus-text-dim hover:bg-nexus-bg hover:text-nexus-text transition-colors flex items-center gap-1.5"
                >
                  <FiDatabase size={11} /> Simülasyon Verisi (.json)
                </button>
                <button
                  onClick={() => { exportSensorHistoryCSV(state); setShowExport(false); }}
                  className="w-full text-left px-2 py-1.5 rounded text-[11px] text-nexus-text-dim hover:bg-nexus-bg hover:text-nexus-text transition-colors flex items-center gap-1.5"
                >
                  <FiBarChart2 size={11} /> Sensör Geçmişi (.csv)
                </button>
              </div>
            )}
          </div>
        )}

        <button
          onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs text-nexus-text-dim hover:text-nexus-text hover:bg-nexus-bg/50 transition-colors"
          title="Daralt/Genişlet (B)"
        >
          {collapsed ? <FiChevronRight size={14} /> : <><FiChevronLeft size={14} /> <span>Daralt</span></>}
        </button>
      </div>
    </aside>
  );
}
