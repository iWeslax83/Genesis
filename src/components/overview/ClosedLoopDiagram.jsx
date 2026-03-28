import React from 'react';
import { useGenesis } from '../../context/GenesisContext';
import { COMPARTMENTS } from '../../simulation/constants';
import { formatNumber } from '../../utils/formatters';

const POSITIONS = {
  waste:    { x: 190, y: 20,  w: 170, h: 70 },
  nutrient: { x: 370, y: 155, w: 170, h: 70 },
  growth:   { x: 190, y: 290, w: 170, h: 70 },
  habitat:  { x: 10,  y: 155, w: 170, h: 70 },
};

/* Animated dashed flow path with glowing trail */
function AnimatedFlow({ d, color, speed = '3s', width = 2, label, labelPos }) {
  const id = `flow-${color.replace('#', '')}-${speed}`;
  return (
    <g>
      {/* Glow background */}
      <path d={d} fill="none" stroke={color} strokeWidth={width + 4} opacity="0.04" />
      {/* Base path */}
      <path d={d} fill="none" stroke={color} strokeWidth={width * 0.5} opacity="0.1" />
      {/* Animated dash */}
      <path d={d} fill="none" stroke={color} strokeWidth={width} strokeDasharray="8 14" opacity="0.65" strokeLinecap="round">
        <animate attributeName="stroke-dashoffset" from="22" to="0" dur={speed} repeatCount="indefinite" />
      </path>
      {/* Bright particle dots traveling along path */}
      <circle r="2.5" fill={color} opacity="0.8">
        <animateMotion dur={speed} repeatCount="indefinite" path={d} />
      </circle>
      <circle r="1.5" fill="white" opacity="0.6">
        <animateMotion dur={speed} repeatCount="indefinite" path={d} begin="0.3s" />
      </circle>
    </g>
  );
}

function FlowLabel({ x, y, text, value, color, icon }) {
  return (
    <g>
      <rect x={x - 50} y={y - 15} width="100" height="28" rx="6" fill="#0a0e1a" stroke={color} strokeWidth="0.8" opacity="0.92" />
      <text x={x} y={y - 2} textAnchor="middle" fill={color} fontSize="8" fontWeight="700">
        {icon && <tspan>{icon} </tspan>}{text}
      </text>
      <text x={x} y={y + 10} textAnchor="middle" fill="#94a3b8" fontSize="7" fontFamily="monospace">{value}</text>
    </g>
  );
}

