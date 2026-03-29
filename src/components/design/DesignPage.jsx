import { useState, useRef, Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Stage, Center } from '@react-three/drei';
import { FiBox, FiTool, FiInfo, FiChevronDown, FiChevronUp } from 'react-icons/fi';

const MODELS = [
  {
    src: '/models/Parça1.glb',
    title: 'Aeroponik Dikey Ciftlik Modülü',
    desc: '3 katlı silindirik aeroponik kule. Taşıyıcı iskelet, sisleme boru hatları, LED montaj direkleri ve bitki yerleştirme panelleri dahil tam montaj.',
    specs: [
      { label: 'Toplam Üretim Alanı', value: '47 m² (3 kat × 15.7 m²)' },
      { label: 'Sütun Sayısı × Kat', value: '5 sütun × 3 kat' },
      { label: 'Sütun 1: Tatlı Patates', value: '20 m² (kat başı 6.7)' },
      { label: 'Sütun 2: Soya Fasulyesi', value: '14 m² (kat başı 4.7)' },
      { label: 'Sütun 3: Yer Fıstığı', value: '8 m² (kat başı 2.7)' },
      { label: 'Sütun 4: Yeşillik & Filiz', value: '3.5 m² (kat başı 1.2)' },
      { label: 'Sütun 5: Mikro Filiz & Baharat', value: '1.5 m² (kat başı 0.4)' },
      { label: 'Sisleme Döngüsü', value: '30s püskürtme / 3dk bekleme' },
      { label: 'Tasarım Yazılımı', value: 'SolidWorks' },
    ],
  },
  {
    src: '/models/filizlendirme.glb',
    title: 'Santrifüj Filizlendirme Sistemi',
    desc: 'Mikrogravitede bitki köklerinin yerçekimi yönünü algılaması için döner tambur sistemi. Taş yünü ortamında tohum çimlendirme.',
    specs: [
      { label: 'Tambur Yarıçapı', value: '30 cm' },
      { label: 'Dönüş Hızı', value: '40 RPM' },
      { label: 'Ortam', value: 'Taş Yünü (Rockwool)' },
      { label: 'Nem Aralığı', value: '%70–90' },
      { label: 'Sıcaklık', value: '18–24°C' },
      { label: 'Mekanizma', value: 'Statolit merkezkaç çökelimi' },
      { label: 'Kök Yönü', value: 'Dışa (merkezkaç)' },
      { label: 'Tasarım Yazılımı', value: 'SolidWorks' },
    ],
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

function LoadingSpinner() {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 border-3 border-nexus-accent/20 border-t-nexus-accent rounded-full animate-spin" />
        <span className="text-[10px] text-nexus-text-dim">Model yükleniyor...</span>
      </div>
    </div>
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

function SpecsPanel({ specs, open, toggle }) {
  return (
    <div className="bg-nexus-card rounded-lg border border-nexus-border overflow-hidden">
      <button onClick={toggle}
        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-nexus-card-hover transition-colors">
        <div className="flex items-center gap-2">
          <FiInfo size={13} className="text-nexus-text-dim" />
          <span className="text-[11px] font-semibold text-nexus-text uppercase tracking-wider">Teknik Özellikler</span>
        </div>
        {open ? <FiChevronUp size={14} className="text-nexus-text-dim" /> : <FiChevronDown size={14} className="text-nexus-text-dim" />}
      </button>
      {open && (
        <div className="px-4 pb-3 animate-fade-in">
          <div className="space-y-1.5">
            {specs.map((s, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-[11px] text-nexus-text-dim">{s.label}</span>
                <span className="text-[11px] font-mono text-nexus-text font-semibold">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function DesignPage() {
  const [modelIdx, setModelIdx] = useState(0);
  const [specsOpen, setSpecsOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);

  const m = MODELS[modelIdx];

  // Block wheel from scrolling the page when pointer is over canvas
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e) => e.preventDefault();
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, []);

  // Reset loading on model change
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(t);
  }, [modelIdx]);

  return (
    <div className="h-full flex flex-col gap-3 animate-fade-in">
      {/* Model selector tabs */}
      <div className="flex gap-2">
        {MODELS.map((item, i) => (
          <button key={i} onClick={() => setModelIdx(i)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all ${
              i === modelIdx
                ? 'bg-nexus-accent/15 text-nexus-accent border border-nexus-accent/40'
                : 'bg-nexus-card text-nexus-text-dim border border-nexus-border hover:text-nexus-text hover:border-nexus-text-dim/30'
            }`}>
            <FiBox size={14} />
            {item.title}
          </button>
        ))}
      </div>

      {/* Main content: 3D viewer + sidebar */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">

        {/* 3D Viewer — takes most space */}
        <div className="col-span-12 lg:col-span-9 bg-nexus-card rounded-lg border border-nexus-border overflow-hidden flex flex-col min-h-0">
          <div className="flex items-center justify-between px-4 py-2 border-b border-nexus-border flex-shrink-0">
            <div className="flex items-center gap-2">
              <FiTool size={13} className="text-nexus-accent" />
              <span className="text-[11px] font-semibold text-nexus-text uppercase tracking-wider">
                3D Model — SolidWorks CAD
              </span>
            </div>
            <span className="text-[9px] text-nexus-text-dim">
              Sürükle: döndür · Scroll: yakınlaştır · Sağ tık: kaydır
            </span>
          </div>

          <div
            ref={containerRef}
            className="flex-1 relative min-h-0"
            style={{ touchAction: 'none' }}
          >
            {loading && <LoadingSpinner />}
            <Canvas
              key={m.src}
              camera={{ position: [0, 0, 5], fov: 45 }}
              style={{ background: '#060a12' }}
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
                autoRotateSpeed={1}
                minDistance={0.5}
                maxDistance={50}
                maxPolarAngle={Math.PI / 1.5}
              />
            </Canvas>
          </div>
        </div>

        {/* Right sidebar: description + specs */}
        <div className="col-span-12 lg:col-span-3 space-y-3 overflow-y-auto">
          {/* Description */}
          <div className="bg-nexus-card rounded-lg border border-nexus-border p-4">
            <h3 className="text-sm font-semibold text-nexus-text mb-2">{m.title}</h3>
            <p className="text-[11px] text-nexus-text-dim leading-relaxed">{m.desc}</p>
          </div>

          {/* Specs */}
          <SpecsPanel specs={m.specs} open={specsOpen} toggle={() => setSpecsOpen(!specsOpen)} />
        </div>
      </div>
    </div>
  );
}
