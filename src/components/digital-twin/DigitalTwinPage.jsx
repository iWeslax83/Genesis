import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Float, MeshDistortMaterial } from '@react-three/drei';
import { useGenesis } from '../../context/GenesisContext';
import { COMPARTMENTS, SCENARIOS } from '../../simulation/constants';
import { formatNumber, formatPercent } from '../../utils/formatters';
import { FiBox, FiAlertTriangle, FiPlay, FiX, FiActivity, FiThermometer, FiDroplet, FiWind, FiZap } from 'react-icons/fi';
import * as THREE from 'three';

/* ---- 3D Components ---- */

function HabitatShell() {
  const meshRef = useRef();
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.02;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Main cylinder */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[2, 2, 8, 32, 1, true]} />
        <meshStandardMaterial color="#4a4a5a" metalness={0.85} roughness={0.2} side={THREE.DoubleSide} transparent opacity={0.2} />
      </mesh>
      {/* End caps */}
      <mesh position={[0, 0, -4]}>
        <sphereGeometry args={[2, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#4a4a5a" metalness={0.85} roughness={0.2} transparent opacity={0.15} />
      </mesh>
      <mesh position={[0, 0, 4]} rotation={[Math.PI, 0, 0]}>
        <sphereGeometry args={[2, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#4a4a5a" metalness={0.85} roughness={0.2} transparent opacity={0.15} />
      </mesh>
      {/* Structural rings */}
      {[-3, -1, 1, 3].map(z => (
        <mesh key={z} position={[0, 0, z]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2.05, 0.04, 8, 32]} />
          <meshStandardMaterial color="#6a6a7a" metalness={0.9} roughness={0.1} />
        </mesh>
      ))}
      {/* Solar panels */}
      <group position={[0, 2.5, 0]}>
        <mesh>
          <boxGeometry args={[6, 0.05, 1.5]} />
          <meshStandardMaterial color="#1a2a5a" metalness={0.6} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.03, 0]}>
          <boxGeometry args={[5.8, 0.02, 1.3]} />
          <meshStandardMaterial color="#2244aa" metalness={0.8} roughness={0.2} emissive="#1133aa" emissiveIntensity={0.1} />
        </mesh>
      </group>
    </group>
  );
}

