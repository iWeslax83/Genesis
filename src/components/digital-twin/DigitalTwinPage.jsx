import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Float, MeshDistortMaterial } from '@react-three/drei';
import { useGenesis } from '../../context/GenesisContext';
import { COMPARTMENTS, SCENARIOS } from '../../simulation/constants';
import { formatNumber, formatPercent } from '../../utils/formatters';
import { FiBox, FiAlertTriangle, FiPlay, FiX, FiActivity, FiThermometer, FiDroplet, FiWind, FiZap, FiRefreshCw, FiCpu, FiSun, FiTool, FiUsers, FiNavigation, FiRadio, FiMap } from 'react-icons/fi';
import * as THREE from 'three';

const FarmViewPage = React.lazy(() => import('../farm-view/FarmViewPage'));

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
        }`}>
          {label}
        </div>
      </Html>
    </group>
  );
}

function PlantRow({ position, count = 6, color = '#22c55e', growthProgress = 0.7 }) {
  const scale = 0.3 + growthProgress * 0.7;
  const healthColor = growthProgress > 0.6 ? color : growthProgress > 0.3 ? '#f59e0b' : '#ef4444';
  return (
    <group position={position}>
      {Array.from({ length: count }).map((_, i) => (
        <Float key={i} speed={1.5 + (i * 0.3 % 1.5)} floatIntensity={0.1} rotationIntensity={0.05}>
          <mesh position={[(i - count / 2) * 0.4, 0, (i % 3 - 1) * 0.15]} scale={[1, scale, 1]}>
            <coneGeometry args={[0.08, 0.25 + (i % 4) * 0.05, 4]} />
            <meshStandardMaterial color={healthColor} emissive={healthColor} emissiveIntensity={0.15} />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

function Particles({ count = 80, color = '#5b8def', radius = 3, speed = 0.5 }) {
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
      <MeshDistortMaterial color="#5b8def" emissive="#5b8def" emissiveIntensity={0.3} distort={0.3} speed={2} transparent opacity={0.4} />
    </mesh>
  );
}

/* ========================================================
   DETAYLI DİKEY TARIM 3D SAHNESİ
   Aeroponik kuleler, NFT rafları, Spirulina biyoreaktör,
   Mantar kabineti, LED paneller, boru hatları
   ======================================================== */

function AeroponicTower({ position, growthProgress = 0.7, plantType = 'potato' }) {
  const groupRef = useRef();
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.05;
    }
  });

  const plantColor = plantType === 'wheat' ? '#a3e635' : plantType === 'soybean' ? '#4ade80' : '#22c55e';
  const plantScale = 0.3 + growthProgress * 0.7;
  const slotCount = 6;

  return (
    <group position={position}>
      <mesh>
        <cylinderGeometry args={[0.12, 0.12, 2.0, 16]} />
        <meshStandardMaterial color="#2a2a3a" metalness={0.7} roughness={0.3} />
      </mesh>

      <mesh position={[0, 1.0, 0]}>
        <cylinderGeometry args={[0.15, 0.12, 0.05, 16]} />
        <meshStandardMaterial color="#3a3a4a" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, -1.0, 0]}>
        <cylinderGeometry args={[0.12, 0.15, 0.05, 16]} />
        <meshStandardMaterial color="#3a3a4a" metalness={0.8} roughness={0.2} />
      </mesh>

      <mesh>
        <cylinderGeometry args={[0.03, 0.03, 2.1, 8]} />
        <meshStandardMaterial color="#3b82f6" transparent opacity={0.4} emissive="#3b82f6" emissiveIntensity={0.1} />
      </mesh>

      <group ref={groupRef}>
        {Array.from({ length: slotCount }).map((_, i) => {
          const angle = (i / slotCount) * Math.PI * 2 + (i * 0.5);
          const y = -0.8 + (i / (slotCount - 1)) * 1.6;
          const x = Math.cos(angle) * 0.18;
          const z = Math.sin(angle) * 0.18;
          const slotGrowth = Math.max(0, growthProgress - (i * 0.05));
          return (
            <group key={i} position={[x, y, z]}>
              <mesh rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.025, 0.025, 0.04, 6]} />
                <meshStandardMaterial color="#4a4a5a" metalness={0.6} />
              </mesh>
              {slotGrowth > 0.1 && (
                <Float speed={1.2} floatIntensity={0.03}>
                  <mesh position={[Math.cos(angle) * 0.08, 0, Math.sin(angle) * 0.08]} scale={[1, plantScale * (0.6 + i * 0.06), 1]}>
                    <coneGeometry args={[0.035 + slotGrowth * 0.02, 0.12 + slotGrowth * 0.08, 5]} />
                    <meshStandardMaterial color={plantColor} emissive={plantColor} emissiveIntensity={0.12} />
                  </mesh>
                </Float>
              )}
            </group>
          );
        })}
      </group>

      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.09, 0.008, 8, 16]} />
        <meshStandardMaterial color="#60a5fa" emissive="#3b82f6" emissiveIntensity={0.2} transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

function NFTRack({ position, tiers = 5, growthProgress = 0.7 }) {
  const rackWidth = 1.6;
  const rackDepth = 0.4;
  const tierHeight = 0.35;
  const totalHeight = tiers * tierHeight;

  return (
    <group position={position}>
      {[[-rackWidth/2, -rackDepth/2], [rackWidth/2, -rackDepth/2], [-rackWidth/2, rackDepth/2], [rackWidth/2, rackDepth/2]].map(([x, z], i) => (
        <mesh key={i} position={[x, totalHeight / 2 - 0.2, z]}>
          <boxGeometry args={[0.02, totalHeight + 0.2, 0.02]} />
          <meshStandardMaterial color="#4a4a5a" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}

      {Array.from({ length: tiers }).map((_, tier) => {
        const y = tier * tierHeight;
        const tierGrowth = Math.max(0.1, growthProgress - tier * 0.08);
        const leafColors = ['#22c55e', '#34d399', '#4ade80', '#86efac', '#a3e635'];
        const lColor = leafColors[tier % leafColors.length];

        return (
          <group key={tier} position={[0, y, 0]}>
            <mesh>
              <boxGeometry args={[rackWidth, 0.015, rackDepth]} />
              <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.4} />
            </mesh>

            <mesh position={[0, 0.01, 0]}>
              <boxGeometry args={[rackWidth - 0.05, 0.005, 0.08]} />
              <meshStandardMaterial color="#2563eb" transparent opacity={0.35} emissive="#3b82f6" emissiveIntensity={0.15} />
            </mesh>

            {tier < tiers - 1 && (
              <mesh position={[0, tierHeight - 0.02, 0]}>
                <boxGeometry args={[rackWidth - 0.06, 0.008, rackDepth - 0.06]} />
                <meshStandardMaterial color="#1a1a2e" emissive="#a855f7" emissiveIntensity={0.15} />
              </mesh>
            )}

            {Array.from({ length: 8 }).map((_, pi) => {
              const px = -rackWidth / 2 + 0.15 + pi * (rackWidth - 0.3) / 7;
              const h = 0.04 + tierGrowth * 0.12;
              return (
                <Float key={pi} speed={1.0 + pi * 0.1} floatIntensity={0.02}>
                  <mesh position={[px, h / 2 + 0.015, 0]}>
                    <coneGeometry args={[0.025 + tierGrowth * 0.015, h, 4]} />
                    <meshStandardMaterial color={lColor} emissive={lColor} emissiveIntensity={0.1} />
                  </mesh>
                </Float>
              );
            })}
          </group>
        );
      })}
    </group>
  );
}

function SpirulinaBioreactor({ position }) {
  const ref = useRef();
  useFrame((state) => {
    if (ref.current) {
      ref.current.children.forEach((child, i) => {
        if (child.material?.emissiveIntensity !== undefined) {
          child.material.emissiveIntensity = 0.15 + Math.sin(state.clock.elapsedTime * 2 + i * 0.5) * 0.08;
        }
      });
    }
  });

  const tubeRadius = 0.025;
  const coils = 8;
  const coilRadius = 0.3;
  const height = 1.8;

  return (
    <group position={position} ref={ref}>
      <mesh>
        <cylinderGeometry args={[0.45, 0.45, height, 24, 1, true]} />
        <meshStandardMaterial color="#0f172a" transparent opacity={0.08} side={THREE.DoubleSide} />
      </mesh>

      {Array.from({ length: coils }).map((_, i) => {
        const y = -height / 2 + 0.15 + (i / (coils - 1)) * (height - 0.3);
        return (
          <mesh key={i} position={[0, y, 0]} rotation={[Math.PI / 2, 0, i * 0.4]}>
            <torusGeometry args={[coilRadius, tubeRadius, 8, 32]} />
            <meshStandardMaterial
              color="#06b6d4"
              emissive="#4a9caa"
              emissiveIntensity={0.15}
              transparent
              opacity={0.55}
            />
          </mesh>
        );
      })}

      {[-0.28, 0.28].map((x, i) => (
        <mesh key={`v${i}`} position={[x, 0, 0]}>
          <cylinderGeometry args={[tubeRadius, tubeRadius, height - 0.1, 8]} />
          <meshStandardMaterial color="#0891b2" transparent opacity={0.4} />
        </mesh>
      ))}

      <mesh position={[0, -height / 2 - 0.08, 0]}>
        <boxGeometry args={[0.35, 0.12, 0.25]} />
        <meshStandardMaterial color="#1e293b" metalness={0.6} roughness={0.3} />
      </mesh>

      <pointLight position={[0, 0, 0]} intensity={0.3} color="#4a9caa" distance={1.5} />

      <Html position={[0, height / 2 + 0.2, 0]} center distanceFactor={8}>
        <div className="px-1.5 py-0.5 rounded text-[8px] whitespace-nowrap pointer-events-none bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
          Spirulina &mdash; 10 m²
        </div>
      </Html>
    </group>
  );
}

function MushroomCabinet({ position }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[0.6, 0.8, 0.5]} />
        <meshStandardMaterial color="#1a1520" metalness={0.5} roughness={0.6} />
      </mesh>

      <mesh position={[0, 0, 0.251]}>
        <boxGeometry args={[0.55, 0.75, 0.01]} />
        <meshStandardMaterial color="#2a2535" metalness={0.4} roughness={0.5} />
      </mesh>

      <mesh position={[0, -0.35, 0.26]}>
        <boxGeometry args={[0.4, 0.03, 0.01]} />
        <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.3} />
      </mesh>

      {[-0.2, 0.05, 0.3].map((y, i) => (
        <group key={i}>
          <mesh position={[0, y, 0]}>
            <boxGeometry args={[0.52, 0.01, 0.42]} />
            <meshStandardMaterial color="#2a2a3a" />
          </mesh>
          {Array.from({ length: 3 }).map((_, mi) => (
            <mesh key={mi} position={[-0.15 + mi * 0.15, y + 0.04 + mi * 0.01, 0]}>
              <sphereGeometry args={[0.025 + mi * 0.005, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshStandardMaterial color="#d4a574" emissive="#c9956b" emissiveIntensity={0.05} />
            </mesh>
          ))}
        </group>
      ))}

      <Html position={[0, 0.55, 0]} center distanceFactor={8}>
        <div className="px-1.5 py-0.5 rounded text-[8px] whitespace-nowrap pointer-events-none bg-amber-500/15 text-amber-400 border border-amber-500/30">
          Mantar &mdash; 2 m³
        </div>
      </Html>
    </group>
  );
}

function WaterPipes({ from, to, color = '#3b82f6' }) {
  const midY = (from[1] + to[1]) / 2 + 0.3;
  return (
    <group>
      <mesh position={[from[0], (from[1] + midY) / 2, from[2]]}>
        <cylinderGeometry args={[0.01, 0.01, midY - from[1], 6]} />
        <meshStandardMaterial color={color} transparent opacity={0.3} emissive={color} emissiveIntensity={0.1} />
      </mesh>
      <mesh position={[(from[0] + to[0]) / 2, midY, (from[2] + to[2]) / 2]}
        rotation={[0, Math.atan2(to[2] - from[2], to[0] - from[0]), Math.PI / 2]}>
        <cylinderGeometry args={[0.01, 0.01, Math.sqrt((to[0]-from[0])**2 + (to[2]-from[2])**2), 6]} />
        <meshStandardMaterial color={color} transparent opacity={0.3} emissive={color} emissiveIntensity={0.1} />
      </mesh>
    </group>
  );
}

function FloorGrid() {
  return (
    <group position={[0, -1.2, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 8]} />
        <meshStandardMaterial color="#080c16" transparent opacity={0.6} />
      </mesh>
      <gridHelper args={[12, 24, '#1e293b', '#111827']} />
    </group>
  );
}

function VerticalFarm3D({ simState }) {
  const aeroGrowth = simState?.ndvi?.aeroponic?.average || 0.7;
  const nftGrowth = simState?.ndvi?.nft?.average || 0.75;

  return (
    <Canvas camera={{ position: [5, 3.5, 7], fov: 42 }} style={{ background: '#060a12' }}>
      <color attach="background" args={['#060a12']} />
      <fog attach="fog" args={['#060a12', 15, 35]} />

      <ambientLight intensity={0.15} />
      <directionalLight position={[8, 10, 5]} intensity={0.6} color="#ffffff" castShadow />
      <pointLight position={[-3, 4, 0]} intensity={0.4} color="#a855f7" distance={12} />
      <pointLight position={[3, 2, -2]} intensity={0.3} color="#22c55e" distance={10} />
      <pointLight position={[0, 1, 4]} intensity={0.25} color="#4a9caa" distance={8} />

      <group position={[-3, -0.2, 0]}>
        <Html position={[0, 1.8, 0]} center distanceFactor={10}>
          <div className="px-2 py-0.5 rounded text-[9px] whitespace-nowrap pointer-events-none bg-green-500/15 text-green-400 border border-green-500/30 font-semibold">
            AEROPONIK &mdash; 15 m²
          </div>
        </Html>

        <AeroponicTower position={[-0.8, 0, -0.6]} growthProgress={aeroGrowth} plantType="potato" />
        <AeroponicTower position={[0, 0, -0.6]} growthProgress={Math.max(0.2, aeroGrowth - 0.1)} plantType="wheat" />
        <AeroponicTower position={[0.8, 0, -0.6]} growthProgress={Math.max(0.3, aeroGrowth - 0.05)} plantType="soybean" />
        <AeroponicTower position={[-0.8, 0, 0.3]} growthProgress={Math.max(0.4, aeroGrowth + 0.05)} plantType="potato" />
        <AeroponicTower position={[0, 0, 0.3]} growthProgress={aeroGrowth} plantType="wheat" />
        <AeroponicTower position={[0.8, 0, 0.3]} growthProgress={Math.max(0.15, aeroGrowth - 0.15)} plantType="soybean" />
        <AeroponicTower position={[-0.8, 0, 1.2]} growthProgress={Math.max(0.5, aeroGrowth - 0.02)} plantType="potato" />
        <AeroponicTower position={[0, 0, 1.2]} growthProgress={Math.max(0.35, aeroGrowth + 0.08)} plantType="wheat" />
        <AeroponicTower position={[0.8, 0, 1.2]} growthProgress={aeroGrowth} plantType="potato" />

        <mesh position={[0, -1.15, 0.3]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.4, 2.4]} />
          <meshStandardMaterial color="#0a1a0a" transparent opacity={0.4} emissive="#22c55e" emissiveIntensity={0.02} />
        </mesh>
      </group>

      <group position={[0.3, -0.2, 0]}>
        <NFTRack position={[0, -0.05, -0.5]} tiers={5} growthProgress={nftGrowth} />
        <NFTRack position={[0, -0.05, 0.5]} tiers={5} growthProgress={Math.max(0.3, nftGrowth - 0.1)} />

        <Html position={[0, 1.8, 0]} center distanceFactor={10}>
          <div className="px-2 py-0.5 rounded text-[9px] whitespace-nowrap pointer-events-none bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold">
            NFT HIDROPONIK &mdash; 7 m²
          </div>
        </Html>
      </group>

      <SpirulinaBioreactor position={[3, -0.1, -0.8]} />
      <MushroomCabinet position={[3, -0.7, 1.0]} />
      <FloorGrid />

      <Particles count={60} color="#34d399" radius={4} speed={0.15} />
      <Particles count={30} color="#4a9caa" radius={3} speed={0.1} />
      <Particles count={200} color="#ffffff" radius={18} speed={0.03} />

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={3}
        maxDistance={20}
        autoRotate
        autoRotateSpeed={0.3}
        maxPolarAngle={Math.PI / 1.6}
        target={[0, 0.5, 0]}
      />
    </Canvas>
  );
}

function MiniHabitat3D({ scenario, simState }) {
  const calorieRatio = simState?.resources?.calories
    ? Math.min(1, (simState.resources.calories.dailyProduction || 0) / Math.max(1, simState.resources.calories.dailyTarget || 15000))
    : 0.7;
  const o2Balance = simState?.resources?.oxygen?.balance || 0;
  const growthProgress = simState?.ndvi?.aeroponic?.average || 0.7;
  const isLedFailure = scenario?.active === 'led_failure';
  const isCo2Spike = scenario?.active === 'co2_spike';
  const isSpirCrash = scenario?.active === 'spirulina_crash';

  const o2ParticleCount = Math.max(15, Math.min(80, 40 + Math.round(o2Balance / 50)));
  const co2ParticleCount = isCo2Spike ? 60 : 25;

  return (
    <Canvas camera={{ position: [6, 4, 6], fov: 45 }} style={{ background: '#060a12' }}>
      <color attach="background" args={['#060a12']} />
      <fog attach="fog" args={['#060a12', 10, 25]} />

      <ambientLight intensity={isLedFailure ? 0.1 : 0.2} />
      <directionalLight position={[10, 10, 5]} intensity={isLedFailure ? 0.35 : 0.7} color="#ffffff" />
      <pointLight position={[-5, 5, -5]} intensity={isSpirCrash ? 0.15 : 0.4} color="#4a9caa" distance={15} />
      <pointLight position={[5, -3, 3]} intensity={0.2} color="#22c55e" distance={10} />

      <HabitatShell />

      <CompSection position={[0, 0, -3]} color="#d4903a" label="Atık İşleme" isWarning={false} />
      <CompSection position={[0, 0, -1]} color="#c084fc" label="Besin Çözeltisi" isWarning={false} />
      <CompSection position={[0, 0, 1]} color="#22c55e" label="Bitki Modülü" isWarning={isLedFailure} emissiveIntensity={isLedFailure ? 0.04 : 0.12} />
      <CompSection position={[0, 0, 3]} color="#3b82f6" label="Habitat" isWarning={isCo2Spike} />

      <PlantRow position={[0, -1.2, 0.8]} count={8} color="#22c55e" growthProgress={growthProgress} />
      <PlantRow position={[0, -1.2, 1.2]} count={6} color="#34d399" growthProgress={Math.max(0.3, growthProgress - 0.1)} />

      <SpirulinaOrb />

      <Particles count={o2ParticleCount} color="#34d399" radius={1.8} speed={0.3} />
      <Particles count={co2ParticleCount} color={isCo2Spike ? '#ef4444' : '#3b82f6'} radius={1.5} speed={isCo2Spike ? 0.5 : 0.2} />
      <Particles count={150} color="#ffffff" radius={15} speed={0.05} />

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
    const c = status === 'nominal' ? '#4ead5b' : status === 'warning' ? '#d4903a' : '#d45555';
    return <circle r="3.5" fill={c}><animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" /></circle>;
  };

  return (
    <svg viewBox="0 0 680 400" className="w-full h-full">
      <defs>
        <pattern id="dt-grid" width="16" height="16" patternUnits="userSpaceOnUse">
          <path d="M 16 0 L 0 0 0 16" fill="none" stroke="#1e293b" strokeWidth="0.3" />
        </pattern>
        <radialGradient id="dt-glow" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#5b8def" stopOpacity="0.03" />
          <stop offset="100%" stopColor="#5b8def" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="680" height="400" fill="url(#dt-grid)" />
      <ellipse cx="340" cy="200" rx="250" ry="150" fill="url(#dt-glow)" />

      {/* Title */}
      <text x="340" y="16" textAnchor="middle" fill="#475569" fontSize="8" fontFamily="monospace" letterSpacing="2">
        GENESIS DİJİTAL İKİZ — SİSTEM MİMARİSİ
      </text>

      {/* Atmosphere System */}
      <g>
        <rect x="230" y="25" width="220" height="55" rx="8" fill="#0f172a" stroke="#4ead5b40" strokeWidth="1" />
        <text x="250" y="42" fill="#4ead5b" fontSize="10" fontWeight="600">Atmosfer Kontrol</text>
        <text x="250" y="56" fill="#94a3b8" fontSize="8" fontFamily="monospace">
          O2: %{hab?.o2Level?.toFixed(1)} | CO2: %{hab?.co2Level?.toFixed(3)} | {hab?.temperature?.toFixed(1)}°C
        </text>
        <text x="250" y="68" fill="#94a3b8" fontSize="7" fontFamily="monospace">
          O2 Üretim: {formatNumber(resources.oxygen.production)} L/gün | Denge: {resources.oxygen.balance > 0 ? '+' : ''}{formatNumber(resources.oxygen.balance)} L
        </text>
        <g transform="translate(428, 38)">{statusDot(hab?.status)}</g>
      </g>

      {/* Growing modules */}
      <g>
        <rect x="20" y="95" width="200" height="130" rx="8" fill="#0f172a" stroke="#4ead5b40" strokeWidth="1" />
        <text x="35" y="115" fill="#4ead5b" fontSize="10" fontWeight="600">Bitki Yetiştirme</text>
        <g transform="translate(200, 107)">{statusDot(compartments.growth?.status)}</g>

        <rect x="30" y="122" width="90" height="35" rx="4" fill="#0a1a0a" stroke="#4ead5b25" strokeWidth="0.7" />
        <text x="38" y="136" fill="#4ead5b" fontSize="7" fontWeight="600">Aeroponik</text>
        <text x="38" y="148" fill="#94a3b8" fontSize="6.5" fontFamily="monospace">{aero?.temperature?.toFixed(1)}°C | pH {aero?.pH?.toFixed(1)}</text>

        <rect x="125" y="122" width="90" height="35" rx="4" fill="#0a1520" stroke="#4a9caa25" strokeWidth="0.7" />
        <text x="133" y="136" fill="#4a9caa" fontSize="7" fontWeight="600">NFT Hidroponik</text>
        <text x="133" y="148" fill="#94a3b8" fontSize="6.5" fontFamily="monospace">{nft?.temperature?.toFixed(1)}°C | pH {nft?.pH?.toFixed(1)}</text>

        <rect x="30" y="162" width="90" height="35" rx="4" fill="#0f0a1a" stroke="#8b7fc725" strokeWidth="0.7" />
        <text x="38" y="176" fill="#8b7fc7" fontSize="7" fontWeight="600">Spirulina</text>
        <text x="38" y="188" fill="#94a3b8" fontSize="6.5" fontFamily="monospace">{spir?.density?.toFixed(1)} g/L | O2: {spir?.o2Production?.toFixed(0)}</text>

        <rect x="125" y="162" width="90" height="35" rx="4" fill="#1a150a" stroke="#d4903a25" strokeWidth="0.7" />
        <text x="133" y="176" fill="#d4903a" fontSize="7" fontWeight="600">Mantar</text>
        <text x="133" y="188" fill="#94a3b8" fontSize="6.5" fontFamily="monospace">Sub: %{(compartments.growth?.modules?.mushroom?.substrateLevel || 0).toFixed(0)}</text>

        <text x="35" y="215" fill="#94a3b8" fontSize="7" fontFamily="monospace">
          Kalori: {formatNumber(resources.calories.dailyProduction)} / {formatNumber(resources.calories.dailyTarget)} kcal
        </text>
      </g>

      {/* Power System */}
      <g>
        <rect x="460" y="95" width="200" height="70" rx="8" fill="#0f172a" stroke="#5b8def40" strokeWidth="1" />
        <text x="475" y="115" fill="#5b8def" fontSize="10" fontWeight="600">Güç Sistemi</text>
        <text x="475" y="130" fill="#94a3b8" fontSize="8" fontFamily="monospace">
          Üretim: {(power?.generation || 0).toFixed(1)} kW | Tüketim: {(power?.totalConsumption || 0).toFixed(1)} kW
        </text>
        <text x="475" y="143" fill="#94a3b8" fontSize="7" fontFamily="monospace">
          Kullanım: %{(power?.utilizationPercent || 0).toFixed(0)} | {power?.sourceType === 'nuclear' ? 'Nükleer' : 'Güneş'}
        </text>
        {power?.powerDeficit && (
          <text x="475" y="155" fill="#d45555" fontSize="7" fontWeight="600">!! GÜÇ YETERSİZLİĞİ</text>
        )}
        <g transform="translate(638, 107)">{statusDot(power?.powerDeficit ? 'critical' : 'nominal')}</g>
      </g>

      {/* Thermal */}
      <g>
        <rect x="460" y="175" width="200" height="55" rx="8" fill="#0f172a" stroke="#d4903a40" strokeWidth="1" />
        <text x="475" y="195" fill="#d4903a" fontSize="10" fontWeight="600">Isıl Kontrol</text>
        <text x="475" y="210" fill="#94a3b8" fontSize="8" fontFamily="monospace">
          Kabin: {(thermal?.currentTemp || 22).toFixed(1)}°C | Net: {(thermal?.netHeatFlux || 0).toFixed(2)} kW
        </text>
        <text x="475" y="222" fill="#94a3b8" fontSize="7" fontFamily="monospace">
          Radyatör: %{(thermal?.heatRejection?.utilizationPercent || 0).toFixed(0)} kapasite
        </text>
        <g transform="translate(638, 187)">{statusDot(thermal?.thermalStatus || 'nominal')}</g>
      </g>

      {/* Water Processing */}
      <g>
        <rect x="230" y="245" width="220" height="55" rx="8" fill="#0f172a" stroke="#5b8def40" strokeWidth="1" />
        <text x="250" y="265" fill="#5b8def" fontSize="10" fontWeight="600">Su İşleme</text>
        <text x="250" y="280" fill="#94a3b8" fontSize="8" fontFamily="monospace">
          Geri Kaz: {formatPercent((waterProcessing?.overallRecovery || 0.987) * 100)} | Kayıp: {waterProcessing?.dailyLoss || 0.4} L/gün
        </text>
        <text x="250" y="292" fill="#94a3b8" fontSize="7" fontFamily="monospace">
          Kalite: {waterProcessing?.waterQuality === 'potable' ? 'İçilebilir' : 'Dikkat'} | TOC: {waterProcessing?.tocLevel || 0} mg/L
        </text>
        <g transform="translate(428, 258)">{statusDot(waterProcessing?.status || 'nominal')}</g>
      </g>

      {/* Degradation */}
      <g>
        <rect x="20" y="245" width="200" height="55" rx="8" fill="#0f172a" stroke="#d4903a40" strokeWidth="1" />
        <text x="35" y="265" fill="#d4903a" fontSize="10" fontWeight="600">Bileşen Sağlığı</text>
        <text x="35" y="280" fill="#94a3b8" fontSize="8" fontFamily="monospace">
          Ortalama: {formatPercent(degradation?.averageHealth || 100)}
        </text>
        {Object.entries(degradation?.components || {}).slice(0, 3).map(([key, comp], i) => (
          <g key={key} transform={`translate(35, ${286 + i * 4})`}>
            <rect width={160 * (comp.health / 100)} height="3" rx="1" fill={comp.health > 60 ? '#4ead5b' : comp.health > 30 ? '#d4903a' : '#d45555'} opacity="0.7" />
          </g>
        ))}
      </g>

      {/* Crew */}
      <g>
        <rect x="460" y="245" width="200" height="55" rx="8" fill="#0f172a" stroke="#d4555540" strokeWidth="1" />
        <text x="475" y="265" fill="#d45555" fontSize="10" fontWeight="600">Mürettebat</text>
        <text x="475" y="280" fill="#94a3b8" fontSize="8" fontFamily="monospace">
          {hab?.crewCount || 6} kişi
        </text>
        <text x="475" y="292" fill="#94a3b8" fontSize="7" fontFamily="monospace">
          Su: {formatNumber(hab?.waterReserve || 0)} L | Nem: %{hab?.humidity?.toFixed(0)}
        </text>
      </g>

      {/* Flow arrows */}
      <line x1="170" y1="95" x2="230" y2="60" stroke="#4ead5b" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.5">
        <animate attributeName="stroke-dashoffset" from="8" to="0" dur="2s" repeatCount="indefinite" />
      </line>
      <text x="195" y="72" fill="#4ead5b" fontSize="6" textAnchor="middle">O2</text>

      <line x1="240" y1="80" x2="190" y2="100" stroke="#d4903a" strokeWidth="1" strokeDasharray="3 5" opacity="0.4">
        <animate attributeName="stroke-dashoffset" from="8" to="0" dur="3s" repeatCount="indefinite" />
      </line>

      <line x1="290" y1="245" x2="200" y2="225" stroke="#5b8def" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.5">
        <animate attributeName="stroke-dashoffset" from="8" to="0" dur="2.5s" repeatCount="indefinite" />
      </line>
      <text x="240" y="232" fill="#5b8def" fontSize="6" textAnchor="middle">H2O</text>

      <line x1="460" y1="130" x2="340" y2="55" stroke="#5b8def" strokeWidth="1" strokeDasharray="3 6" opacity="0.3">
        <animate attributeName="stroke-dashoffset" from="9" to="0" dur="4s" repeatCount="indefinite" />
      </line>

      {/* Mission info */}
      <g transform="translate(240, 320)">
        <rect width="200" height="30" rx="6" fill="#0a0e1a" stroke="#8b7fc730" strokeWidth="0.7" />
        <text x="10" y="14" fill="#8b7fc7" fontSize="8" fontWeight="600">Görev</text>
        <text x="60" y="14" fill="#94a3b8" fontSize="7" fontFamily="monospace">
          Gün {state.time.day}/{state.mission?.totalMissionDays || 980} | %{(state.mission?.missionProgress || 0).toFixed(1)}
        </text>
        <rect x="10" y="19" width="180" height="3" rx="1" fill="#1e293b" />
        <rect x="10" y="19" width={180 * (state.mission?.missionProgress || 0) / 100} height="3" rx="1" fill="#8b7fc7" opacity="0.7" />
      </g>

      {/* Radiation indicator */}
      {state.radiation?.activeEvent && (
        <g transform="translate(460, 320)">
          <rect width="200" height="30" rx="6" fill="#d4555515" stroke="#d4555540" strokeWidth="1" />
          <text x="10" y="20" fill="#d45555" fontSize="9" fontWeight="600">
            SPE AKTIF — {state.radiation.activeEvent.dose.toFixed(3)} Gy
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
    <div className="bg-nexus-card rounded-lg border border-nexus-border p-3">
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
          <FiAlertTriangle size={10} className="inline mr-1" />
          Senaryo etkisi simülasyonda aktif
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
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <FiBox className="text-blue-400" size={18} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-nexus-text">Dijital İkiz</h2>
            <p className="text-[10px] text-nexus-text-dim">Canlı sistem durumu, 3D görüntüleme ve senaryo simülasyonu</p>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-nexus-bg rounded-lg p-0.5">
          <button
            onClick={() => setView('schematic')}
            className={`px-3 py-1 rounded text-xs transition-all ${view === 'schematic' ? 'bg-nexus-accent text-nexus-bg font-semibold' : 'text-nexus-text-dim'}`}
          >
            Şematik
          </button>
          <button
            onClick={() => setView('3d')}
            className={`px-3 py-1 rounded text-xs transition-all ${view === '3d' ? 'bg-nexus-accent text-nexus-bg font-semibold' : 'text-nexus-text-dim'}`}
          >
            3D Habitat
          </button>
          <button
            onClick={() => setView('farm')}
            className={`px-3 py-1 rounded text-xs transition-all ${view === 'farm' ? 'bg-green-500 text-nexus-bg font-semibold' : 'text-nexus-text-dim'}`}
          >
            Çiftlik 3D
          </button>
          <button
            onClick={() => setView('map')}
            className={`px-3 py-1 rounded text-xs transition-all ${view === 'map' ? 'bg-nexus-accent text-white font-semibold' : 'text-nexus-text-dim'}`}
          >
            Tesis Haritası
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex gap-3 min-h-0">
        {/* Main view area */}
        <div className="flex-1 bg-nexus-card rounded-lg border border-nexus-border overflow-hidden">
          {view === 'schematic' ? (
            <div className="h-full p-2 flex items-center justify-center">
              <SystemSchematic state={state} />
            </div>
          ) : view === 'farm' ? (
            <VerticalFarm3D simState={state} />
          ) : view === 'map' ? (
            <div className="h-full overflow-auto">
              <React.Suspense fallback={<div className="flex items-center justify-center h-full text-xs text-nexus-text-dim">Yükleniyor...</div>}>
                <FarmViewPage />
              </React.Suspense>
            </div>
          ) : (
            <MiniHabitat3D scenario={state.scenario} simState={state} />
          )}
        </div>

        {/* Right panel */}
        <div className="w-64 space-y-3 overflow-y-auto">
          <ScenarioPanel />

          {/* Quick stats */}
          <div className="bg-nexus-card rounded-lg border border-nexus-border p-3 space-y-2">
            <h3 className="text-xs text-nexus-text-dim uppercase tracking-wider">Canlı Durum</h3>
            <QuickStat icon={<FiActivity size={11} />} label="Sistem" value={`${state.resources?.healthScore ?? 94}/100`} color={state.resources?.healthScore > 80 ? '#4ead5b' : '#d4903a'} />
            <QuickStat icon={<FiThermometer size={11} />} label="Sıcaklık" value={`${(state.compartments?.habitat?.temperature || 22).toFixed(1)}°C`} color="#d4903a" />
            <QuickStat icon={<FiWind size={11} />} label="O2" value={`%${(state.compartments?.habitat?.o2Level || 21).toFixed(1)}`} color="#4ead5b" />
            <QuickStat icon={<FiDroplet size={11} />} label="Su" value={`${formatNumber(state.resources?.water?.total || 0)} L`} color="#5b8def" />
            <QuickStat icon={<FiZap size={11} />} label="Güç" value={`%${(state.power?.utilizationPercent || 0).toFixed(0)}`} color="#5b8def" />
          </div>

          {/* Compartment statuses */}
          <div className="bg-nexus-card rounded-lg border border-nexus-border p-3 space-y-1.5">
            <h3 className="text-xs text-nexus-text-dim uppercase tracking-wider mb-1">Kompartmanlar</h3>
            {['waste', 'nutrient', 'growth', 'habitat'].map(id => {
              const comp = COMPARTMENTS[id];
              const data = id === 'growth' ? state.compartments.growth : state.compartments[id];
              const status = data?.status || 'nominal';
              const sColor = status === 'nominal' ? '#4ead5b' : status === 'warning' ? '#d4903a' : '#d45555';
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
          <div className="bg-nexus-card rounded-lg border border-nexus-border p-3">
            <h3 className="text-xs text-nexus-text-dim uppercase tracking-wider mb-2">Radyasyon</h3>
            <div className="flex justify-between text-xs">
              <span className="text-nexus-text-dim">Kümülatif Doz</span>
              <span className="font-mono text-nexus-text">{(state.radiation?.cumulativeDose || 0).toFixed(4)} Gy</span>
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span className="text-nexus-text-dim">Günlük Doz</span>
              <span className="font-mono text-nexus-text">{(state.radiation?.dailyDose || 0).toFixed(4)} Gy</span>
            </div>
            {state.radiation?.activeEvent && (
              <div className="mt-2 p-1.5 rounded bg-red-500/10 border border-red-500/20 text-[10px] text-red-400">
                <FiRadio size={10} className="inline mr-1" />
                SPE Olayı Aktif
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scenario active banner */}
      {state.scenario.active && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-2 flex items-center gap-2">
          <span className="text-red-400"><FiAlertTriangle size={14} /></span>
          <span className="text-xs text-red-400 font-medium">
            Senaryo Aktif: {SCENARIOS.find(s => s.id === state.scenario.active)?.name}
          </span>
          <span className="text-[10px] text-red-400/70 ml-auto font-mono">
            {SCENARIOS.find(s => s.id === state.scenario.active)?.duration - (state.time.day - state.scenario.startDay)} gün kaldı
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
      <span className="text-xs font-mono font-semibold" style={{ color }}>{value}</span>
    </div>
  );
}
