import React, { useState, useMemo } from 'react';
import { useGenesis } from '../../context/GenesisContext';
import { PLANTS } from '../../simulation/constants';
import { formatNumber } from '../../utils/formatters';
import InfoTooltip from '../ui/InfoTooltip';
import {
  FiDroplet, FiSun, FiWind, FiThermometer, FiZap, FiActivity,
  FiAlertTriangle, FiCheckCircle, FiUsers, FiClock,
  FiCircle, FiHexagon, FiBox, FiHome, FiFeather,
} from 'react-icons/fi';

/* --- Yardımcı --- */
const statusColor = (s) =>
  s === 'nominal' ? '#4ead5b' : s === 'warning' ? '#d4903a' : '#d45555';

const pct = (v, max) => Math.min(100, Math.max(0, (v / max) * 100));

function MiniBar({ value, max, color = '#4ead5b', bg = '#1e293b' }) {
  return (
    <div className="h-1.5 rounded-full overflow-hidden w-full" style={{ backgroundColor: bg }}>
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${pct(value, max)}%`, backgroundColor: color }}
      />
    </div>
  );
}

/* =================================================================
   ZONE DETAY PANELLERİ
   ================================================================= */

function AeroponicDetail({ mod, day, ndvi, pathogens }) {
  if (!mod) return null;
  const plants = mod.plants || [];
  return (
    <div className="space-y-3">
      {/* Ortam */}
      <div className="grid grid-cols-3 gap-2">
        <Env icon={<FiThermometer />} label="Sıcaklık" value={`${mod.temperature?.toFixed(1)}°C`} />
        <Env icon={<FiDroplet />} label="Nem" value={`%${mod.humidity?.toFixed(0)}`} />
        <Env icon={<FiSun />} label="PAR" value={`${mod.lightPAR?.toFixed(0)} µmol`} />
        <Env icon={<FiWind />} label="CO2" value={`${mod.co2?.toFixed(0)} ppm`} />
        <Env icon={<FiDroplet />} label="pH" value={mod.pH?.toFixed(1)} />
        <Env icon={<FiActivity />} label="EC" value={`${mod.ec?.toFixed(1)} mS`} />
      </div>

      {/* NDVI */}
      {ndvi && (
        <div className="flex items-center gap-2 text-xs">
          <span className="text-nexus-text-dim">NDVI Ort:</span>
          <span className="font-mono font-semibold" style={{ color: ndvi.average > 0.7 ? '#4ead5b' : ndvi.average > 0.5 ? '#d4903a' : '#d45555' }}>
            {ndvi.average?.toFixed(2)}
          </span>
          {pathogens?.infections?.length > 0 && (
            <span className="text-red-400 flex items-center gap-1">
              <FiAlertTriangle className="text-[10px]" /> {pathogens.infections.length} patojen
            </span>
          )}
        </div>
      )}

      {/* Bitkiler */}
      <div className="space-y-1.5">
        <span className="text-[10px] text-nexus-text-dim uppercase tracking-wider">Bitkiler</span>
        {plants.map((p, i) => {
          const info = PLANTS[p.type];
          if (!info) return null;
          const age = Math.max(0, day - (p.plantedDay || 0));
          const growth = Math.min(100, (age / (info.growthDays || 90)) * 100);
          const ready = growth >= 100;
          return (
            <div key={i} className="bg-nexus-bg/50 rounded-lg p-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-nexus-text flex items-center gap-1.5">
                  <span>{info.icon}</span> {info.name}
                  <span className="text-nexus-text-dim text-[10px]">x{p.count}</span>
                </span>
                <span className={`text-xs font-mono font-semibold ${ready ? 'text-emerald-400' : 'text-nexus-accent'}`}>
                  {ready ? 'Hasat' : `%${growth.toFixed(0)}`}
                </span>
              </div>
              <MiniBar value={growth} max={100} color={ready ? '#4ead5b' : '#4a9caa'} />
              <div className="flex justify-between mt-1 text-[9px] text-nexus-text-dim">
                <span>Gün {age}/{info.growthDays}</span>
                <span>{info.caloriesPerKg} kcal/kg</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function NFTDetail({ mod, day, ndvi, pathogens }) {
  if (!mod) return null;
  const plants = mod.plants || [];
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <Env icon={<FiThermometer />} label="Sıcaklık" value={`${mod.temperature?.toFixed(1)}°C`} />
        <Env icon={<FiDroplet />} label="Nem" value={`%${mod.humidity?.toFixed(0)}`} />
        <Env icon={<FiSun />} label="PAR" value={`${mod.lightPAR?.toFixed(0)} µmol`} />
        <Env icon={<FiWind />} label="CO2" value={`${mod.co2?.toFixed(0)} ppm`} />
        <Env icon={<FiDroplet />} label="pH" value={mod.pH?.toFixed(1)} />
        <Env icon={<FiActivity />} label="EC" value={`${mod.ec?.toFixed(1)} mS`} />
      </div>

      {ndvi && (
        <div className="flex items-center gap-2 text-xs">
          <span className="text-nexus-text-dim">NDVI Ort:</span>
          <span className="font-mono font-semibold" style={{ color: ndvi.average > 0.7 ? '#4ead5b' : ndvi.average > 0.5 ? '#d4903a' : '#d45555' }}>
            {ndvi.average?.toFixed(2)}
          </span>
          {pathogens?.infections?.length > 0 && (
            <span className="text-red-400 flex items-center gap-1">
              <FiAlertTriangle className="text-[10px]" /> {pathogens.infections.length} patojen
            </span>
          )}
        </div>
      )}

      <div className="space-y-1.5">
        <span className="text-[10px] text-nexus-text-dim uppercase tracking-wider">Bitkiler</span>
        {plants.map((p, i) => {
          const info = PLANTS[p.type];
          if (!info) return null;
          const age = Math.max(0, day - (p.plantedDay || 0));
          const growth = Math.min(100, (age / (info.growthDays || 30)) * 100);
          const ready = growth >= 100;
          return (
            <div key={i} className="bg-nexus-bg/50 rounded-lg p-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-nexus-text flex items-center gap-1.5">
                  <span>{info.icon}</span> {info.name}
                  <span className="text-nexus-text-dim text-[10px]">x{p.count}</span>
                </span>
                <span className={`text-xs font-mono font-semibold ${ready ? 'text-emerald-400' : 'text-nexus-accent'}`}>
                  {ready ? 'Hasat' : `%${growth.toFixed(0)}`}
                </span>
              </div>
              <MiniBar value={growth} max={100} color={ready ? '#4ead5b' : '#4a9caa'} />
              <div className="flex justify-between mt-1 text-[9px] text-nexus-text-dim">
                <span>Gün {age}/{info.growthDays}</span>
                <span>{info.caloriesPerKg} kcal/kg</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SpirulinaDetail({ mod }) {
  if (!mod) return null;
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <Env icon={<FiThermometer />} label="Sıcaklık" value={`${mod.temperature?.toFixed(1)}°C`} />
        <Env icon={<FiDroplet />} label="pH" value={mod.pH?.toFixed(1)} />
        <Env icon={<FiActivity />} label="Yoğunluk" value={`${mod.density?.toFixed(1)} g/L`} />
        <Env icon={<FiSun />} label="Işık" value={`${mod.lightIntensity?.toFixed(0)} µmol`} />
      </div>
      <div className="space-y-2">
        <div className="bg-nexus-bg/50 rounded-lg p-2">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-nexus-text-dim">O2 Üretim</span>
            <span className="text-emerald-400 font-mono">{mod.o2Production?.toFixed(0)} L/gün</span>
          </div>
          <MiniBar value={mod.o2Production || 0} max={1200} color="#4ead5b" />
        </div>
        <div className="bg-nexus-bg/50 rounded-lg p-2">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-nexus-text-dim">Hasat Oranı</span>
            <span className="text-cyan-400 font-mono">{mod.harvestRate?.toFixed(1)} g/gün</span>
          </div>
          <MiniBar value={mod.harvestRate || 0} max={500} color="#4a9caa" />
        </div>
        <div className="bg-nexus-bg/50 rounded-lg p-2">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-nexus-text-dim">Kontaminasyon Riski</span>
            <span className="font-mono" style={{ color: (mod.contaminationRisk || 0) > 30 ? '#d45555' : '#4ead5b' }}>
              %{(mod.contaminationRisk || 0).toFixed(0)}
            </span>
          </div>
          <MiniBar value={mod.contaminationRisk || 0} max={100} color={(mod.contaminationRisk || 0) > 30 ? '#d45555' : '#4ead5b'} />
        </div>
      </div>
    </div>
  );
}

function HabitatDetail({ habitat, crew, resources }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <Env icon={<FiUsers />} label="Mürettebat" value={`${habitat?.crewCount || 6} kişi`} />
        <Env icon={<FiThermometer />} label="Sıcaklık" value={`${habitat?.temperature?.toFixed(1)}°C`} />
        <Env icon={<FiDroplet />} label="Nem" value={`%${habitat?.humidity?.toFixed(0)}`} />
      </div>

      {/* Atmosfer */}
      <div className="space-y-2">
        <span className="text-[10px] text-nexus-text-dim uppercase tracking-wider">Atmosfer</span>
        <div className="bg-nexus-bg/50 rounded-lg p-2">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-nexus-text-dim">O2 Seviyesi</span>
            <span className="text-emerald-400 font-mono">%{habitat?.o2Level?.toFixed(1)}</span>
          </div>
          <MiniBar value={habitat?.o2Level || 0} max={25} color="#4ead5b" />
        </div>
        <div className="bg-nexus-bg/50 rounded-lg p-2">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-nexus-text-dim">CO2 Seviyesi</span>
            <span className="font-mono" style={{ color: (habitat?.co2Level || 0) > 0.5 ? '#d45555' : '#d4903a' }}>
              %{habitat?.co2Level?.toFixed(2)}
            </span>
          </div>
          <MiniBar value={habitat?.co2Level || 0} max={1} color={(habitat?.co2Level || 0) > 0.5 ? '#d45555' : '#d4903a'} />
        </div>
      </div>

      {/* Su Rezervi */}
      <div className="bg-nexus-bg/50 rounded-lg p-2">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-nexus-text-dim">Su Rezervi</span>
          <span className="text-blue-400 font-mono">{formatNumber(habitat?.waterReserve || 0)} L</span>
        </div>
        <MiniBar value={habitat?.waterReserve || 0} max={2500} color="#5b8def" />
      </div>
    </div>
  );
}

function MushroomDetail({ mod }) {
  if (!mod) return null;
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <Env icon={<FiThermometer />} label="Sıcaklık" value={`${mod.temperature?.toFixed(1)}°C`} />
        <Env icon={<FiDroplet />} label="Nem" value={`%${mod.humidity?.toFixed(0)}`} />
        <Env icon={<FiWind />} label="CO2" value={`${mod.co2?.toFixed(0)} ppm`} />
        <Env icon={<FiActivity />} label="Substrat" value={`%${(mod.substrateLevel || 0).toFixed(0)}`} />
      </div>
      <div className="bg-nexus-bg/50 rounded-lg p-2">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-nexus-text-dim">Hasat Oranı</span>
          <span className="text-amber-400 font-mono">{mod.harvestRate?.toFixed(1)} g/gün</span>
        </div>
        <MiniBar value={mod.harvestRate || 0} max={300} color="#d4903a" />
      </div>
    </div>
  );
}

const LABEL_METRIC_MAP = {
  'PAR': 'par', 'CO2': 'co2', 'pH': 'ph', 'EC': 'ec', 'NDVI': 'ndvi',
};

function Env({ icon, label, value }) {
  const metricKey = LABEL_METRIC_MAP[label];
  return (
    <div className="bg-nexus-bg/40 rounded-lg px-2 py-1.5 text-center">
      <div className="text-nexus-text-dim text-[10px] flex items-center justify-center gap-1">
        {icon} {label}
        {metricKey && <InfoTooltip metricKey={metricKey} size={9} />}
      </div>
      <div className="text-xs font-mono text-nexus-text font-semibold">{value}</div>
    </div>
  );
}

/* =================================================================
   ZONE TANIMLARI
   ================================================================= */

const ZONES = [
  { id: 'aeroponic', label: 'Aeroponik Modül', icon: <FiFeather size={14} />, color: '#4ead5b', borderColor: '#4ead5b' },
  { id: 'nft',       label: 'NFT Hidroponik',  icon: <FiDroplet size={14} />, color: '#4a9caa', borderColor: '#4a9caa' },
  { id: 'spirulina', label: 'Spirulina Reaktör', icon: <FiHexagon size={14} />, color: '#8b7fc7', borderColor: '#8b7fc7' },
  { id: 'mushroom',  label: 'Mantar Üretim',   icon: <FiCircle size={14} />, color: '#d4903a', borderColor: '#d4903a' },
  { id: 'habitat',   label: 'Mürettebat Alanı', icon: <FiHome size={14} />, color: '#d45555', borderColor: '#d45555' },
];

/* =================================================================
   FACILITY MAP (SVG)
   ================================================================= */

function FacilityMap({ selected, onSelect, modules, state }) {
  const aero = modules?.aeroponic;
  const nft = modules?.nft;
  const spir = modules?.spirulina;
  const mush = modules?.mushroom;
  const hab = state.compartments?.habitat;

  // Mini status dot
  const dot = (status) => {
    const c = status === 'nominal' ? '#4ead5b' : status === 'warning' ? '#d4903a' : '#d45555';
    return <circle r="4" fill={c}><animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" /></circle>;
  };

  const isLight = (aero?.lightPAR || 0) > 100;

  return (
    <svg viewBox="0 0 800 520" className="w-full h-full">
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <linearGradient id="pipeGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#4a9caa" stopOpacity="0.6" />
          <stop offset="50%" stopColor="#4ead5b" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#4a9caa" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id="waterGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#5b8def" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#4a9caa" stopOpacity="0.7" />
        </linearGradient>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5" />
        </pattern>
      </defs>

      {/* Arka plan grid */}
      <rect width="800" height="520" fill="#0a0e1a" rx="12" />
      <rect width="800" height="520" fill="url(#grid)" rx="12" opacity="0.5" />

      {/* İstasyon dış çerçeve */}
      <rect x="30" y="30" width="740" height="460" rx="24" ry="24"
        fill="none" stroke="#2a3154" strokeWidth="2" strokeDasharray="8 4" />
      <text x="400" y="22" textAnchor="middle" fill="#475569" fontSize="10" fontFamily="monospace">
        GENESIS UZAY TARIMI TESİSİ -- HABİTAT KESİT HARİTASI
      </text>

      {/* ---- Boru hatları (zone'lar arası) ---- */}
      {/* Su hattı: Habitat -> Aeroponik */}
      <line x1="590" y1="200" x2="340" y2="120" stroke="url(#waterGrad)" strokeWidth="3" className="flow-line" />
      {/* Besin hattı: Aeroponik -> NFT */}
      <line x1="190" y1="250" x2="190" y2="340" stroke="url(#pipeGrad)" strokeWidth="3" className="flow-line" />
      {/* O2 hattı: Spirulina -> Habitat */}
      <line x1="540" y1="410" x2="620" y2="280" stroke="#4ead5b" strokeWidth="2" strokeDasharray="6 4" opacity="0.5" className="flow-line" />
      {/* CO2 hattı: Habitat -> Spirulina */}
      <line x1="600" y1="290" x2="520" y2="400" stroke="#d4903a" strokeWidth="2" strokeDasharray="6 4" opacity="0.4" className="flow-line-reverse" />
      {/* Atık -> Mantar */}
      <line x1="660" y1="280" x2="660" y2="370" stroke="#d4903a" strokeWidth="2" strokeDasharray="4 6" opacity="0.4" className="flow-line" />

      {/* Akış etiketleri */}
      <text x="450" y="148" fill="#5b8def" fontSize="8" fontFamily="monospace" opacity="0.7">Su</text>
      <text x="196" y="300" fill="#4a9caa" fontSize="8" fontFamily="monospace" opacity="0.7">Besin</text>
      <text x="556" y="348" fill="#4ead5b" fontSize="8" fontFamily="monospace" opacity="0.7">O2 &gt;</text>
      <text x="556" y="362" fill="#d4903a" fontSize="8" fontFamily="monospace" opacity="0.7">&lt; CO2</text>

      {/* ---- ZONE: Aeroponik ---- */}
      <g className="cursor-pointer" onClick={() => onSelect('aeroponic')}>
        <rect x="60" y="55" width="280" height="200" rx="12"
          fill={selected === 'aeroponic' ? '#4ead5b10' : '#0f172a'}
          stroke={selected === 'aeroponic' ? '#4ead5b' : '#4ead5b40'}
          strokeWidth={selected === 'aeroponic' ? 2.5 : 1.5}
        />
        {/* LED ışık barları */}
        {isLight && <>
          <rect x="70" y="60" width="260" height="3" rx="1" fill="#d45555" opacity="0.5">
            <animate attributeName="opacity" values="0.3;0.7;0.3" dur="3s" repeatCount="indefinite" />
          </rect>
        </>}
        <text x="80" y="85" fill="#4ead5b" fontSize="13" fontWeight="600" fontFamily="sans-serif">Aeroponik Modül</text>
        <g transform="translate(274, 70)">{dot(aero?.status)}</g>

        {/* Mini bitki gridi */}
        {(aero?.plants || []).map((p, i) => {
          const info = PLANTS[p.type];
          if (!info) return null;
          const age = Math.max(0, (state.time?.day || 0) - (p.plantedDay || 0));
          const gr = Math.min(1, age / (info.growthDays || 90));
          const col = i % 5;
          const row = Math.floor(i / 5);
          const cx = 85 + col * 52;
          const cy = 115 + row * 55;
          const fillH = 35 * gr;
          return (
            <g key={i}>
              {/* Bitki kutusu */}
              <rect x={cx - 20} y={cy - 18} width="40" height="50" rx="4"
                fill="#0f2a1a" stroke="#4ead5b30" strokeWidth="0.8" />
              {/* Büyüme barı (aşağıdan yukarı) */}
              <rect x={cx - 16} y={cy + 32 - fillH - 2} width="4" height={fillH} rx="2"
                fill={gr >= 1 ? '#4ead5b' : '#4a9caa'} opacity="0.8" />
              {/* İkon + isim */}
              <text x={cx} y={cy + 2} textAnchor="middle" fontSize="14">{info.icon}</text>
              <text x={cx} y={cy + 18} textAnchor="middle" fill="#94a3b8" fontSize="7" fontFamily="monospace">
                {info.name?.slice(0, 6)}
              </text>
              <text x={cx} y={cy + 28} textAnchor="middle" fill={gr >= 1 ? '#4ead5b' : '#4a9caa'} fontSize="8" fontWeight="600" fontFamily="monospace">
                %{(gr * 100).toFixed(0)}
              </text>
            </g>
          );
        })}

        {/* Ortam bilgisi */}
        <text x="80" y="240" fill="#94a3b8" fontSize="9" fontFamily="monospace">
          T: {aero?.temperature?.toFixed(1)}°C   H: %{aero?.humidity?.toFixed(0)}   PAR: {aero?.lightPAR?.toFixed(0)} umol
        </text>
      </g>

      {/* ---- ZONE: NFT Hidroponik ---- */}
      <g className="cursor-pointer" onClick={() => onSelect('nft')}>
        <rect x="60" y="280" width="280" height="200" rx="12"
          fill={selected === 'nft' ? '#4a9caa10' : '#0f172a'}
          stroke={selected === 'nft' ? '#4a9caa' : '#4a9caa40'}
          strokeWidth={selected === 'nft' ? 2.5 : 1.5}
        />
        {isLight && <>
          <rect x="70" y="285" width="260" height="3" rx="1" fill="#5b8def" opacity="0.4">
            <animate attributeName="opacity" values="0.2;0.6;0.2" dur="3s" repeatCount="indefinite" />
          </rect>
        </>}
        <text x="80" y="310" fill="#4a9caa" fontSize="13" fontWeight="600" fontFamily="sans-serif">NFT Hidroponik</text>
        <g transform="translate(274, 298)">{dot(nft?.status)}</g>

        {/* NFT kanalları + bitkiler */}
        {(nft?.plants || []).map((p, i) => {
          const info = PLANTS[p.type];
          if (!info) return null;
          const age = Math.max(0, (state.time?.day || 0) - (p.plantedDay || 0));
          const gr = Math.min(1, age / (info.growthDays || 30));
          const col = i % 6;
          const row = Math.floor(i / 6);
          const cx = 82 + col * 42;
          const cy = 340 + row * 55;
          return (
            <g key={i}>
              {/* Kanal */}
              <rect x={cx - 17} y={cy + 15} width="34" height="4" rx="2" fill="#1a4a5a" />
              <rect x={cx - 14} y={cy + 16} width="28" height="2" rx="1" fill="#4a9caa" opacity="0.3" />
              {/* Bitki */}
              <text x={cx} y={cy + 4} textAnchor="middle" fontSize="13">{info.icon}</text>
              <text x={cx} y={cy + 30} textAnchor="middle" fill={gr >= 1 ? '#4ead5b' : '#4a9caa'} fontSize="7" fontWeight="600" fontFamily="monospace">
                %{(gr * 100).toFixed(0)}
              </text>
            </g>
          );
        })}

        <text x="80" y="468" fill="#94a3b8" fontSize="9" fontFamily="monospace">
          T: {nft?.temperature?.toFixed(1)}°C   H: %{nft?.humidity?.toFixed(0)}   PAR: {nft?.lightPAR?.toFixed(0)} umol
        </text>
      </g>

      {/* ---- ZONE: Spirulina ---- */}
      <g className="cursor-pointer" onClick={() => onSelect('spirulina')}>
        <rect x="380" y="360" width="210" height="130" rx="12"
          fill={selected === 'spirulina' ? '#8b7fc710' : '#0f172a'}
          stroke={selected === 'spirulina' ? '#8b7fc7' : '#8b7fc740'}
          strokeWidth={selected === 'spirulina' ? 2.5 : 1.5}
        />
        <text x="400" y="390" fill="#8b7fc7" fontSize="13" fontWeight="600" fontFamily="sans-serif">Spirulina Reaktör</text>
        <g transform="translate(524, 378)">{dot(spir?.status)}</g>

        {/* Tank görseli */}
        {[0, 1, 2].map(i => (
          <g key={i}>
            <rect x={405 + i * 55} y={405} width="40" height="60" rx="8"
              fill="#1a2a4a" stroke="#8b7fc730" strokeWidth="1" />
            <rect x={409 + i * 55} y={410 + 60 - (spir?.density || 1) * 20} width="32"
              height={Math.min(50, (spir?.density || 1) * 20)} rx="6"
              fill="#4ead5b" opacity={0.3 + (spir?.density || 1) * 0.15}>
              <animate attributeName="opacity" values={`${0.2 + (spir?.density || 1) * 0.1};${0.4 + (spir?.density || 1) * 0.15};${0.2 + (spir?.density || 1) * 0.1}`} dur="4s" repeatCount="indefinite" />
            </rect>
          </g>
        ))}
        <text x="400" y="480" fill="#94a3b8" fontSize="9" fontFamily="monospace">
          {spir?.density?.toFixed(1)} g/L | O2: {spir?.o2Production?.toFixed(0)} L/gün
        </text>
      </g>

      {/* ---- ZONE: Mantar ---- */}
      <g className="cursor-pointer" onClick={() => onSelect('mushroom')}>
        <rect x="610" y="360" width="150" height="130" rx="12"
          fill={selected === 'mushroom' ? '#d4903a10' : '#0f172a'}
          stroke={selected === 'mushroom' ? '#d4903a' : '#d4903a40'}
          strokeWidth={selected === 'mushroom' ? 2.5 : 1.5}
        />
        <text x="625" y="390" fill="#d4903a" fontSize="12" fontWeight="600" fontFamily="sans-serif">Mantar</text>
        <g transform="translate(698, 378)">{dot(mush?.status)}</g>

        {/* Mantar görselleri -- basit kutular */}
        {[0, 1, 2, 3].map(i => (
          <g key={i}>
            <rect x={635 + (i % 2) * 50} y={410 + Math.floor(i / 2) * 30} width="16" height="16" rx="3"
              fill="#d4903a" opacity={0.3 + (mush?.substrateLevel || 50) / 200} />
          </g>
        ))}
        <text x="625" y="480" fill="#94a3b8" fontSize="9" fontFamily="monospace">
          {mush?.harvestRate?.toFixed(0)} g/gün | Sub: %{(mush?.substrateLevel || 0).toFixed(0)}
        </text>
      </g>

      {/* ---- ZONE: Habitat ---- */}
      <g className="cursor-pointer" onClick={() => onSelect('habitat')}>
        <rect x="380" y="55" width="380" height="270" rx="12"
          fill={selected === 'habitat' ? '#d4555510' : '#0f172a'}
          stroke={selected === 'habitat' ? '#d45555' : '#d4555540'}
          strokeWidth={selected === 'habitat' ? 2.5 : 1.5}
        />
        <text x="400" y="85" fill="#d45555" fontSize="13" fontWeight="600" fontFamily="sans-serif">Mürettebat Alanı</text>
        <g transform="translate(694, 70)">{dot(hab?.status)}</g>

        {/* İç mekan grid */}
        <g opacity="0.15">
          {Array.from({ length: 8 }, (_, i) => (
            <line key={`hg${i}`} x1="400" y1={100 + i * 28} x2="740" y2={100 + i * 28} stroke="#94a3b8" strokeWidth="0.5" />
          ))}
          {Array.from({ length: 10 }, (_, i) => (
            <line key={`vg${i}`} x1={400 + i * 38} y1="95" x2={400 + i * 38} y2="310" stroke="#94a3b8" strokeWidth="0.5" />
          ))}
        </g>

        {/* O2/CO2 gauge'lar */}
        <g transform="translate(410, 105)">
          <rect width="150" height="55" rx="6" fill="#0a0e1a" stroke="#4ead5b30" strokeWidth="1" />
          <text x="10" y="18" fill="#94a3b8" fontSize="9" fontFamily="monospace">O2 Seviyesi</text>
          <rect x="10" y="25" width="130" height="8" rx="3" fill="#1e293b" />
          <rect x="10" y="25" width={130 * (hab?.o2Level || 0) / 25} height="8" rx="3" fill="#4ead5b" opacity="0.8" />
          <text x="10" y="46" fill="#4ead5b" fontSize="11" fontWeight="600" fontFamily="monospace">%{hab?.o2Level?.toFixed(1)}</text>
        </g>

        <g transform="translate(575, 105)">
          <rect width="150" height="55" rx="6" fill="#0a0e1a" stroke="#d4903a30" strokeWidth="1" />
          <text x="10" y="18" fill="#94a3b8" fontSize="9" fontFamily="monospace">CO2 Seviyesi</text>
          <rect x="10" y="25" width="130" height="8" rx="3" fill="#1e293b" />
          <rect x="10" y="25" width={Math.min(130, 130 * (hab?.co2Level || 0) / 1)} height="8" rx="3"
            fill={(hab?.co2Level || 0) > 0.5 ? '#d45555' : '#d4903a'} opacity="0.8" />
          <text x="10" y="46" fill="#d4903a" fontSize="11" fontWeight="600" fontFamily="monospace">%{hab?.co2Level?.toFixed(2)}</text>
        </g>

        {/* Kaynak kutuları */}
        <g transform="translate(410, 175)">
          <rect width="100" height="45" rx="6" fill="#0a0e1a" stroke="#5b8def30" strokeWidth="1" />
          <text x="10" y="16" fill="#94a3b8" fontSize="8" fontFamily="monospace">Su</text>
          <text x="10" y="34" fill="#5b8def" fontSize="12" fontWeight="600" fontFamily="monospace">
            {formatNumber(state.resources?.water?.total || 0)} L
          </text>
        </g>
        <g transform="translate(520, 175)">
          <rect width="100" height="45" rx="6" fill="#0a0e1a" stroke="#d4903a30" strokeWidth="1" />
          <text x="10" y="16" fill="#94a3b8" fontSize="8" fontFamily="monospace">Kalori</text>
          <text x="10" y="34" fill="#d4903a" fontSize="12" fontWeight="600" fontFamily="monospace">
            {formatNumber(state.resources?.calories?.dailyProduction || 0)}
          </text>
        </g>
        <g transform="translate(630, 175)">
          <rect width="100" height="45" rx="6" fill="#0a0e1a" stroke="#d4555530" strokeWidth="1" />
          <text x="10" y="16" fill="#94a3b8" fontSize="8" fontFamily="monospace">Güç</text>
          <text x="10" y="34" fill={state.power?.powerDeficit ? '#d45555' : '#4ead5b'} fontSize="12" fontWeight="600" fontFamily="monospace">
            %{state.power?.utilizationPercent?.toFixed(0)}
          </text>
        </g>

        {/* Mürettebat ikonu row */}
        <g transform="translate(410, 238)">
          {Array.from({ length: hab?.crewCount || 6 }, (_, i) => (
            <g key={i} transform={`translate(${i * 42}, 0)`}>
              <circle cx="15" cy="12" r="10" fill="#1e293b" stroke="#d4555540" strokeWidth="1" />
              <text x="15" y="16" textAnchor="middle" fontSize="9" fill="#c5c6cc" fontFamily="monospace">C{i + 1}</text>
            </g>
          ))}
        </g>

        {/* Sıcaklık + nem */}
        <text x="620" y="300" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="end">
          T: {hab?.temperature?.toFixed(1)}°C   H: %{hab?.humidity?.toFixed(0)}
        </text>
      </g>

      {/* Lejant */}
      <g transform="translate(50, 505)">
        <text x="0" y="0" fill="#475569" fontSize="8" fontFamily="monospace">
          --- Akış: Su   Besin Çözeltisi   O2 Üretim   CO2 Emilim   Organik Atık ---
        </text>
      </g>
    </svg>
  );
}

/* =================================================================
   KAYNAK ÖZET BARI (ÜST)
   ================================================================= */

function ResourceSummary({ state }) {
  const { resources, power, degradation, mission, time } = state;
  const items = [
    { label: 'Gün', value: time?.day, icon: <FiClock />, color: '#4a9caa' },
    { label: 'O2 Üretim', value: `${formatNumber(resources?.oxygen?.production || 0)} L`, icon: <FiWind />, color: '#4ead5b' },
    { label: 'Kalori', value: `${formatNumber(resources?.calories?.dailyProduction || 0)} kcal`, icon: <FiActivity />, color: '#d4903a' },
    { label: 'Su', value: `${formatNumber(resources?.water?.total || 0)} L`, icon: <FiDroplet />, color: '#5b8def' },
    { label: 'Güç', value: `%${power?.utilizationPercent?.toFixed(0)}`, icon: <FiZap />, color: power?.powerDeficit ? '#d45555' : '#4ead5b' },
    { label: 'Bileşen Sağlık', value: `%${degradation?.averageHealth?.toFixed(0)}`, icon: <FiCheckCircle />, color: (degradation?.averageHealth || 100) > 70 ? '#4ead5b' : '#d4903a' },
  ];

  return (
    <div className="flex gap-2 flex-wrap">
      {items.map((it) => (
        <div key={it.label} className="bg-nexus-card border border-nexus-border rounded-lg px-3 py-1.5 flex items-center gap-2 min-w-0">
          <span style={{ color: it.color }}>{it.icon}</span>
          <div>
            <div className="text-[9px] text-nexus-text-dim uppercase">{it.label}</div>
            <div className="text-xs font-mono font-semibold" style={{ color: it.color }}>{it.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* =================================================================
   ANA BİLEŞEN
   ================================================================= */

export default function FarmViewPage() {
  const { state } = useGenesis();
  const [selectedZone, setSelectedZone] = useState('aeroponic');
  const modules = state.compartments?.growth?.modules;

  const zoneInfo = ZONES.find(z => z.id === selectedZone);

  return (
    <div className="h-full flex flex-col gap-3 p-1">
      {/* Üst kaynak özeti */}
      <ResourceSummary state={state} />

      {/* Ana içerik: Harita + Detay paneli */}
      <div className="flex-1 flex gap-3 min-h-0">
        {/* Sol: Tesis Haritası */}
        <div className="flex-1 bg-nexus-card rounded-lg border border-nexus-border overflow-hidden min-h-0 flex flex-col">
          <div className="flex-1 p-2 min-h-0 flex items-center justify-center">
            <FacilityMap
              selected={selectedZone}
              onSelect={setSelectedZone}
              modules={modules}
              state={state}
            />
          </div>
        </div>

        {/* Sağ: Seçili bölge detayı */}
        <div className="w-80 bg-nexus-card rounded-lg border border-nexus-border flex flex-col min-h-0 overflow-hidden"
          style={{ borderColor: `${zoneInfo?.borderColor}40` }}>
          {/* Başlık */}
          <div className="px-4 py-3 border-b border-nexus-border flex items-center gap-2"
            style={{ borderBottomColor: `${zoneInfo?.borderColor}30` }}>
            <span style={{ color: zoneInfo?.color }}>{zoneInfo?.icon}</span>
            <div>
              <h2 className="text-sm font-semibold" style={{ color: zoneInfo?.color }}>{zoneInfo?.label}</h2>
              <div className="flex items-center gap-1.5 text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: statusColor(modules?.[selectedZone]?.status || state.compartments?.habitat?.status) }} />
                <span className="text-nexus-text-dim uppercase tracking-wider">
                  {modules?.[selectedZone]?.status || state.compartments?.habitat?.status || 'nominal'}
                </span>
              </div>
            </div>
          </div>

          {/* Zone tab'ları */}
          <div className="flex border-b border-nexus-border overflow-x-auto px-2 gap-1 py-1.5">
            {ZONES.map(z => (
              <button
                key={z.id}
                onClick={() => setSelectedZone(z.id)}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] whitespace-nowrap transition-all ${
                  selectedZone === z.id
                    ? 'bg-nexus-bg text-nexus-text'
                    : 'text-nexus-text-dim hover:text-nexus-text hover:bg-nexus-bg/50'
                }`}
                style={selectedZone === z.id ? { boxShadow: `0 0 8px ${z.color}20`, borderColor: `${z.color}40` } : {}}
              >
                <span style={{ color: z.color }}>{z.icon}</span>
                <span>{z.label.split(' ')[0]}</span>
              </button>
            ))}
          </div>

          {/* Detay içerik */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
            {selectedZone === 'aeroponic' && (
              <AeroponicDetail mod={modules?.aeroponic} day={state.time?.day} ndvi={state.ndvi?.aeroponic} pathogens={state.pathogens?.aeroponic} />
            )}
            {selectedZone === 'nft' && (
              <NFTDetail mod={modules?.nft} day={state.time?.day} ndvi={state.ndvi?.nft} pathogens={state.pathogens?.nft} />
            )}
            {selectedZone === 'spirulina' && (
              <SpirulinaDetail mod={modules?.spirulina} />
            )}
            {selectedZone === 'mushroom' && (
              <MushroomDetail mod={modules?.mushroom} />
            )}
            {selectedZone === 'habitat' && (
              <HabitatDetail
                habitat={state.compartments?.habitat}
                crew={state.crewActivity}
                resources={state.resources}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
