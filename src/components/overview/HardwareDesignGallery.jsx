import { useState, useRef, Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Stage, Center } from '@react-three/drei';
import { FiChevronLeft, FiChevronRight, FiTool, FiBox } from 'react-icons/fi';

const MODELS = [
  {
    src: '/models/Parça1.glb',
    title: 'Aeroponik Dikey Ciftlik Modulü',
    desc: '3 katli silindirik aeroponik kule. Tasiyici iskelet, sisleme boru hatlari, LED montaj direkleri ve bitki yerlestirme panelleri dahil tam montaj.',
  },
  {
    src: '/models/filizlendirme.glb',
    title: 'Santrifüj Filizlendirme Sistemi',
    desc: 'Mikrogravitede bitki köklerinin yer cekimi yönünü algilamasi icin döner tambur sistemi. Tasyünü ortaminda tohum cimlendirme.',
  },
];

function Model({ src }) {
  const { scene } = useGLTF(src);
  return (
    <Center>
      <primitive object={scene} />
    </Center>
  );
}

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color="#4ead5b" wireframe />
    </mesh>
  );
}

export default function HardwareDesignGallery() {
  const [modelIdx, setModelIdx] = useState(0);
  const containerRef = useRef(null);

  const prev = () => setModelIdx((i) => (i - 1 + MODELS.length) % MODELS.length);
  const next = () => setModelIdx((i) => (i + 1) % MODELS.length);
  const m = MODELS[modelIdx];

  // Block wheel from scrolling the page when over the canvas
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e) => e.preventDefault();
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, []);

  return (
    <div className="bg-nexus-card rounded-lg border border-nexus-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-nexus-border">
        <div className="flex items-center gap-2">
          <FiTool size={13} className="text-nexus-accent" />
          <span className="text-[11px] font-semibold text-nexus-text uppercase tracking-wider">
            Donanim Tasarimi — SolidWorks CAD
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-nexus-bg text-nexus-text-dim font-mono">
            {modelIdx + 1}/{MODELS.length}
          </span>
        </div>
      </div>

      {/* 3D Viewer */}
      <div className="relative group">
        <div
          ref={containerRef}
          className="aspect-[16/9]"
          style={{ touchAction: 'none' }}
        >
          <Canvas
            key={m.src}
            camera={{ position: [0, 0, 5], fov: 45 }}
            style={{ background: '#0a0f1a' }}
            eventSource={containerRef}
            eventPrefix="client"
          >
            <Suspense fallback={<LoadingFallback />}>
              <Stage
                adjustCamera={1.5}
                intensity={0.5}
                environment="city"
                shadows={{ type: 'contact', opacity: 0.4, blur: 2 }}
              >
                <Model src={m.src} />
              </Stage>
            </Suspense>
            <OrbitControls
              makeDefault
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              autoRotate
              autoRotateSpeed={1.5}
              minDistance={0.5}
              maxDistance={50}
            />
          </Canvas>
        </div>

        {/* Nav arrows */}
        {MODELS.length > 1 && (
          <>
            <button onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <FiChevronLeft size={18} />
            </button>
            <button onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <FiChevronRight size={18} />
            </button>
          </>
        )}

        {/* Hint */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 text-white/60 text-[9px] px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Sürükle: döndür · Scroll: yakinlastir · Sag tik: kaydir
        </div>
      </div>

      {/* Caption */}
      <div className="px-4 py-3">
        <h4 className="text-xs font-semibold text-nexus-text mb-1">{m.title}</h4>
        <p className="text-[11px] text-nexus-text-dim leading-relaxed">{m.desc}</p>
      </div>

      {/* Model selector */}
      <div className="px-4 pb-3 flex gap-2">
        {MODELS.map((item, i) => (
          <button key={i} onClick={() => setModelIdx(i)}
            className={`flex-1 px-3 py-1.5 rounded text-[10px] font-semibold transition-all ${
              i === modelIdx
                ? 'bg-nexus-accent/20 text-nexus-accent border border-nexus-accent/40'
                : 'bg-nexus-bg text-nexus-text-dim border border-nexus-border hover:text-nexus-text'
            }`}>
            <FiBox size={10} className="inline mr-1" />
            {item.title}
          </button>
        ))}
      </div>
    </div>
  );
}
