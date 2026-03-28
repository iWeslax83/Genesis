import { useState, useEffect } from 'react';
import { FiChevronRight, FiChevronLeft, FiX, FiPlay, FiNavigation, FiHome, FiSun, FiRefreshCw, FiBarChart2, FiClock, FiHelpCircle, FiCheck, FiBookOpen } from 'react-icons/fi';

const TOUR_STEPS = [
  {
    icon: FiNavigation,
    title: 'GENESIS\'e Hoş Geldiniz!',
    body: 'Bu simülasyon, 6 kişilik bir mürettebatın 980 günlük uzay görevinde hayatta kalmasını sağlayan kapalı döngü yaşam destek sistemini modeller.',
    hint: 'Gerçek NASA ve ESA verilerine dayanır.',
  },
  {
    icon: FiHome,
    title: 'Habitat — Yaşam Alanı',
    body: '350 m3\'luk bir alan. Mürettebat burada yaşar, nefes alır ve yemek yer. Oksijen, CO2, sıcaklık ve nem sürekli izlenir.',
    hint: 'Sol paneldeki "Genel Bakış" sayfasında habitat durumunu görebilirsiniz.',
  },
  {
    icon: FiSun,
    title: 'Bitkiler — Hayat Kaynağı',
    body: '12 farklı bitki türü 4 farklı sistemde yetişir: Aeroponik (kökler havada), NFT (ince su tabakası), Spirulina (alg tankı) ve Mantar odası.',
    hint: 'Bitkiler hem oksijen üretir hem gıda sağlar — görev başarısının anahtarı.',
  },
  {
    icon: FiRefreshCw,
    title: 'Kapalı Döngü — Her Şey Geri Dönüşür',
    body: 'Mürettebat CO2 üretir, bitkiler emer, O2 üretir. Atık su arıtılır, bitkileri sular. Bitki atıkları kompost olur, besin sağlar. Hiçbir şey boşa gitmez.',
    hint: 'Kapalılık oranı ne kadar yüksekse, dışarıdan o kadar az malzeme gerekir.',
  },
  {
    icon: FiBarChart2,
    title: 'Gösterge Paneli',
    body: '7 farklı sayfa var: Genel Bakış, Bitki İzleme, Beslenme, Güç & Enerji, Görev Planlama, Dijital İkiz ve AI Tahmin.',
    hint: 'Sayfalar arası gezinmek için sol menüyü veya 1-7 tuşlarına basın.',
  },
  {
    icon: FiClock,
    title: 'Simülasyon Kontrolü',
    body: 'Simülasyon gerçek zamanlı çalışır. Üst bardaki kontrollerle hızlandırabilir (1x-50x), durdurup devam ettirebilirsiniz.',
    hint: 'Space = Başlat/Durdur | +/- = Hız ayarı | ? = Tüm kısayollar',
  },
  {
    icon: FiHelpCircle,
    title: 'Bilgi Simgeleri',
    body: 'Anlamadığınız bir terim gördüğünde yanındaki (i) simgesine tıklayın. NDVI, PAR, EC gibi teknik terimlerin ne anlama geldiğini açıklar.',
    hint: 'Simgeler sayfalar boyunca metriklerin yanında yer alır.',
  },
  {
    icon: FiCheck,
    title: 'Hazırsınız!',
    body: 'Şimdi simülasyonu keşfetmeye başlayabilirsiniz. "Neler Oluyor?" paneli size sürekli olarak sistemin durumunu anlatacak.',
    hint: 'İyi görevler, komutan!',
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

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setVisible(false);
    onComplete?.();
  };

  if (!visible) return null;

  const current = TOUR_STEPS[step];
  const isLast = step === TOUR_STEPS.length - 1;
  const isFirst = step === 0;
  const progress = ((step + 1) / TOUR_STEPS.length) * 100;
  const IconComponent = current.icon;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 animate-fade-in">
      <div className="bg-nexus-card border border-nexus-border rounded-2xl shadow-2xl shadow-black/60 w-[460px] max-w-[95vw] overflow-hidden">
        {/* Progress bar */}
        <div className="h-1 bg-nexus-bg">
          <div
            className="h-full bg-[#4ead5b] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <span className="text-[10px] text-nexus-text-dim font-mono uppercase tracking-wider">
            Adım {step + 1} / {TOUR_STEPS.length}
          </span>
          <button
            onClick={handleDismiss}
            className="text-nexus-text-dim hover:text-nexus-text transition-colors p-1"
            title="Turu atla"
          >
            <FiX size={14} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <div className="mb-3 text-[#5b8def]">
            <IconComponent size={28} />
          </div>
          <h2 className="text-lg font-semibold text-nexus-text mb-2">{current.title}</h2>
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
                      ? 'bg-[#4ead5b]/60'
                      : 'bg-nexus-border'
                }`}
              />
            ))}
          </div>

          {isLast ? (
            <button
              onClick={handleDismiss}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#4ead5b] text-nexus-bg hover:opacity-90 transition-all"
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

// Export a button to re-trigger the tour without page reload
export function TourResetButton() {
  const [showTour, setShowTour] = useState(false);

  const handleReset = () => {
    localStorage.removeItem(STORAGE_KEY);
    setShowTour(true);
  };

  return (
    <>
      <button
        onClick={handleReset}
        className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] text-nexus-text-dim hover:text-nexus-accent hover:bg-nexus-bg/50 transition-all"
        title="Tanıtım turunu tekrar göster"
      >
        <FiBookOpen size={12} />
        <span>Tur</span>
      </button>
      {showTour && <OnboardingTour onComplete={() => setShowTour(false)} />}
    </>
  );
}