function CompartmentNode({ id, data, pos, isActive, onClick }) {
  const comp = COMPARTMENTS[id];
  const statusColor = data.status === 'nominal' ? '#22c55e' : data.status === 'warning' ? '#f59e0b' : '#ef4444';
  const glowColor = comp.color || '#22c55e';

  return (
    <g onClick={() => onClick(id)} style={{ cursor: 'pointer' }}>
      {/* Ambient glow ring */}
      <rect x={pos.x - 1} y={pos.y - 1} width={pos.w + 2} height={pos.h + 2} rx={14} fill="none" stroke={glowColor} strokeWidth="0.5" opacity="0.15">
        <animate attributeName="opacity" values="0.1;0.2;0.1" dur="3s" repeatCount="indefinite" />
      </rect>

      {/* Active selection glow */}
      {isActive && (
        <rect x={pos.x - 4} y={pos.y - 4} width={pos.w + 8} height={pos.h + 8} rx={16} fill="none" stroke={glowColor} strokeWidth="2" opacity="0.4">
          <animate attributeName="opacity" values="0.2;0.5;0.2" dur="1.5s" repeatCount="indefinite" />
        </rect>
      )}

      {/* Card background with gradient */}
      <defs>
        <linearGradient id={`grad-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={`${glowColor}`} stopOpacity="0.08" />
          <stop offset="100%" stopColor="#111827" stopOpacity="1" />
        </linearGradient>
      </defs>
      <rect x={pos.x} y={pos.y} width={pos.w} height={pos.h} rx={12}
        fill={`url(#grad-${id})`}
        stroke={isActive ? glowColor : `${glowColor}60`}
        strokeWidth={isActive ? 1.8 : 1}
      />

      {/* Icon */}
      <text x={pos.x + 16} y={pos.y + 28} fontSize="18">{comp.icon}</text>

      {/* Name and subtitle */}
      <text x={pos.x + 40} y={pos.y + 24} fill="#e2e8f0" fontSize="11" fontWeight="700">{comp.shortName}</text>
      <text x={pos.x + 40} y={pos.y + 37} fill="#94a3b8" fontSize="7.5">{comp.name}</text>

      {/* Status dot with pulse */}
      <circle cx={pos.x + pos.w - 18} cy={pos.y + 18} r={4.5} fill={statusColor}>
        {data.status !== 'nominal' && (
          <animate attributeName="r" values="4.5;6;4.5" dur="1.5s" repeatCount="indefinite" />
        )}
      </circle>
      {data.status !== 'nominal' && (
        <circle cx={pos.x + pos.w - 18} cy={pos.y + 18} r={4.5} fill="none" stroke={statusColor} strokeWidth="1" opacity="0.3">
          <animate attributeName="r" values="5;10;5" dur="1.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.4;0;0.4" dur="1.5s" repeatCount="indefinite" />
        </circle>
      )}

      {/* Status text */}
      <text x={pos.x + pos.w - 18} y={pos.y + 37} textAnchor="middle" fill={statusColor} fontSize="6.5" fontWeight="600">
        {data.status === 'nominal' ? 'NORMAL' : data.status === 'warning' ? 'UYARI' : 'KRITIK'}
      </text>

      {/* Data row */}
      <text x={pos.x + 16} y={pos.y + 56} fill="#64748b" fontSize="7" fontFamily="monospace">
        {data.temperature !== undefined && `${data.temperature?.toFixed?.(1)}°C`}
        {data.pH !== undefined && ` | pH ${data.pH?.toFixed?.(1)}`}
        {data.o2Level !== undefined && ` | O2 ${data.o2Level?.toFixed?.(1)}%`}
      </text>
    </g>
  );
}

export default function ClosedLoopDiagram() {
  const { state, dispatch } = useGenesis();
  const { compartments, resources } = state;
  const selected = state.ui.selectedCompartment;

  const handleClick = (id) => {
    dispatch({ type: 'SET_SELECTED_COMPARTMENT', payload: selected === id ? null : id });
  };

  const compData = {
    waste: compartments.waste,
    nutrient: compartments.nutrient,
    growth: {
      status: compartments.growth?.status || 'nominal',
      temperature: compartments.growth?.modules?.aeroponic?.temperature,
      pH: compartments.growth?.modules?.aeroponic?.pH,
    },
    habitat: {
      ...compartments.habitat,
    },
  };

  const hW = POSITIONS.habitat;
  const wW = POSITIONS.waste;
  const nW = POSITIONS.nutrient;
  const gW = POSITIONS.growth;

  // Calculate center points
  const cx = 275, cy = 190;

  return (
    <svg viewBox="0 0 550 390" className="w-full h-full" style={{ maxHeight: '100%' }}>
      <defs>
        <pattern id="cld-grid" width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#1e293b" strokeWidth="0.2" />
        </pattern>
        <radialGradient id="cld-center-glow" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#00f0ff" stopOpacity="0" />
        </radialGradient>
        <filter id="glow-sm">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <rect width="550" height="390" fill="url(#cld-grid)" />

      {/* Central glow */}
      <ellipse cx={cx} cy={cy} rx="120" ry="100" fill="url(#cld-center-glow)" />

      {/* Center label */}
      <text x={cx} y={cy - 8} textAnchor="middle" fill="#00f0ff" fontSize="11" fontWeight="800" opacity="0.35" letterSpacing="3">
        MELiSSA DÖNGÜSÜ
      </text>
      <text x={cx} y={cy + 6} textAnchor="middle" fill="#94a3b8" fontSize="7" opacity="0.25" letterSpacing="1">
        Kapalı Döngü Yaşam Destek
      </text>

      {/* Subtle circular orbit lines */}
      <ellipse cx={cx} cy={cy} rx="160" ry="135" fill="none" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2 6" />
      <ellipse cx={cx} cy={cy} rx="100" ry="80" fill="none" stroke="#1e293b" strokeWidth="0.3" strokeDasharray="1 8" />

      {/* ── FLOW PATHS ── */}

      {/* Habitat -> Waste: Organic waste */}
      <AnimatedFlow
        d={`M ${hW.x + hW.w} ${hW.y + 35} Q ${cx} ${hW.y - 20} ${wW.x} ${wW.y + 35}`}
        color="#ff8800"
        speed="3s"
      />
      <FlowLabel x={cx} y={45} text="Organik Atık" value={`${formatNumber(10.8)} kg/gün`} color="#ff8800" />

      {/* Waste -> Nutrient: Nitrification */}
      <AnimatedFlow
        d={`M ${wW.x + wW.w / 2} ${wW.y + wW.h} Q ${wW.x + wW.w + 15} ${155} ${nW.x + nW.w / 2} ${nW.y}`}
        color="#c084fc"
        speed="3.5s"
      />
      <FlowLabel x={440} y={105} text="NH4+ → NO3-" value="Nitrifikasyon" color="#c084fc" />

      {/* Nutrient -> Growth: NPK Solution */}
      <AnimatedFlow
        d={`M ${nW.x + nW.w / 2} ${nW.y + nW.h} Q ${nW.x + nW.w + 15} ${290} ${gW.x + gW.w / 2} ${gW.y}`}
        color="#22c55e"
        speed="3s"
      />
      <FlowLabel x={440} y={265} text="Besin Çözeltisi" value="NPK Döngüsü" color="#22c55e" />

      {/* Growth -> Habitat: O₂ + Food */}
      <AnimatedFlow
        d={`M ${gW.x} ${gW.y + 25} Q ${20} ${290} ${hW.x + hW.w / 2 - 20} ${hW.y + hW.h}`}
        color="#34d399"
        speed="2.5s"
        width={2.5}
      />
      <FlowLabel x={70} y={270} text="O₂ + Gıda" value={`${formatNumber(resources.oxygen.production)} L/gün`} color="#34d399" />

      {/* Habitat -> Growth: CO₂ */}
      <AnimatedFlow
        d={`M ${hW.x + hW.w / 2 + 30} ${hW.y + hW.h} Q ${130} ${300} ${gW.x + 50} ${gW.y}`}
        color="#f97316"
        speed="4s"
      />
      <FlowLabel x={140} y={310} text="CO2" value={`${formatNumber(resources.co2.production)} L/gün`} color="#f97316" />

      {/* Growth -> Habitat: H₂O */}
      <AnimatedFlow
        d={`M ${gW.x - 5} ${gW.y + 50} Q ${-15} ${235} ${hW.x - 5} ${hW.y + 55}`}
        color="#3b82f6"
        speed="5s"
      />
      <FlowLabel x={20} y={190} text="H₂O Döngüsü" value={`Geri kaz. %${(resources.water.recycleRate * 100).toFixed(1)}`} color="#3b82f6" />

      {/* ── COMPARTMENT NODES ── */}
      {Object.entries(POSITIONS).map(([id, pos]) => (
        <CompartmentNode
          key={id}
          id={id}
          data={compData[id]}
          pos={pos}
          isActive={selected === id}
          onClick={handleClick}
        />
      ))}

      {/* ── SELECTED INFO POPUP ── */}
      {selected && (
        <g>
          <rect x={cx - 90} y={cy + 20} width={180} height={80} rx={10} fill="#0a0e1aee" stroke="#2a3154" strokeWidth="1.2">
            <animate attributeName="opacity" from="0" to="1" dur="0.2s" fill="freeze" />
          </rect>
          <text x={cx - 75} y={cy + 40} fill="#e2e8f0" fontSize="11" fontWeight="700">
            {COMPARTMENTS[selected]?.icon} {COMPARTMENTS[selected]?.name}
          </text>
          <line x1={cx - 75} y1={cy + 46} x2={cx + 75} y2={cy + 46} stroke="#2a3154" strokeWidth="0.5" />
          <text x={cx - 75} y={cy + 60} fill="#94a3b8" fontSize="8" fontFamily="monospace">
            Sıcaklık: {compData[selected]?.temperature?.toFixed?.(1) || '—'}°C
          </text>
          <text x={cx - 75} y={cy + 73} fill="#94a3b8" fontSize="8" fontFamily="monospace">
            pH: {compData[selected]?.pH?.toFixed?.(2) || '—'}
          </text>
          <text x={cx - 75} y={cy + 86} fill="#94a3b8" fontSize="8" fontFamily="monospace">
            Durum: <tspan fill={compData[selected]?.status === 'nominal' ? '#22c55e' : '#f59e0b'}>{compData[selected]?.status}</tspan>
          </text>
        </g>
      )}

      {/* ── BOTTOM STATS ── */}
      <g transform="translate(10, 365)">
        <rect width="530" height="22" rx="6" fill="#0a0e1a" stroke="#2a315430" strokeWidth="0.5" />
        <text x="15" y="14" fill="#00f0ff" fontSize="7.5" fontWeight="bold" fontFamily="monospace">
          CLOSURE:
        </text>
        <text x="72" y="14" fill="#34d399" fontSize="7" fontFamily="monospace">
          O2 %{(resources.closure?.o2 || 0).toFixed(1)}
        </text>
        <text x="135" y="14" fill="#22c55e" fontSize="7" fontFamily="monospace">
          CO2 %{(resources.closure?.co2 || 0).toFixed(1)}
        </text>
        <text x="200" y="14" fill="#3b82f6" fontSize="7" fontFamily="monospace">
          H2O %{(resources.closure?.water || 0).toFixed(1)}
        </text>
        <text x="265" y="14" fill="#ff8800" fontSize="7" fontFamily="monospace">
          Gıda %{(resources.closure?.food || 0).toFixed(1)}
        </text>
        <text x="340" y="14" fill="#94a3b8" fontSize="6" opacity="0.5">|</text>
        <text x="355" y="14" fill="#00f0ff" fontSize="7.5" fontWeight="bold" fontFamily="monospace">
          GENEL: %{(resources.closure?.material || 0).toFixed(1)}
        </text>
        <text x="460" y="14" fill="#94a3b8" fontSize="6.5" opacity="0.4" fontFamily="monospace">
          Ref: Yuegong-1 %98.2
        </text>
      </g>
    </svg>
  );
}
