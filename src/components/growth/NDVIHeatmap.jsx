import { useGenesis } from '../../context/GenesisContext';
import { PLANTS } from '../../simulation/constants';

const NDVI_COLORS = [
  { threshold: 0.2, color: '#ef4444', label: 'Kritik' },
  { threshold: 0.4, color: '#f97316', label: 'Düşük' },
  { threshold: 0.55, color: '#eab308', label: 'Zayıf' },
  { threshold: 0.7, color: '#84cc16', label: 'Orta' },
  { threshold: 0.85, color: '#22c55e', label: 'İyi' },
  { threshold: 1.0, color: '#059669', label: 'Mükemmel' },
];

function getNDVIColor(value) {
  for (const { threshold, color } of NDVI_COLORS) {
    if (value <= threshold) return color;
  }
  return '#059669';
}

function PlantHealthCell({ type, ndviValue, count, moduleKey }) {
  const plant = PLANTS[type];
  if (!plant) return null;

  const color = getNDVIColor(ndviValue);
  const healthPct = Math.round(ndviValue * 100);

  return (
    <div className="relative group">
      <div
        className="rounded-lg p-2 border border-transparent hover:border-nexus-accent/30 transition-all cursor-default"
        style={{ backgroundColor: `${color}15` }}
      >
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-sm">{plant.icon}</span>
          <span className="text-[10px] text-nexus-text truncate">{plant.name}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="flex-1 h-2 rounded-full bg-nexus-bg overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${healthPct}%`, backgroundColor: color }}
            />
          </div>
          <span className="text-[10px] font-mono font-bold w-8 text-right" style={{ color }}>
            {ndviValue.toFixed(2)}
          </span>
        </div>
        <div className="text-[9px] text-nexus-text-dim mt-0.5">
          x{count} bitki
        </div>
      </div>

      {/* Tooltip on hover */}
      <div className="tooltip-content absolute bottom-full left-1/2 -translate-x-1/2 mb-1 z-10 bg-nexus-card border border-nexus-border rounded-lg px-2 py-1.5 shadow-xl min-w-[140px]">
        <div className="text-[10px] font-bold text-nexus-text mb-1">{plant.icon} {plant.name}</div>
        <div className="text-[9px] text-nexus-text-dim space-y-0.5">
          <div>NDVI: <span className="font-mono" style={{ color }}>{ndviValue.toFixed(3)}</span></div>
          <div>Modül: <span className="text-nexus-accent">{moduleKey === 'aeroponic' ? 'Aeroponik' : 'NFT'}</span></div>
          <div>Durum: <span style={{ color }}>{NDVI_COLORS.find(c => ndviValue <= c.threshold)?.label || 'Mükemmel'}</span></div>
        </div>
      </div>
    </div>
  );
}

export default function NDVIHeatmap() {
  const { state } = useGenesis();
  const { ndvi, compartments } = state;

  const aeroPlants = compartments.growth?.modules?.aeroponic?.plants || [];
  const nftPlants = compartments.growth?.modules?.nft?.plants || [];

  const aeroNDVI = ndvi?.aeroponic || { average: 0.75, plants: {} };
  const nftNDVI = ndvi?.nft || { average: 0.78, plants: {} };

  return (
    <div className="bg-nexus-card rounded-xl border border-nexus-border p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs text-nexus-text-dim uppercase tracking-wider">NDVI Bitki Sağlık Haritası</h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {NDVI_COLORS.map(({ color, label }) => (
              <div key={label} className="flex items-center gap-0.5 tooltip-trigger relative">
                <div className="w-3 h-2 rounded-sm" style={{ backgroundColor: color }} />
                <div className="tooltip-content absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-1 py-0.5 bg-nexus-card border border-nexus-border rounded text-[8px] text-nexus-text-dim whitespace-nowrap">
                  {label}
                </div>
              </div>
            ))}
          </div>
          <span className="text-[9px] text-nexus-text-dim">0.0 — 1.0</span>
        </div>
      </div>

      {/* Aeroponic module */}
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] text-nexus-text-dim uppercase tracking-wider">Aeroponik</span>
          <div className="flex-1 h-px bg-nexus-border" />
          <span className="text-[10px] font-mono font-bold" style={{ color: getNDVIColor(aeroNDVI.average) }}>
            Ort: {aeroNDVI.average?.toFixed(2)}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {aeroPlants.map((p, i) => {
            const plantNdvi = aeroNDVI.plants?.[i]?.ndvi || aeroNDVI.average || 0.75;
            return (
              <PlantHealthCell
                key={i}
                type={p.type}
                ndviValue={plantNdvi}
                count={p.count}
                moduleKey="aeroponic"
              />
            );
          })}
        </div>
      </div>

      {/* NFT module */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] text-nexus-text-dim uppercase tracking-wider">NFT Hidroponik</span>
          <div className="flex-1 h-px bg-nexus-border" />
          <span className="text-[10px] font-mono font-bold" style={{ color: getNDVIColor(nftNDVI.average) }}>
            Ort: {nftNDVI.average?.toFixed(2)}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {nftPlants.map((p, i) => {
            const plantNdvi = nftNDVI.plants?.[i]?.ndvi || nftNDVI.average || 0.78;
            return (
              <PlantHealthCell
                key={i}
                type={p.type}
                ndviValue={plantNdvi}
                count={p.count}
                moduleKey="nft"
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