function CompSection({ position, color, label, isWarning, emissiveIntensity = 0.08 }) {
  const meshRef = useRef();
  useFrame(() => {
    if (meshRef.current) {
      if (isWarning) {
        meshRef.current.material.emissiveIntensity = 0.3 + Math.sin(Date.now() * 0.005) * 0.2;
      } else {
        meshRef.current.material.emissiveIntensity = emissiveIntensity + Math.sin(Date.now() * 0.001) * 0.02;
      }
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <boxGeometry args={[3.5, 3.5, 1.8]} />
        <meshStandardMaterial color={color} transparent opacity={0.1} emissive={color} emissiveIntensity={emissiveIntensity} />
      </mesh>
      {/* Wireframe overlay */}
      <mesh>
        <boxGeometry args={[3.5, 3.5, 1.8]} />
        <meshBasicMaterial color={color} wireframe transparent opacity={0.08} />
      </mesh>
      <Html position={[0, 2.2, 0]} center distanceFactor={10}>
        <div className={`px-2 py-0.5 rounded text-[9px] whitespace-nowrap pointer-events-none ${
          isWarning ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-nexus-card/80 text-nexus-text-dim border border-nexus-border/50'
        } backdrop-blur-sm`}>
          {label}
        </div>
      </Html>
    </group>
  );
}

function PlantRow({ position, count = 6, color = '#22c55e' }) {
  return (
    <group position={position}>
      {Array.from({ length: count }).map((_, i) => (
        <Float key={i} speed={1.5 + Math.random()} floatIntensity={0.1} rotationIntensity={0.05}>
          <mesh position={[(i - count / 2) * 0.4, 0, (Math.random() - 0.5) * 0.3]}>
            <coneGeometry args={[0.08, 0.25 + Math.random() * 0.15, 4]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.15} />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

function Particles({ count = 80, color = '#00f0ff', radius = 3, speed = 0.5 }) {
  const ref = useRef();
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * radius * 2;
      pos[i * 3 + 1] = (Math.random() - 0.5) * radius * 2;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    return pos;
  }, [count, radius]);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 2] += delta * speed;
      if (pos[i * 3 + 2] > 4) pos[i * 3 + 2] = -4;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={count} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color={color} size={0.04} transparent opacity={0.5} sizeAttenuation />
    </points>
  );
}

function SpirulinaOrb() {
  const ref = useRef();
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <mesh ref={ref} position={[0, 0, -1]}>
      <sphereGeometry args={[0.4, 16, 16]} />
      <MeshDistortMaterial color="#00f0ff" emissive="#00f0ff" emissiveIntensity={0.3} distort={0.3} speed={2} transparent opacity={0.4} />
    </mesh>
  );
}

function MiniHabitat3D({ scenario }) {
  return (
    <Canvas camera={{ position: [6, 4, 6], fov: 45 }} style={{ background: '#060a12' }}>
      <color attach="background" args={['#060a12']} />
      <fog attach="fog" args={['#060a12', 10, 25]} />

      <ambientLight intensity={0.2} />
      <directionalLight position={[10, 10, 5]} intensity={0.7} color="#ffffff" />
      <pointLight position={[-5, 5, -5]} intensity={0.4} color="#00f0ff" distance={15} />
      <pointLight position={[5, -3, 3]} intensity={0.2} color="#22c55e" distance={10} />

      <HabitatShell />

      {/* Compartment sections */}
      <CompSection position={[0, 0, -3]} color="#ff8800" label="♻ Atik Isleme" isWarning={false} />
      <CompSection position={[0, 0, -1]} color="#c084fc" label="🧪 Besin Cozeltisi" isWarning={false} />
      <CompSection position={[0, 0, 1]} color="#22c55e" label="🌱 Bitki Modulu" isWarning={scenario?.active === 'led_failure'} emissiveIntensity={0.12} />
      <CompSection position={[0, 0, 3]} color="#3b82f6" label="👨‍🚀 Habitat" isWarning={false} />

      {/* Plants */}
      <PlantRow position={[0, -1.2, 0.8]} count={8} color="#22c55e" />
      <PlantRow position={[0, -1.2, 1.2]} count={6} color="#34d399" />

      {/* Spirulina */}
      <SpirulinaOrb />

      {/* Particles */}
      <Particles count={40} color="#34d399" radius={1.8} speed={0.3} />
      <Particles count={25} color="#3b82f6" radius={1.5} speed={0.2} />
      <Particles count={150} color="#ffffff" radius={15} speed={0.05} />

      {/* Ground reference */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#0a0e1a" transparent opacity={0.3} />
      </mesh>

      <OrbitControls
        enablePan={false}
        enableZoom={true}
        enableRotate={true}
        minDistance={4}
        maxDistance={18}
        autoRotate
        autoRotateSpeed={0.4}
        maxPolarAngle={Math.PI / 1.8}
      />
    </Canvas>
  );
}

/* ---- System Schematic (SVG) ---- */

function SystemSchematic({ state }) {
  const { compartments, resources, power, thermal, degradation, waterProcessing } = state;
  const aero = compartments.growth?.modules?.aeroponic;
  const nft = compartments.growth?.modules?.nft;
  const spir = compartments.growth?.modules?.spirulina;
  const hab = compartments.habitat;

  const statusDot = (status) => {
    const c = status === 'nominal' ? '#22c55e' : status === 'warning' ? '#f59e0b' : '#ef4444';
    return <circle r="3.5" fill={c}><animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" /></circle>;
  };

  return (
    <svg viewBox="0 0 680 400" className="w-full h-full">
      <defs>
        <pattern id="dt-grid" width="16" height="16" patternUnits="userSpaceOnUse">
          <path d="M 16 0 L 0 0 0 16" fill="none" stroke="#1e293b" strokeWidth="0.3" />
        </pattern>
        <radialGradient id="dt-glow" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.03" />
          <stop offset="100%" stopColor="#00f0ff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="680" height="400" fill="url(#dt-grid)" />
      <ellipse cx="340" cy="200" rx="250" ry="150" fill="url(#dt-glow)" />

      {/* Title */}
      <text x="340" y="16" textAnchor="middle" fill="#475569" fontSize="8" fontFamily="monospace" letterSpacing="2">
        GENESIS DIJITAL IKIZ — SISTEM MIMARISI
      </text>

      {/* Atmosphere System */}
      <g>
        <rect x="230" y="25" width="220" height="55" rx="8" fill="#0f172a" stroke="#22c55e40" strokeWidth="1" />
        <text x="250" y="42" fill="#22c55e" fontSize="10" fontWeight="bold">🌬 Atmosfer Kontrol</text>
        <text x="250" y="56" fill="#94a3b8" fontSize="8" fontFamily="monospace">
          O2: %{hab?.o2Level?.toFixed(1)} | CO2: %{hab?.co2Level?.toFixed(3)} | {hab?.temperature?.toFixed(1)}°C
        </text>
        <text x="250" y="68" fill="#94a3b8" fontSize="7" fontFamily="monospace">
          O2 Uretim: {formatNumber(resources.oxygen.production)} L/gun | Denge: {resources.oxygen.balance > 0 ? '+' : ''}{formatNumber(resources.oxygen.balance)} L
        </text>
        <g transform="translate(428, 38)">{statusDot(hab?.status)}</g>
      </g>

      {/* Growing modules */}
      <g>
        <rect x="20" y="95" width="200" height="130" rx="8" fill="#0f172a" stroke="#22c55e40" strokeWidth="1" />
        <text x="35" y="115" fill="#22c55e" fontSize="10" fontWeight="bold">🌱 Bitki Yetistirme</text>
        <g transform="translate(200, 107)">{statusDot(compartments.growth?.status)}</g>

        <rect x="30" y="122" width="90" height="35" rx="4" fill="#0a1a0a" stroke="#22c55e25" strokeWidth="0.7" />
        <text x="38" y="136" fill="#22c55e" fontSize="7" fontWeight="bold">Aeroponik</text>
        <text x="38" y="148" fill="#94a3b8" fontSize="6.5" fontFamily="monospace">{aero?.temperature?.toFixed(1)}°C | pH {aero?.pH?.toFixed(1)}</text>

        <rect x="125" y="122" width="90" height="35" rx="4" fill="#0a1520" stroke="#06b6d425" strokeWidth="0.7" />
        <text x="133" y="136" fill="#06b6d4" fontSize="7" fontWeight="bold">NFT Hidroponik</text>
        <text x="133" y="148" fill="#94a3b8" fontSize="6.5" fontFamily="monospace">{nft?.temperature?.toFixed(1)}°C | pH {nft?.pH?.toFixed(1)}</text>

        <rect x="30" y="162" width="90" height="35" rx="4" fill="#0f0a1a" stroke="#8b5cf625" strokeWidth="0.7" />
        <text x="38" y="176" fill="#8b5cf6" fontSize="7" fontWeight="bold">Spirulina</text>
        <text x="38" y="188" fill="#94a3b8" fontSize="6.5" fontFamily="monospace">{spir?.density?.toFixed(1)} g/L | O2: {spir?.o2Production?.toFixed(0)}</text>

        <rect x="125" y="162" width="90" height="35" rx="4" fill="#1a150a" stroke="#f59e0b25" strokeWidth="0.7" />
        <text x="133" y="176" fill="#f59e0b" fontSize="7" fontWeight="bold">Mantar</text>
        <text x="133" y="188" fill="#94a3b8" fontSize="6.5" fontFamily="monospace">Sub: %{(compartments.growth?.modules?.mushroom?.substrateLevel || 0).toFixed(0)}</text>

        <text x="35" y="215" fill="#94a3b8" fontSize="7" fontFamily="monospace">
          Kalori: {formatNumber(resources.calories.dailyProduction)} / {formatNumber(resources.calories.dailyTarget)} kcal
        </text>
      </g>

      {/* Power System */}
      <g>
        <rect x="460" y="95" width="200" height="70" rx="8" fill="#0f172a" stroke="#00f0ff40" strokeWidth="1" />
        <text x="475" y="115" fill="#00f0ff" fontSize="10" fontWeight="bold">⚡ Guc Sistemi</text>
        <text x="475" y="130" fill="#94a3b8" fontSize="8" fontFamily="monospace">
          Uretim: {(power?.generation || 0).toFixed(1)} kW | Tuketim: {(power?.totalConsumption || 0).toFixed(1)} kW
        </text>
        <text x="475" y="143" fill="#94a3b8" fontSize="7" fontFamily="monospace">
          Kullanim: %{(power?.utilizationPercent || 0).toFixed(0)} | {power?.sourceType === 'nuclear' ? '☢ Nukleer' : '☀ Gunes'}
        </text>
        {power?.powerDeficit && (
          <text x="475" y="155" fill="#ef4444" fontSize="7" fontWeight="bold">!! GUC YETERSIZLIGI</text>
        )}
        <g transform="translate(638, 107)">{statusDot(power?.powerDeficit ? 'critical' : 'nominal')}</g>
      </g>

      {/* Thermal */}
      <g>
        <rect x="460" y="175" width="200" height="55" rx="8" fill="#0f172a" stroke="#f59e0b40" strokeWidth="1" />
        <text x="475" y="195" fill="#f59e0b" fontSize="10" fontWeight="bold">🌡 Isil Kontrol</text>
        <text x="475" y="210" fill="#94a3b8" fontSize="8" fontFamily="monospace">
          Kabin: {(thermal?.currentTemp || 22).toFixed(1)}°C | Net: {(thermal?.netHeatFlux || 0).toFixed(2)} kW
        </text>
        <text x="475" y="222" fill="#94a3b8" fontSize="7" fontFamily="monospace">
          Radyator: %{(thermal?.heatRejection?.utilizationPercent || 0).toFixed(0)} kapasite
        </text>
        <g transform="translate(638, 187)">{statusDot(thermal?.thermalStatus || 'nominal')}</g>
      </g>

      {/* Water Processing */}
      <g>
        <rect x="230" y="245" width="220" height="55" rx="8" fill="#0f172a" stroke="#3b82f640" strokeWidth="1" />
        <text x="250" y="265" fill="#3b82f6" fontSize="10" fontWeight="bold">💧 Su Isleme</text>
        <text x="250" y="280" fill="#94a3b8" fontSize="8" fontFamily="monospace">
          Geri Kaz: {formatPercent((waterProcessing?.overallRecovery || 0.987) * 100)} | Kayip: {waterProcessing?.dailyLoss || 0.4} L/gun
        </text>
        <text x="250" y="292" fill="#94a3b8" fontSize="7" fontFamily="monospace">
          Kalite: {waterProcessing?.waterQuality === 'potable' ? '✓ Icilebilir' : '⚠ Dikkat'} | TOC: {waterProcessing?.tocLevel || 0} mg/L
        </text>
        <g transform="translate(428, 258)">{statusDot(waterProcessing?.status || 'nominal')}</g>
      </g>

      {/* Degradation */}
      <g>
        <rect x="20" y="245" width="200" height="55" rx="8" fill="#0f172a" stroke="#f59e0b40" strokeWidth="1" />
        <text x="35" y="265" fill="#f59e0b" fontSize="10" fontWeight="bold">🔧 Bilesen Sagligi</text>
        <text x="35" y="280" fill="#94a3b8" fontSize="8" fontFamily="monospace">
          Ortalama: {formatPercent(degradation?.averageHealth || 100)}
        </text>
        {Object.entries(degradation?.components || {}).slice(0, 3).map(([key, comp], i) => (
          <g key={key} transform={`translate(35, ${286 + i * 4})`}>
            <rect width={160 * (comp.health / 100)} height="3" rx="1" fill={comp.health > 60 ? '#22c55e' : comp.health > 30 ? '#f59e0b' : '#ef4444'} opacity="0.7" />
          </g>
        ))}
      </g>

      {/* Crew */}
      <g>
        <rect x="460" y="245" width="200" height="55" rx="8" fill="#0f172a" stroke="#ef444440" strokeWidth="1" />
        <text x="475" y="265" fill="#ef4444" fontSize="10" fontWeight="bold">👨‍🚀 Murettebat</text>
        <text x="475" y="280" fill="#94a3b8" fontSize="8" fontFamily="monospace">
          {hab?.crewCount || 6} kisi | Moral: {state.morale?.score?.toFixed(0) || 72}/100
        </text>
        <text x="475" y="292" fill="#94a3b8" fontSize="7" fontFamily="monospace">
          Su: {formatNumber(hab?.waterReserve || 0)} L | Nem: %{hab?.humidity?.toFixed(0)}
        </text>
      </g>

      {/* Flow arrows */}
      <line x1="170" y1="95" x2="230" y2="60" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.5">
        <animate attributeName="stroke-dashoffset" from="8" to="0" dur="2s" repeatCount="indefinite" />
      </line>
      <text x="195" y="72" fill="#22c55e" fontSize="6" textAnchor="middle">O2↑</text>

      <line x1="240" y1="80" x2="190" y2="100" stroke="#f97316" strokeWidth="1" strokeDasharray="3 5" opacity="0.4">
        <animate attributeName="stroke-dashoffset" from="8" to="0" dur="3s" repeatCount="indefinite" />
      </line>

      <line x1="290" y1="245" x2="200" y2="225" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.5">
        <animate attributeName="stroke-dashoffset" from="8" to="0" dur="2.5s" repeatCount="indefinite" />
      </line>
      <text x="240" y="232" fill="#3b82f6" fontSize="6" textAnchor="middle">H2O</text>

      <line x1="460" y1="130" x2="340" y2="55" stroke="#00f0ff" strokeWidth="1" strokeDasharray="3 6" opacity="0.3">
        <animate attributeName="stroke-dashoffset" from="9" to="0" dur="4s" repeatCount="indefinite" />
      </line>

      {/* Mission info */}
      <g transform="translate(240, 320)">
        <rect width="200" height="30" rx="6" fill="#0a0e1a" stroke="#a855f730" strokeWidth="0.7" />
        <text x="10" y="14" fill="#a855f7" fontSize="8" fontWeight="bold">🚀 Gorev</text>
        <text x="60" y="14" fill="#94a3b8" fontSize="7" fontFamily="monospace">
          Gun {state.time.day}/{state.mission?.totalMissionDays || 980} | %{(state.mission?.missionProgress || 0).toFixed(1)}
        </text>
        <rect x="10" y="19" width="180" height="3" rx="1" fill="#1e293b" />
        <rect x="10" y="19" width={180 * (state.mission?.missionProgress || 0) / 100} height="3" rx="1" fill="#a855f7" opacity="0.7" />
      </g>

      {/* Radiation indicator */}
      {state.radiation?.activeEvent && (
        <g transform="translate(460, 320)">
          <rect width="200" height="30" rx="6" fill="#ef444415" stroke="#ef444440" strokeWidth="1" />
          <text x="10" y="20" fill="#ef4444" fontSize="9" fontWeight="bold">
            ☢ SPE AKTIF — {state.radiation.activeEvent.dose.toFixed(3)} Gy
          </text>
        </g>
      )}
    </svg>
  );
}

/* ---- Scenario Panel ---- */

function ScenarioPanel() {
  const { state, dispatch } = useGenesis();

  return (
    <div className="bg-nexus-card rounded-xl border border-nexus-border p-3">
      <h3 className="text-xs text-nexus-text-dim uppercase tracking-wider mb-2">What-If Senaryolar</h3>
      <div className="space-y-1">
        {SCENARIOS.map((s) => {
          const isActive = state.scenario.active === s.id;
          const remaining = isActive ? s.duration - (state.time.day - state.scenario.startDay) : 0;
          return (
            <button
              key={s.id}
              onClick={() => {
                if (isActive) {
                  dispatch({ type: 'DEACTIVATE_SCENARIO' });
                } else {
                  dispatch({ type: 'ACTIVATE_SCENARIO', payload: s });
                }
              }}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-all ${
                isActive
                  ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                  : 'bg-nexus-bg text-nexus-text-dim hover:bg-nexus-card-hover hover:text-nexus-text'
              }`}
            >
              <span>{s.icon}</span>
              <span className="truncate flex-1 text-left">{s.name}</span>
              {isActive ? (
                <span className="flex items-center gap-1 text-[10px]">
                  <FiX size={10} /> {remaining}g
                </span>
              ) : (
                <FiPlay size={10} className="opacity-40" />
              )}
            </button>
          );
        })}
      </div>
      {state.scenario.active && (
        <div className="mt-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-[10px] text-red-400">
          ⚠ Senaryo etkisi simulasyonda aktif
        </div>
      )}
    </div>
  );
}

/* ---- Main Page ---- */

export default function DigitalTwinPage() {
  const { state } = useGenesis();
  const [view, setView] = useState('schematic');

  return (
    <div className="h-full flex flex-col gap-3 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <FiBox className="text-blue-400" size={18} />
          </div>
          <div>
            <h2 className="text-base font-bold text-nexus-text">Dijital Ikiz</h2>
            <p className="text-[10px] text-nexus-text-dim">Canli sistem durumu, 3D goruntuleme ve senaryo simulasyonu</p>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-nexus-bg rounded-lg p-0.5">
          <button
            onClick={() => setView('schematic')}
            className={`px-3 py-1 rounded text-xs transition-all ${view === 'schematic' ? 'bg-nexus-accent text-nexus-bg font-bold' : 'text-nexus-text-dim'}`}
          >
            Sematik
          </button>
          <button
            onClick={() => setView('3d')}
            className={`px-3 py-1 rounded text-xs transition-all ${view === '3d' ? 'bg-nexus-accent text-nexus-bg font-bold' : 'text-nexus-text-dim'}`}
          >
            3D Model
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex gap-3 min-h-0">
        {/* Main view area */}
        <div className="flex-1 bg-nexus-card rounded-xl border border-nexus-border overflow-hidden">
          {view === 'schematic' ? (
            <div className="h-full p-2 flex items-center justify-center">
              <SystemSchematic state={state} />
            </div>
          ) : (
            <MiniHabitat3D scenario={state.scenario} />
          )}
        </div>

        {/* Right panel */}
        <div className="w-64 space-y-3 overflow-y-auto">
          <ScenarioPanel />

          {/* Quick stats */}
          <div className="bg-nexus-card rounded-xl border border-nexus-border p-3 space-y-2">
            <h3 className="text-xs text-nexus-text-dim uppercase tracking-wider">Canli Durum</h3>
            <QuickStat icon={<FiActivity size={11} />} label="Sistem" value={`${state.resources?.healthScore ?? 94}/100`} color={state.resources?.healthScore > 80 ? '#22c55e' : '#f59e0b'} />
            <QuickStat icon={<FiThermometer size={11} />} label="Sicaklik" value={`${(state.compartments?.habitat?.temperature || 22).toFixed(1)}°C`} color="#f59e0b" />
            <QuickStat icon={<FiWind size={11} />} label="O2" value={`%${(state.compartments?.habitat?.o2Level || 21).toFixed(1)}`} color="#22c55e" />
            <QuickStat icon={<FiDroplet size={11} />} label="Su" value={`${formatNumber(state.resources?.water?.total || 0)} L`} color="#3b82f6" />
            <QuickStat icon={<FiZap size={11} />} label="Guc" value={`%${(state.power?.utilizationPercent || 0).toFixed(0)}`} color="#00f0ff" />
          </div>

          {/* Compartment statuses */}
          <div className="bg-nexus-card rounded-xl border border-nexus-border p-3 space-y-1.5">
            <h3 className="text-xs text-nexus-text-dim uppercase tracking-wider mb-1">Kompartmanlar</h3>
            {['waste', 'nutrient', 'growth', 'habitat'].map(id => {
              const comp = COMPARTMENTS[id];
              const data = id === 'growth' ? state.compartments.growth : state.compartments[id];
              const status = data?.status || 'nominal';
              const sColor = status === 'nominal' ? '#22c55e' : status === 'warning' ? '#f59e0b' : '#ef4444';
              return (
                <div key={id} className="flex items-center justify-between text-xs">
                  <span className="text-nexus-text-dim">{comp.icon} {comp.shortName}</span>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: sColor }} />
                    <span style={{ color: sColor }} className="text-[10px] font-mono">{status}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Radiation status */}
          <div className="bg-nexus-card rounded-xl border border-nexus-border p-3">
            <h3 className="text-xs text-nexus-text-dim uppercase tracking-wider mb-2">Radyasyon</h3>
            <div className="flex justify-between text-xs">
              <span className="text-nexus-text-dim">Kumulatif Doz</span>
              <span className="font-mono text-nexus-text">{(state.radiation?.cumulativeDose || 0).toFixed(4)} Gy</span>
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span className="text-nexus-text-dim">Gunluk Doz</span>
              <span className="font-mono text-nexus-text">{(state.radiation?.dailyDose || 0).toFixed(4)} Gy</span>
            </div>
            {state.radiation?.activeEvent && (
              <div className="mt-2 p-1.5 rounded bg-red-500/10 border border-red-500/20 text-[10px] text-red-400 animate-blink">
                ☢ SPE Olayi Aktif
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scenario active banner */}
      {state.scenario.active && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-2 flex items-center gap-2">
          <span className="animate-blink text-red-400"><FiAlertTriangle size={14} /></span>
          <span className="text-xs text-red-400 font-medium">
            Senaryo Aktif: {SCENARIOS.find(s => s.id === state.scenario.active)?.name}
          </span>
          <span className="text-[10px] text-red-400/70 ml-auto font-mono">
            {SCENARIOS.find(s => s.id === state.scenario.active)?.duration - (state.time.day - state.scenario.startDay)} gun kaldi
          </span>
        </div>
      )}
    </div>
  );
}

function QuickStat({ icon, label, value, color }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5 text-nexus-text-dim text-xs">
        {icon} {label}
      </div>
      <span className="text-xs font-mono font-bold" style={{ color }}>{value}</span>
    </div>
  );
}
