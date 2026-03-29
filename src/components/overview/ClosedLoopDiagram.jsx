import { useGenesis } from '../../context/GenesisContext';
import { COMPARTMENTS } from '../../simulation/constants';
import { formatNumber } from '../../utils/formatters';

const POSITIONS = {
  waste:    { x: 190, y: 20,  w: 170, h: 70 },
  nutrient: { x: 370, y: 155, w: 170, h: 70 },
  growth:   { x: 190, y: 290, w: 170, h: 70 },
  habitat:  { x: 10,  y: 155, w: 170, h: 70 },
};

/* Animated dashed flow path */
function AnimatedFlow({ d, color, speed = '3s', width = 2 }) {
  return (
    <g>
      {/* Base path - faint */}
      <path d={d} fill="none" stroke={color} strokeWidth={width * 0.4} opacity="0.08" />
      {/* Animated dash */}
      <path d={d} fill="none" stroke={color} strokeWidth={width} strokeDasharray="6 12" opacity="0.5" strokeLinecap="round">
        <animate attributeName="stroke-dashoffset" from="18" to="0" dur={speed} repeatCount="indefinite" />
      </path>
    </g>
  );
}

function FlowLabel({ x, y, text, value, color }) {
  return (
    <g>
      <rect x={x - 48} y={y - 14} width="96" height="26" rx="4" fill="#111318" stroke={color} strokeWidth="0.6" opacity="0.9" />
      <text x={x} y={y - 2} textAnchor="middle" fill={color} fontSize="8" fontWeight="600">
        {text}
      </text>
      <text x={x} y={y + 9} textAnchor="middle" fill="#6c6e78" fontSize="7" fontFamily="monospace">{value}</text>
    </g>
  );
}

