import { useState, useEffect } from 'react';

const SYSTEMS = [
  { label: 'Atmosfer Kontrol Sistemi', delay: 200 },
  { label: 'Bitki Büyüme Modülleri', delay: 400 },
  { label: 'Su İşleme & Geri Kazanım', delay: 600 },
  { label: 'Besin Döngüsü Motoru', delay: 800 },
  { label: 'AI Anomali Dedektörü', delay: 1000 },
  { label: 'Dijital İkiz Motoru', delay: 1200 },
  { label: 'Güç & Isıl Sistemler', delay: 1400 },
  { label: 'Görev Planlayıcı', delay: 1600 },
];

export default function SplashScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [currentSystem, setCurrentSystem] = useState(0);
  const [phase, setPhase] = useState('boot');

  useEffect(() => {
    const bootTimer = setTimeout(() => setPhase('loading'), 300);

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2.5;
      });
    }, 30);

    SYSTEMS.forEach((sys, i) => {
      setTimeout(() => setCurrentSystem(i + 1), sys.delay);
    });

    const readyTimer = setTimeout(() => setPhase('ready'), 1800);
    const exitTimer = setTimeout(() => setPhase('exit'), 2200);
    const completeTimer = setTimeout(() => onComplete(), 2600);

    return () => {
      clearTimeout(bootTimer);
      clearTimeout(readyTimer);
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
      clearInterval(interval);
    };
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-50 bg-nexus-bg flex flex-col items-center justify-center ${
      phase === 'exit' ? 'opacity-0' : 'opacity-100'
    }`} style={{ transition: 'opacity 0.4s ease' }}>
      {/* Logo and title */}
      <div className={`relative z-10 flex flex-col items-center transition-all duration-500 ${
        phase === 'boot' ? 'opacity-0' : 'opacity-100'
      }`}>
        {/* Logo */}
        <div className="mb-5">
          <div className="w-16 h-16 rounded-xl bg-nexus-accent flex items-center justify-center text-white font-bold text-3xl">
            G
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold tracking-wider mb-1 text-nexus-text">
          GENESIS
        </h1>
        <p className="text-xs text-nexus-text-dim tracking-widest uppercase mb-6">
          Kapalı Döngü Uzay Tarımı Yaşam Destek Sistemi
        </p>

        {/* Progress bar */}
        <div className="w-72 mb-4">
          <div className="h-1 bg-nexus-card rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-nexus-accent transition-all duration-200 ease-out"
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </div>
        </div>

        {/* System initialization log */}
        <div className="w-72 h-28 bg-nexus-card rounded-lg border border-nexus-border p-3 font-mono text-[11px] overflow-hidden">
          {SYSTEMS.slice(0, currentSystem).map((sys, i) => (
            <div key={i} className="flex items-center gap-2 mb-0.5 animate-fade-in">
              <span className="text-nexus-green">&#10003;</span>
              <span className="text-nexus-text-dim">{sys.label}</span>
              <span className="text-nexus-green ml-auto">OK</span>
            </div>
          ))}
          {currentSystem < SYSTEMS.length && (
            <div className="flex items-center gap-2 text-nexus-accent">
              <span className="animate-spin inline-block w-3 h-3 border border-nexus-accent border-t-transparent rounded-full" />
              <span>{SYSTEMS[currentSystem]?.label || 'Başlatılıyor...'}</span>
            </div>
          )}
        </div>

        {/* Ready message */}
        {phase === 'ready' && (
          <div className="mt-3 text-xs text-nexus-accent font-medium animate-fade-in">
            Tüm sistemler nominal
          </div>
        )}

        {/* Version info */}
        <div className="mt-4 text-[10px] text-nexus-text-dim/30 tracking-wider">
          v2.0.0 | MELiSSA Protokol | 6 Mürettebat | 980 Gün Görev
        </div>
      </div>
    </div>
  );
}
