import { getStatusColor } from '../../utils/formatters';

export default function StatusDot({ status, label, size = 'sm' }) {
  const color = getStatusColor(status);
  const dotSize = size === 'sm' ? 'w-2 h-2' : 'w-3 h-3';

  return (
    <div className="flex items-center gap-2">
      <div className={`${dotSize} rounded-full ${status === 'critical' ? 'animate-blink' : ''}`}
        style={{ backgroundColor: color }}
      />
      {label && <span className="text-xs text-nexus-text-dim">{label}</span>}
    </div>
  );
}
