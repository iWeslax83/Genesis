export default function StatCard({ title, value, unit, icon, color = '#00f0ff', subtitle, trend }) {
  return (
    <div className="bg-nexus-card rounded-xl border border-nexus-border p-4 hover:border-nexus-accent/30 transition-all">
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs text-nexus-text-dim uppercase tracking-wider">{title}</span>
        {icon && <span className="text-lg">{icon}</span>}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-bold font-mono" style={{ color }}>{value}</span>
        {unit && <span className="text-sm text-nexus-text-dim">{unit}</span>}
      </div>
      {subtitle && (
        <p className="text-xs text-nexus-text-dim mt-1">{subtitle}</p>
      )}
      {trend !== undefined && (
        <div className={`text-xs mt-1 ${trend >= 0 ? 'text-nexus-green' : 'text-nexus-red'}`}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}%
        </div>
      )}
    </div>
  );
}
