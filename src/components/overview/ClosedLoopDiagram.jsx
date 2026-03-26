import React from 'react';
import { useGenesis } from '../../context/GenesisContext';
import { COMPARTMENTS } from '../../simulation/constants';
import { formatNumber } from '../../utils/formatters';

const POSITIONS = {
  waste:    { x: 190, y: 30,  w: 170, h: 65 },
  nutrient: { x: 360, y: 155, w: 170, h: 65 },
  growth:   { x: 190, y: 280, w: 170, h: 65 },
  habitat:  { x: 20,  y: 155, w: 170, h: 65 },
};

function AnimatedPath({ d, color, speed = '3s' }) {
  return (
    <g>
      <path d={d} fill="none" stroke={color} strokeWidth="1.5" opacity="0.12" />
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeDasharray="6 10" opacity="0.7">
        <animate attributeName="stroke-dashoffset" from="16" to="0" dur={speed} repeatCount="indefinite" />
      </path>
    </g>
  );
}

function FlowLabel({ x, y, text, value, color }) {
  return (
    <g>
      <rect x={x - 42} y={y - 14} width="84" height="26" rx="6" fill="#0a0e1a" stroke={color} strokeWidth="0.7" opacity="0.9" />
      <text x={x} y={y - 2} textAnchor="middle" fill={color} fontSize="8" fontWeight="600">{text}</text>
      <text x={x} y={y + 9} textAnchor="middle" fill="#94a3b8" fontSize="7" fontFamily="monospace">{value}</text>
    </g>
  );
}