function CompartmentNode({ id, data, pos, isActive, onClick }) {
  const comp = COMPARTMENTS[id];
  const statusColor = data.status === 'nominal' ? '#4ead5b' : data.status === 'warning' ? '#d4903a' : '#d45555';

  return (
    <g onClick={() => onClick(id)} style={{ cursor: 'pointer' }}>
      {/* Active selection highlight */}
      {isActive && (
        <rect x={pos.x - 2} y={pos.y - 2} width={pos.w + 4} height={pos.h + 4} rx={10} fill="none" stroke={statusColor} strokeWidth="1.5" opacity="0.4" />
      )}

      {/* Card background */}
      <rect x={pos.x} y={pos.y} width={pos.w} height={pos.h} rx={8}
        fill="#1a1c23"
        stroke={isActive ? statusColor : '#2a2c35'}
        strokeWidth={isActive ? 1.2 : 0.8}
      />

      {/* Name and subtitle */}
      <text x={pos.x + 16} y={pos.y + 26} fill="#c5c6cc" fontSize="11" fontWeight="600">{comp.shortName}</text>
      <text x={pos.x + 16} y={pos.y + 39} fill="#6c6e78" fontSize="7.5">{comp.name}</text>

      {/* Status dot */}
      <circle cx={pos.x + pos.w - 18} cy={pos.y + 18} r={4} fill={statusColor} />

      {/* Status text */}
      <text x={pos.x + pos.w - 18} y={pos.y + 37} textAnchor="middle" fill={statusColor} fontSize="6.5" fontWeight="600">
        {data.status === 'nominal' ? 'NORMAL' : data.status === 'warning' ? 'UYARI' : 'KRITIK'}
      </text>

      {/* Data row */}
      <text x={pos.x + 16} y={pos.y + 56} fill="#6c6e78" fontSize="7" fontFamily="monospace">
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

  const cx = 275, cy = 190;

  return (
    <svg viewBox="0 0 550 390" className="w-full h-full" preserveAspectRatio="xMidYMid meet" style={{ maxHeight: '100%', maxWidth: '100%', display: 'block' }}>
      <defs>
        <pattern id="cld-grid" width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#1e2028" strokeWidth="0.3" />
        </pattern>
      </defs>

      <rect width="550" height="390" fill="url(#cld-grid)" />

      {/* Center label */}
      <text x={cx} y={cy - 8} textAnchor="middle" fill="#6c6e78" fontSize="10" fontWeight="600" opacity="0.4" letterSpacing="2">
        MELiSSA DÖNGÜSÜ
      </text>
      <text x={cx} y={cy + 6} textAnchor="middle" fill="#6c6e78" fontSize="7" opacity="0.2" letterSpacing="1">
        Kapalı Döngü Yaşam Destek
      </text>

      {/* Subtle orbit line */}
      <ellipse cx={cx} cy={cy} rx="160" ry="135" fill="none" stroke="#1e2028" strokeWidth="0.5" strokeDasharray="2 6" />

      {/* FLOW PATHS */}

      {/* Habitat -> Waste: Organic waste */}
      <AnimatedFlow
        d={`M ${hW.x + hW.w} ${hW.y + 35} Q ${cx} ${hW.y - 20} ${wW.x} ${wW.y + 35}`}
        color="#d4903a"
        speed="3s"
      />
      <FlowLabel x={cx} y={45} text="Organik Atık" value={`${formatNumber(1.8)} kg/gün`} color="#d4903a" />

      {/* Waste -> Nutrient: Nitrification */}
      <AnimatedFlow
        d={`M ${wW.x + wW.w / 2} ${wW.y + wW.h} Q ${wW.x + wW.w + 15} ${155} ${nW.x + nW.w / 2} ${nW.y}`}
        color="#8b7fc7"
        speed="3.5s"
      />
      <FlowLabel x={440} y={105} text="NH4+ → NO3-" value="Nitrifikasyon" color="#8b7fc7" />

      {/* Nutrient -> Growth: NPK Solution */}
      <AnimatedFlow
        d={`M ${nW.x + nW.w / 2} ${nW.y + nW.h} Q ${nW.x + nW.w + 15} ${290} ${gW.x + gW.w / 2} ${gW.y}`}
        color="#4ead5b"
        speed="3s"
      />
      <FlowLabel x={440} y={265} text="Besin Çözeltisi" value="NPK Döngüsü" color="#4ead5b" />

      {/* Growth -> Habitat: O₂ + Food */}
      <AnimatedFlow
        d={`M ${gW.x} ${gW.y + 25} Q ${20} ${290} ${hW.x + hW.w / 2 - 20} ${hW.y + hW.h}`}
        color="#4ead5b"
        speed="2.5s"
        width={2.5}
      />
      <FlowLabel x={70} y={270} text="O2 + Gıda" value={`${formatNumber(resources.oxygen.production)} L/gün`} color="#4ead5b" />

      {/* Habitat -> Growth: CO₂ */}
      <AnimatedFlow
        d={`M ${hW.x + hW.w / 2 + 30} ${hW.y + hW.h} Q ${130} ${300} ${gW.x + 50} ${gW.y}`}
        color="#d4903a"
        speed="4s"
      />
      <FlowLabel x={140} y={310} text="CO2" value={`${formatNumber(resources.co2.production)} L/gün`} color="#d4903a" />

      {/* Growth -> Habitat: H₂O */}
      <AnimatedFlow
        d={`M ${gW.x - 5} ${gW.y + 50} Q ${-15} ${235} ${hW.x - 5} ${hW.y + 55}`}
        color="#5b8def"
        speed="5s"
      />
      <FlowLabel x={20} y={190} text="H2O Döngüsü" value={`Geri kaz. %${(resources.water.recycleRate * 100).toFixed(1)}`} color="#5b8def" />

      {/* COMPARTMENT NODES */}
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

      {/* SELECTED INFO POPUP */}
      {selected && (
        <g>
          <rect x={cx - 90} y={cy + 20} width={180} height={80} rx={6} fill="#111318" stroke="#2a2c35" strokeWidth="1">
            <animate attributeName="opacity" from="0" to="1" dur="0.15s" fill="freeze" />
          </rect>
          <text x={cx - 75} y={cy + 40} fill="#c5c6cc" fontSize="11" fontWeight="600">
            {COMPARTMENTS[selected]?.name}
          </text>
          <line x1={cx - 75} y1={cy + 46} x2={cx + 75} y2={cy + 46} stroke="#2a2c35" strokeWidth="0.5" />
          <text x={cx - 75} y={cy + 60} fill="#6c6e78" fontSize="8" fontFamily="monospace">
            Sıcaklık: {compData[selected]?.temperature?.toFixed?.(1) || '—'}°C
          </text>
          <text x={cx - 75} y={cy + 73} fill="#6c6e78" fontSize="8" fontFamily="monospace">
            pH: {compData[selected]?.pH?.toFixed?.(2) || '—'}
          </text>
          <text x={cx - 75} y={cy + 86} fill="#6c6e78" fontSize="8" fontFamily="monospace">
            Durum: <tspan fill={compData[selected]?.status === 'nominal' ? '#4ead5b' : '#d4903a'}>{compData[selected]?.status}</tspan>
          </text>
        </g>
      )}

      {/* BOTTOM STATS */}
      <g transform="translate(10, 365)">
        <rect width="530" height="22" rx="4" fill="#111318" stroke="#2a2c3530" strokeWidth="0.5" />
        <text x="15" y="14" fill="#6c6e78" fontSize="7.5" fontWeight="600" fontFamily="monospace">
          CLOSURE:
        </text>
        <text x="72" y="14" fill="#4ead5b" fontSize="7" fontFamily="monospace">
          O2 %{(resources.closure?.o2 || 0).toFixed(1)}
        </text>
        <text x="135" y="14" fill="#4ead5b" fontSize="7" fontFamily="monospace">
          CO2 %{(resources.closure?.co2 || 0).toFixed(1)}
        </text>
        <text x="200" y="14" fill="#5b8def" fontSize="7" fontFamily="monospace">
          H2O %{(resources.closure?.water || 0).toFixed(1)}
        </text>
        <text x="265" y="14" fill="#d4903a" fontSize="7" fontFamily="monospace">
          Gıda %{(resources.closure?.food || 0).toFixed(1)}
        </text>
        <text x="340" y="14" fill="#6c6e78" fontSize="6" opacity="0.5">|</text>
        <text x="355" y="14" fill="#c5c6cc" fontSize="7.5" fontWeight="600" fontFamily="monospace">
          GENEL: %{(resources.closure?.material || 0).toFixed(1)}
        </text>
        <text x="460" y="14" fill="#6c6e78" fontSize="6.5" opacity="0.4" fontFamily="monospace">
          Ref: Yuegong-1 %98.2
        </text>
      </g>
    </svg>
  );
}
