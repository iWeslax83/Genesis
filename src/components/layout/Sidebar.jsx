import { useGenesis } from '../../context/GenesisContext';
import { FiGrid, FiActivity, FiBox, FiCpu, FiHeart, FiZap, FiMap, FiEye, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const NAV_ITEMS = [
  { id: 'overview', label: 'Genel Bakis', icon: FiGrid, group: 'ana' },
  { id: 'farm-view', label: 'Tesis Haritasi', icon: FiMap, group: 'ana' },
  { id: 'growth', label: 'Bitki Izleme', icon: FiActivity, group: 'izleme' },
  { id: 'nutrition', label: 'Beslenme', icon: FiHeart, group: 'izleme' },
  { id: 'power', label: 'Guc & Enerji', icon: FiZap, group: 'sistem' },
  { id: 'mission', label: 'Gorev Planlama', icon: FiEye, group: 'sistem' },
  { id: 'digital-twin', label: 'Dijital Ikiz', icon: FiBox, group: 'analiz' },
  { id: 'ai', label: 'AI Tahmin', icon: FiCpu, group: 'analiz' },
];

const GROUP_LABELS = {
  ana: 'Ana Panel',
  izleme: 'Izleme',
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
  const { currentPage, sidebarCollapsed } = state.ui;
  const collapsed = sidebarCollapsed;

  const groups = ['ana', 'izleme', 'sistem', 'analiz'];

  return (
    <aside className={`h-full bg-nexus-card border-r border-nexus-border flex flex-col transition-all duration-300 ${
      collapsed ? 'w-[60px]' : 'w-56'
    }`}>
      {/* Logo */}
      <div className="px-3 py-4 border-b border-nexus-border">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-bold text-base flex-shrink-0 shadow-lg shadow-emerald-500/20">
            G
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <h1 className="text-sm font-bold genesis-gradient-text leading-tight">GENESIS</h1>
              <p className="text-[9px] text-nexus-text-dim truncate">Uzay Tarimi Yasam Destek</p>
            </div>
          )}
        </div>

        {/* Mini stats under logo */}
        {!collapsed && (
          <div className="mt-3 grid grid-cols-2 gap-1.5">
            <div className="bg-nexus-bg rounded-md px-2 py-1">
              <div className="text-[8px] text-nexus-text-dim uppercase">Gun</div>
              <div className="text-xs font-mono font-bold text-nexus-accent">{state.time.day}</div>
            </div>
            <div className="bg-nexus-bg rounded-md px-2 py-1">
              <div className="text-[8px] text-nexus-text-dim uppercase">Saglik</div>
              <div className="text-xs font-mono font-bold text-emerald-400">{state.resources?.healthScore ?? 94}</div>
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
                  <span className="text-[9px] text-nexus-text-dim/60 uppercase tracking-widest font-medium">
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
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] transition-all relative ${
                      isActive
                        ? 'bg-nexus-accent/10 text-nexus-accent'
                        : 'text-nexus-text-dim hover:bg-nexus-card-hover hover:text-nexus-text'
                    }`}
                    title={item.label}
                  >
                    {/* Active indicator bar */}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-nexus-accent" />
                    )}

                    <div className="relative flex-shrink-0">
                      <Icon size={17} />
                      {showDot && (
                        <div className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${STATUS_COLORS[status]} ${
                          status === 'critical' ? 'animate-pulse' : ''
                        }`} />
                      )}
                    </div>
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Bottom: Mission progress + collapse */}
      <div className="border-t border-nexus-border p-2.5 space-y-2">
        {!collapsed && (
          <div>
            <div className="flex justify-between text-[9px] text-nexus-text-dim mb-1">
              <span>Gorev Ilerlemesi</span>
              <span className="font-mono">%{(state.mission?.missionProgress || 0).toFixed(1)}</span>
            </div>
            <div className="h-1 bg-nexus-bg rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-1000"
                style={{ width: `${Math.min(100, state.mission?.missionProgress || 0)}%` }}
              />
            </div>
            <div className="text-[8px] text-nexus-text-dim/50 mt-0.5">
              {state.mission?.missionDay || state.time.day} / {state.mission?.totalMissionDays || 980} gun
            </div>
          </div>
        )}

        <button
          onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs text-nexus-text-dim hover:text-nexus-accent hover:bg-nexus-bg/50 transition-colors"
        >
          {collapsed ? <FiChevronRight size={14} /> : <><FiChevronLeft size={14} /> <span>Daralt</span></>}
        </button>
      </div>
    </aside>
  );
}
