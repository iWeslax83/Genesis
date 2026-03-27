import { useState, useEffect } from 'react';

const SYSTEMS = [
  { label: 'Atmosfer Kontrol Sistemi', delay: 400 },
  { label: 'Bitki Buyume Modulleri', delay: 700 },
  { label: 'Su Isleme & Geri Kazanim', delay: 1000 },
  { label: 'Besin Dongusu Motoru', delay: 1300 },
  { label: 'AI Anomali Dedektoru', delay: 1600 },
  { label: 'Dijital Ikiz Motoru', delay: 1900 },
  { label: 'Guc & Isil Sistemler', delay: 2200 },
  { label: 'Gorev Planlayici', delay: 2500 },
];

export default function SplashScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [currentSystem, setCurrentSystem] = useState(0);
  const [phase, setPhase] = useState('boot'); // boot -> loading -> ready -> exit

  useEffect(() => {
    // Boot phase
    const bootTimer = setTimeout(() => setPhase('loading'), 600);

    // Loading phase — progress bar
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1.2;
      });
    }, 30);

    // System initialization messages
    SYSTEMS.forEach((sys, i) => {
      setTimeout(() => setCurrentSystem(i + 1), sys.delay);
    });

    // Ready phase
    const readyTimer = setTimeout(() => setPhase('ready'), 3000);
    const exitTimer = setTimeout(() => setPhase('exit'), 3600);
    const completeTimer = setTimeout(() => onComplete(), 4200);

    return () => {
      clearTimeout(bootTimer);
      clearTimeout(readyTimer);
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
      clearInterval(interval);
    };
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-50 bg-nexus-bg flex flex-col items-center justify-center transition-opacity duration-500 ${
      phase === 'exit' ? 'opacity-0' : 'opacity-100'
    }`}>
      {/* Starfield background */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 80 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 2 + 1 + 'px',
              height: Math.random() * 2 + 1 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              opacity: Math.random() * 0.5 + 0.1,
              animation: `blink ${2 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: Math.random() * 3 + 's',
            }}
          />
        ))}
      </div>

      {/* Orbital rings */}
      <div className="absolute w-[500px] h-[500px] rounded-full border border-nexus-accent/5 animate-spin-slow" />
      <div className="absolute w-[350px] h-[350px] rounded-full border border-emerald-500/8" style={{ animation: 'spin 12s linear infinite reverse' }} />
      <div className="absolute w-[200px] h-[200px] rounded-full border border-cyan-500/10 animate-spin-slow" />

      {/* Logo and title */}
      <div className={`relative z-10 flex flex-col items-center transition-all duration-700 ${
        phase === 'boot' ? 'scale-90 opacity-0' : 'scale-100 opacity-100'
      }`}>
        {/* Logo */}
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-bold text-5xl shadow-2xl shadow-emerald-500/30">
            G
          </div>
          <div className="absolute -inset-2 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 animate-pulse-glow -z-10" />
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold tracking-wider mb-1">
          <span className="genesis-gradient-text">GENESIS</span>
        </h1>
        <p className="text-sm text-nexus-text-dim tracking-widest uppercase mb-8">
          Kapali Dongu Uzay Tarimi Yasam Destek Sistemi
        </p>

        {/* Progress bar */}
        <div className="w-80 mb-4">
          <div className="h-1 bg-nexus-card rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-300 ease-out"
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </div>
        </div>

        {/* System initialization log */}
        <div className="w-80 h-28 bg-nexus-card/50 rounded-lg border border-nexus-border/50 p-3 font-mono text-[11px] overflow-hidden">
          {SYSTEMS.slice(0, currentSystem).map((sys, i) => (
            <div key={i} className="flex items-center gap-2 mb-0.5 animate-fade-in">
              <span className="text-emerald-400">&#10003;</span>
              <span className="text-nexus-text-dim">{sys.label}</span>
              <span className="text-emerald-500 ml-auto">OK</span>
            </div>
          ))}
          {currentSystem < SYSTEMS.length && (
            <div className="flex items-center gap-2 text-nexus-accent">
              <span className="animate-spin inline-block w-3 h-3 border border-nexus-accent border-t-transparent rounded-full" />
              <span>{SYSTEMS[currentSystem]?.label || 'Baslatiliyor...'}</span>
            </div>
          )}
        </div>

        {/* Ready message */}
        {phase === 'ready' && (
          <div className="mt-4 text-sm text-nexus-accent font-medium animate-fade-in">
            Tum sistemler nominal — Baslatiliyor...
          </div>
        )}

        {/* Version info */}
        <div className="mt-6 text-[10px] text-nexus-text-dim/40 tracking-wider">
          v2.0.0 | MELiSSA Protokol | 6 Murettebat | 980 Gun Gorev
        </div>
      </div>
    </div>
  );
}
