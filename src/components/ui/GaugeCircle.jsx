export default function GaugeCircle({ value, min, max, label, unit, size = 120, warningThresholds }) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const normalizedValue = Math.min(1, Math.max(0, (value - min) / (max - min)));
  const strokeDashoffset = circumference * (1 - normalizedValue * 0.75); // 270° arc

  // Renk belirleme
  let color = '#00ff88'; // yeşil
  if (warningThresholds) {
    if (value < warningThresholds.critical?.[0] || value > warningThresholds.critical?.[1]) {
      color = '#ff4466'; // kırmızı
    } else if (value < warningThresholds.warning?.[0] || value > warningThresholds.warning?.[1]) {
      color = '#ff8800'; // turuncu
    }
  } else {
    if (normalizedValue > 0.85 || normalizedValue < 0.15) color = '#ff4466';
    else if (normalizedValue > 0.7 || normalizedValue < 0.25) color = '#ff8800';
  }

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Arka plan çember */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="#1a1f36" strokeWidth="8"
          strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
          strokeDashoffset={0}
          strokeLinecap="round"
          transform={`rotate(135 ${size / 2} ${size / 2})`}
        />
        {/* Değer çemberi */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(135 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.3s ease' }}
        />
        {/* Değer text */}
        <text
          x={size / 2} y={size / 2 - 4}
          textAnchor="middle"
          className="font-mono font-bold"
          style={{ fill: color, fontSize: size * 0.18 }}
        >
          {typeof value === 'number' ? value.toFixed(1) : value}
        </text>
        <text
          x={size / 2} y={size / 2 + 14}
          textAnchor="middle"
          style={{ fill: '#94a3b8', fontSize: size * 0.1 }}
        >
          {unit}
        </text>
      </svg>
      <span className="text-xs text-nexus-text-dim mt-1">{label}</span>
    </div>
  );
}
