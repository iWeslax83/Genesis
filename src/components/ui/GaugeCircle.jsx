import React from 'react';

const GaugeCircle = React.memo(function GaugeCircle({ value, min, max, label, unit, size = 120, warningThresholds }) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const normalizedValue = Math.min(1, Math.max(0, (value - min) / (max - min)));
  const strokeDashoffset = circumference * (1 - normalizedValue * 0.75); // 270 deg arc

  // Color determination
  let color = '#4ead5b';
  if (warningThresholds) {
    if (value < warningThresholds.critical?.[0] || value > warningThresholds.critical?.[1]) {
      color = '#d45555';
    } else if (value < warningThresholds.warning?.[0] || value > warningThresholds.warning?.[1]) {
      color = '#d4903a';
    }
  } else {
    if (normalizedValue > 0.85 || normalizedValue < 0.15) color = '#d45555';
    else if (normalizedValue > 0.7 || normalizedValue < 0.25) color = '#d4903a';
  }

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${label}: ${value} ${unit}`}>
        {/* Background arc */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="#22242c" strokeWidth="6"
          strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
          strokeDashoffset={0}
          strokeLinecap="round"
          transform={`rotate(135 ${size / 2} ${size / 2})`}
        />

        {/* Value arc */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(135 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.3s ease' }}
        />

        {/* Tick marks */}
        {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
          const angle = 135 + t * 270;
          const rad = (angle * Math.PI) / 180;
          const x1 = size / 2 + (radius + 4) * Math.cos(rad);
          const y1 = size / 2 + (radius + 4) * Math.sin(rad);
          const x2 = size / 2 + (radius + 7) * Math.cos(rad);
          const y2 = size / 2 + (radius + 7) * Math.sin(rad);
          return (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#2a2c35" strokeWidth="1" />
          );
        })}

        {/* Value text */}
        <text
          x={size / 2} y={size / 2 - 4}
          textAnchor="middle"
          className="font-mono font-semibold"
          style={{ fill: color, fontSize: size * 0.18 }}
        >
          {typeof value === 'number' ? value.toFixed(1) : value}
        </text>
        <text
          x={size / 2} y={size / 2 + 14}
          textAnchor="middle"
          style={{ fill: '#6c6e78', fontSize: size * 0.1 }}
        >
          {unit}
        </text>
      </svg>
      <span className="text-[11px] text-nexus-text-dim mt-1">{label}</span>
    </div>
  );
});

export default GaugeCircle;
