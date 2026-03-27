export default function StatCard({ title, value, unit, icon, color = '#00f0ff', subtitle, trend }) {
  return (
    <div
      className="bg-nexus-card rounded-xl border border-nexus-border p-4 hover-lift group relative overflow-hidden"
      style={{ '--glow-color': color }}
    >
      {/* Subtle top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] opacity-40 group-hover:opacity-70 transition-opacity"
        style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
      />

      <div className="flex items-start justify-between mb-2">
        <span className="text-xs text-nexus-text-dim uppercase tracking-wider">{title}</span>
        {icon && <span className="text-lg">{icon}</span>}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-bold font-mono counter-value" style={{ color }}>{value}</span>
        {unit && <span className="text-sm text-nexus-text-dim">{unit}</span>}
      </div>
      {subtitle && (
        <p className="text-xs text-nexus-text-dim mt-1">{subtitle}</p>
      )}
      {trend !== undefined && (
        <div className={`text-xs mt-1 font-mono ${trend >= 0 ? 'text-nexus-green' : 'text-nexus-red'}`}>
          {trend >= 0 ? '▲' : '▼'} {Math.abs(trend).toFixed(1)}%
        </div>
      )}

      {/* Hover glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ boxShadow: `inset 0 0 30px ${color}08` }}
      />
    </div>
  );
}
