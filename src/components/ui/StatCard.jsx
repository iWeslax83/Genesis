import React from 'react';

const StatCard = React.memo(function StatCard({ title, value, unit, icon, color = '#5b8def', subtitle, trend }) {
  return (
    <div className="bg-nexus-card rounded-lg border border-nexus-border p-4 relative overflow-hidden" aria-label={`${title}: ${value} ${unit || ''}`}>
      {/* Left accent bar */}
      <div
        className="absolute top-0 left-0 bottom-0 w-[3px]"
        style={{ backgroundColor: color, opacity: 0.5 }}
      />

      <div className="flex items-start justify-between mb-2">
        <span className="text-[11px] text-nexus-text-dim uppercase tracking-wider">{title}</span>
        {icon && <span className="text-sm text-nexus-text-dim">{icon}</span>}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-xl font-semibold font-mono counter-value" style={{ color }}>{value}</span>
        {unit && <span className="text-xs text-nexus-text-dim">{unit}</span>}
      </div>
      {subtitle && (
        <p className="text-[11px] text-nexus-text-dim mt-1">{subtitle}</p>
      )}
      {trend !== undefined && (
        <div className={`text-xs mt-1 font-mono ${trend >= 0 ? 'text-nexus-green' : 'text-nexus-red'}`}>
          {trend >= 0 ? '▲' : '▼'} {Math.abs(trend).toFixed(1)}%
        </div>
      )}
    </div>
  );
});

export default StatCard;
