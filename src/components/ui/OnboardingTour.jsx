import { useState, useEffect } from 'react';
import { FiChevronRight, FiChevronLeft, FiX, FiPlay } from 'react-icons/fi';

const TOUR_STEPS = [
  {
    icon: '🚀',
    title: 'GENESIS\'e Hoş Geldiniz!',
    body: 'Bu simülasyon, 6 kişilik bir mürettebatın 980 günlük uzay görevinde hayatta kalmasını sağlayan kapalı döngü yaşam destek sistemini modeller.',
    hint: 'Gerçek NASA ve ESA verilerine dayanır.',
  },
  {
    icon: '🏠',
    title: 'Habitat — Yaşam Alanı',
    body: '350 m³\'lük bir alan. Mürettebat burada yaşar, nefes alır ve yemek yer. Oksijen, CO₂, sıcaklık ve nem sürekli izlenir.',
    hint: 'Sol paneldeki "Genel Bakış" sayfasında habitat durumunu görebilirsiniz.',
  },
  {
    icon: '🌱',
    title: 'Bitkiler — Hayat Kaynağı',
    body: '12 farklı bitki türü 4 farklı sistemde yetişir: Aeroponik (kökler havada), NFT (ince su tabakası), Spirulina (alg tankı) ve Mantar odası.',
    hint: 'Bitkiler hem oksijen üretir hem gıda sağlar — görev başarısının anahtarı.',
  },
  {
    icon: '♻️',
    title: 'Kapalı Döngü — Her Şey Geri Dönüşür',
    body: 'Mürettebat CO₂ üretir → bitkiler emer, O₂ üretir. Atık su arıtılır → bitkileri sular. Bitki atıkları → kompost → besin. Hiçbir şey boşa gitmez.',
    hint: 'Kapalılık oranı ne kadar yüksekse, dışarıdan o kadar az malzeme gerekir.',
  },
  {
    icon: '📊',
    title: 'Gösterge Paneli',
    body: '8 farklı sayfa var: Genel Bakış, Tesis Haritası, Bitki İzleme, Beslenme, Güç, Görev Planlama, Dijital İkiz ve AI Tahmin.',
    hint: 'Sayfalar arası gezinmek için sol menüyü veya 1-8 tuşlarına basın.',
  },
  {
    icon: '⏱️',
    title: 'Simülasyon Kontrolü',
    body: 'Simülasyon gerçek zamanlı çalışır. Üst bardaki kontrollerle hızlandırabilir (1x-50x), durdurup devam ettirebilirsiniz.',
    hint: 'Space = Başlat/Durdur | +/- = Hız ayarı | ? = Tüm kısayollar',
  },
  {
    icon: '🔍',
    title: 'Bilgi Simgeleri',
    body: 'Anlamadığınız bir terim gördüğünüzde yanındaki (i) simgesine tıklayın. NDVI, PAR, EC gibi teknik terimlerin ne anlama geldiğini açıklar.',
    hint: 'Simgeler sayfalar boyunca metriklerin yanında yer alır.',
  },
  {
    icon: '✨',
    title: 'Hazırsınız!',
    body: 'Şimdi simülasyonu keşfetmeye başlayabilirsiniz. "Neler Oluyor?" paneli size sürekli olarak sistemin durumunu anlatacak.',
    hint: 'İyi görevler, komutan! 🫡',
  },
];

const STORAGE_KEY = 'genesis_onboarding_done';

export default function OnboardingTour({ onComplete }) {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY);
    if (!done) {
      setVisible(true);
    }
  }, []);

  const handleFinish = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setVisible(false);
    onComplete?.();
  };

  const handleSkip = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setVisible(false);
    onComplete?.();
  };

  if (!visible) return null;

  const current = TOUR_STEPS[step];
  const isLast = step === TOUR_STEPS.length - 1;
  const isFirst = step === 0;
  const progress = ((step + 1) / TOUR_STEPS.length) * 100;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-nexus-card border border-nexus-border rounded-2xl shadow-2xl shadow-black/60 w-[460px] max-w-[95vw] overflow-hidden">
        {/* Progress bar */}
        <div className="h-1 bg-nexus-bg">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <span className="text-[10px] text-nexus-text-dim font-mono uppercase tracking-wider">
            Adım {step + 1} / {TOUR_STEPS.length}
          </span>
          <button
            onClick={handleSkip}
            className="text-nexus-text-dim hover:text-nexus-text transition-colors p-1"
            title="Turu atla"
          >
            <FiX size={14} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <div className="text-4xl mb-3">{current.icon}</div>
          <h2 className="text-lg font-bold text-nexus-text mb-2">{current.title}</h2>
          <p className="text-sm text-nexus-text-dim leading-relaxed mb-3">{current.body}</p>
          <div className="flex items-start gap-2 bg-nexus-accent/5 border border-nexus-accent/20 rounded-lg px-3 py-2">
            <span className="text-nexus-accent text-xs mt-0.5">*</span>
            <span className="text-xs text-nexus-accent/80">{current.hint}</span>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between px-5 pb-5 pt-2">
          <button
            onClick={() => setStep(s => s - 1)}
            disabled={isFirst}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition-all ${
              isFirst
                ? 'text-nexus-text-dim/30 cursor-not-allowed'
                : 'text-nexus-text-dim hover:text-nexus-text hover:bg-nexus-bg'
            }`}
          >
            <FiChevronLeft size={14} />
            Geri
          </button>

          {/* Step dots */}
          <div className="flex items-center gap-1.5">
            {TOUR_STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === step
                    ? 'bg-nexus-accent scale-125'
                    : i < step
                      ? 'bg-emerald-500/60'
                      : 'bg-nexus-border'
                }`}
              />
            ))}
          </div>

          {isLast ? (
            <button
              onClick={handleFinish}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 text-nexus-bg hover:opacity-90 transition-all"
            >
              <FiPlay size={12} />
              Başla!
            </button>
          ) : (
            <button
              onClick={() => setStep(s => s + 1)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-nexus-accent hover:bg-nexus-accent/10 transition-all"
            >
              İleri
              <FiChevronRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Export a button to re-trigger the tour
export function TourResetButton() {
  const handleReset = () => {
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  };

  return (
    <button
      onClick={handleReset}
      className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] text-nexus-text-dim hover:text-nexus-accent hover:bg-nexus-bg/50 transition-all"
      title="Tanıtım turunu tekrar göster"
    >
      <span>📖</span>
      <span>Tur</span>
    </button>
  );
}