function CompartmentNode({ id, data, pos, isActive, onClick }) {
  const comp = COMPARTMENTS[id];
  const statusColor = data.status === 'nominal' ? '#22c55e' : data.status === 'warning' ? '#f59e0b' : '#ef4444';

  return (
    <g onClick={() => onClick(id)} style={{ cursor: 'pointer' }}>
      {/* Outer glow */}
      {isActive && (
        <rect x={pos.x - 3} y={pos.y - 3} width={pos.w + 6} height={pos.h + 6} rx={14} fill="none" stroke={comp.color} strokeWidth="1.5" opacity="0.3">
          <animate attributeName="opacity" values="0.2;0.4;0.2" dur="2s" repeatCount="indefinite" />
        </rect>
      )}

      {/* Background */}
      <rect x={pos.x} y={pos.y} width={pos.w} height={pos.h} rx={12}
        fill={isActive ? `${comp.color}12` : '#111827'}
        stroke={comp.color}
        strokeWidth={isActive ? 1.8 : 1}
        opacity={isActive ? 1 : 0.75}
      />

      {/* Icon + Name */}
      <text x={pos.x + 16} y={pos.y + 24} fontSize="16">{comp.icon}</text>
      <text x={pos.x + 38} y={pos.y + 22} fill="#e2e8f0" fontSize="11" fontWeight="700">{comp.shortName}</text>
      <text x={pos.x + 38} y={pos.y + 35} fill="#94a3b8" fontSize="8">{comp.name}</text>

      {/* Status indicator */}
      <circle cx={pos.x + pos.w - 16} cy={pos.y + 18} r={4} fill={statusColor}>
        {data.status !== 'nominal' && (
          <animate attributeName="r" values="4;5;4" dur="1.5s" repeatCount="indefinite" />
        )}
      </circle>
      <text x={pos.x + pos.w - 16} y={pos.y + 35} textAnchor="middle" fill={statusColor} fontSize="7" fontWeight="600">
        {data.status === 'nominal' ? 'OK' : data.status === 'warning' ? 'UYARI' : 'KRiTiK'}
      </text>

      {/* Temperature/pH mini data */}
      {data.temperature !== undefined && (
        <text x={pos.x + 16} y={pos.y + 52} fill="#94a3b8" fontSize="7" fontFamily="monospace">
          {data.temperature?.toFixed?.(1)}°C {data.pH !== undefined ? `| pH ${data.pH?.toFixed?.(1)}` : ''}
        </text>
      )}
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
    habitat: compartments.habitat,
  };

  // Flow paths
  const hW = POSITIONS.habitat;
  const wW = POSITIONS.waste;
  const nW = POSITIONS.nutrient;
  const gW = POSITIONS.growth;

  return (
    <svg viewBox="0 0 550 380" className="w-full h-full" style={{ maxHeight: '100%' }}>
      <defs>
        <pattern id="cld-grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.3" />
        </pattern>
        <filter id="cld-glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <rect width="550" height="380" fill="url(#cld-grid)" />

      {/* Center label */}
      <text x="275" y="170" textAnchor="middle" fill="#00f0ff" fontSize="10" fontWeight="800" opacity="0.4">
        MELiSSA DONGUSU
      </text>
      <text x="275" y="182" textAnchor="middle" fill="#94a3b8" fontSize="7" opacity="0.3">
        Kapali Dongu Yasam Destek
      </text>

      {/* FLOW: Habitat -> Waste (top-left to top-right) */}
      <AnimatedPath
        d={`M ${hW.x + hW.w} ${hW.y + 30} Q ${275} ${hW.y - 10} ${wW.x} ${wW.y + 30}`}
        color="#ff8800"
      />
      <FlowLabel x={275} y={50} text="Organik Atik" value={`${formatNumber(10.8)} kg/gun`} color="#ff8800" />

      {/* FLOW: Waste -> Nutrient (top-right to mid-right) */}
      <AnimatedPath
        d={`M ${wW.x + wW.w / 2} ${wW.y + wW.h} Q ${wW.x + wW.w + 10} ${160} ${nW.x + nW.w / 2} ${nW.y}`}
        color="#c084fc"
      />
      <FlowLabel x={430} y={110} text="NH4+ -> NO3-" value="Nitrifikasyon" color="#c084fc" />

      {/* FLOW: Nutrient -> Growth (mid-right to bottom) */}
      <AnimatedPath
        d={`M ${nW.x + nW.w / 2} ${nW.y + nW.h} Q ${nW.x + nW.w + 10} ${280} ${gW.x + gW.w / 2} ${gW.y}`}
        color="#22c55e"
      />
      <FlowLabel x={430} y={260} text="Besin Cozeltisi" value="NPK Dongüsü" color="#22c55e" />

      {/* FLOW: Growth -> Habitat (bottom to mid-left) — O₂ + Food */}
      <AnimatedPath
        d={`M ${gW.x} ${gW.y + 20} Q ${30} ${280} ${hW.x + hW.w / 2} ${hW.y + hW.h}`}
        color="#34d399"
      />
      <FlowLabel x={80} y={260} text="O2 + Gida" value={`${formatNumber(resources.oxygen.production)} L/gun`} color="#34d399" />

      {/* FLOW: Habitat -> Growth (mid-left to bottom) — CO₂ */}
      <AnimatedPath
        d={`M ${hW.x + hW.w / 2 + 40} ${hW.y + hW.h} Q ${120} ${290} ${gW.x + 40} ${gW.y}`}
        color="#f97316"
        speed="4s"
      />
      <FlowLabel x={130} y={300} text="CO2" value={`${formatNumber(resources.co2.production)} L/gun`} color="#f97316" />

      {/* FLOW: Growth -> Habitat — H₂O */}
      <AnimatedPath
        d={`M ${gW.x} ${gW.y + 50} Q ${-10} ${230} ${hW.x} ${hW.y + 50}`}
        color="#3b82f6"
        speed="5s"
      />
      <FlowLabel x={30} y={185} text="H2O" value={`Geri kaz. %${(resources.water.recycleRate * 100).toFixed(1)}`} color="#3b82f6" />

      {/* Compartment nodes */}
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

      {/* Selected info popup */}
      {selected && (
        <g>
          <rect x={195} y={195} width={160} height={70} rx={8} fill="#0a0e1a" stroke="#2a3154" strokeWidth="1.2">
            <animate attributeName="opacity" from="0" to="1" dur="0.3s" fill="freeze" />
          </rect>
          <text x={205} y={213} fill="#e2e8f0" fontSize="10" fontWeight="700">
            {COMPARTMENTS[selected]?.icon} {COMPARTMENTS[selected]?.name}
          </text>
          <text x={205} y={228} fill="#94a3b8" fontSize="8" fontFamily="monospace">
            Sicaklik: {compData[selected]?.temperature?.toFixed?.(1) || '—'}°C
          </text>
          <text x={205} y={241} fill="#94a3b8" fontSize="8" fontFamily="monospace">
            pH: {compData[selected]?.pH?.toFixed?.(2) || '—'}
          </text>
          <text x={205} y={254} fill="#94a3b8" fontSize="8" fontFamily="monospace">
            Durum: {compData[selected]?.status}
          </text>
        </g>
      )}

      {/* Closure target indicator */}
      <g transform="translate(425, 330)">
        <rect width="115" height="40" rx="6" fill="#0a0e1a" stroke="#2a315440" strokeWidth="0.7" />
        <text x="10" y="14" fill="#94a3b8" fontSize="7">Malzeme Kapaliligi</text>
        <text x="10" y="28" fill="#00f0ff" fontSize="11" fontWeight="bold" fontFamily="monospace">
          %{(resources.closure?.material || 0).toFixed(1)}
        </text>
        <text x="75" y="28" fill="#94a3b8" fontSize="7">/ 98%</text>
      </g>
    </svg>
  );
}
