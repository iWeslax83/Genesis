import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { FiInfo } from 'react-icons/fi';

// Plain-language explanations for scientific metrics
const METRIC_GLOSSARY = {
  // Environmental
  co2: {
    title: 'CO2 (Karbondioksit)',
    desc: 'Mürettebat nefes aldığında CO2 üretir. Bitkiler bu CO2\'yi emerek oksijen üretir. Dengede olması hayati önem taşır.',
  },
  o2: {
    title: 'O2 (Oksijen)',
    desc: 'Mürettebatın nefes alması için gereken gaz. Bitkiler ve spirulina fotosentezle oksijen üretir.',
  },
  par: {
    title: 'PAR (Fotosentetik Aktif Işık)',
    desc: 'Bitkilerin fotosentez için kullandığı ışık miktarı. LED paneller bu ışığı sağlar. Birimi: µmol/m2/s.',
  },
  ndvi: {
    title: 'NDVI (Bitki Sağlık İndeksi)',
    desc: 'Bitkilerin ne kadar sağlıklı olduğunu gösteren 0-1 arası bir değer. 0.7 üstü = sağlıklı, 0.4 altı = stresli.',
  },
  ec: {
    title: 'EC (Elektriksel İletkenlik)',
    desc: 'Suda çözünmüş besin miktarını ölçer. Çok düşükse bitkiler aç kalır, çok yüksekse kökleri yanar.',
  },
  ph: {
    title: 'pH (Asitlik/Bazlik)',
    desc: 'Besin çözeltisinin asitlik seviyesi. Çoğu bitki 5.5-6.5 aralığında en iyi besin alımını yapar.',
  },
  dli: {
    title: 'DLI (Günlük Işık İntegrali)',
    desc: 'Bir bitkinin gün boyunca aldığı toplam ışık miktarı. Meyve veren bitkiler daha fazla DLI ister.',
  },
  gdd: {
    title: 'GDD (Büyüme Derece Günü)',
    desc: 'Bitkinin ne kadar ısı biriktirdiğini ölçer. Her bitki olgunlaşmak için belirli bir GDD\'ye ulaşmalıdır.',
  },
  vpd: {
    title: 'VPD (Buhar Basıncı Açığı)',
    desc: 'Hava ile yaprak arasındaki nem farkı. Doğru VPD bitkinin su alımını ve büyümesini optimize eder.',
  },

  // Resource cycling
  closure: {
    title: 'Kapalılık Oranı',
    desc: 'Sistemin kendine ne kadar yettiğini gösterir. %100 = hiçbir kaynak dışarıdan alınmadan tamamen döngüsel.',
  },
  waterRecycle: {
    title: 'Su Geri Kazanımı',
    desc: 'Kullanılan suyun ne kadarı arıtılıp tekrar kullanılıyor. Hedef: %98+. Her damla değerli!',
  },
  calorieBalance: {
    title: 'Kalori Dengesi',
    desc: '6 kişilik mürettebat günde ~15.000 kcal ihtiyacı duyar. Bitkiler, spirulina ve mantar bu kaloriyi sağlar.',
  },

  // Systems
  blss: {
    title: 'BLSS (Biyorejeneratif Yaşam Destek)',
    desc: 'Bitki, alg ve mikroplarla hava, su ve gıda döngüsü sağlayan sistem. Uzun süreli uzay görevleri için şart.',
  },
  melissa: {
    title: 'MELiSSA Protokolü',
    desc: 'ESA\'nın geliştirdiği kapalı döngü yaşam destek modeli. 4 kompartmandan oluşur: atık, besin, büyüme, habitat.',
  },
  spirulina: {
    title: 'Spirulina',
    desc: 'Yüksek proteinli (%65) mavi-yeşil alg. Hem oksijen üretir hem besin sağlar. Uzayda ideal gıda kaynağı.',
  },
  aeroponic: {
    title: 'Aeroponik Sistem',
    desc: 'Bitki köklerini havada asılı tutup besin çözeltisi püskürten sistem. Toprak yok, %95 daha az su kullanır.',
  },
  nft: {
    title: 'NFT (Besin Filmi Tekniği)',
    desc: 'İnce bir besin çözeltisi tabakası üzerinde bitki yetiştirme. Yapraklı sebzeler için ideal.',
  },

  // Power & thermal
  powerBalance: {
    title: 'Güç Dengesi',
    desc: 'Güneş panellerinin ürettiği enerji ile sistemlerin tüketimi arasındaki fark. Negatif = enerji açığı!',
  },
  thermalBalance: {
    title: 'Isıl Denge',
    desc: 'Tüm ekipmanlar ısı üretir. Radyatörler bu ısıyı uzaya atar. Dengesizlik sıcaklık sorunlarına yol açar.',
  },

  // Crew
  radiation: {
    title: 'Radyasyon',
    desc: 'Uzayda kozmik ışınlara maruz kalım. Yüksek dozlar bitki büyümesini yavaşlatır ve sağlık riski oluşturur.',
  },
  degradation: {
    title: 'Ekipman Yıpranması',
    desc: 'Pompalar, filtreler ve LED\'ler zamanla yıpranır. Bakım yapılmazsa verimlilik düşer.',
  },
  pathogen: {
    title: 'Patojen Riski',
    desc: 'Kapalı ortamda hastalık yapıcı mikroplar yayılabilir. Erken tespit ve izolasyon kritik öneme sahip.',
  },
  traceContaminants: {
    title: 'Eser Kirleticiler',
    desc: 'Havada biriken düşük miktardaki zararlı gazlar (etilen, amonyak vb). Scrubber sistemleri bunları temizler.',
  },
};

export function getMetricInfo(key) {
  return METRIC_GLOSSARY[key] || null;
}

function TooltipPortal({ anchorRef, info, onClose }) {
  const [pos, setPos] = useState(null);
  const tooltipRef = useRef(null);

  const updatePosition = useCallback(() => {
    if (!anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    const tooltipW = 224; // w-56 = 14rem = 224px
    const tooltipH = 80;
    const pad = 8;

    let top = rect.top - pad;
    let left = rect.left + rect.width / 2;
    let placeBelow = false;

    // Üstte yer yoksa alta aç
    if (top - tooltipH < pad) {
      top = rect.bottom + pad;
      placeBelow = true;
    }

    // Yatayda ekran dışına taşmasını engelle
    if (left - tooltipW / 2 < pad) left = tooltipW / 2 + pad;
    if (left + tooltipW / 2 > window.innerWidth - pad) left = window.innerWidth - tooltipW / 2 - pad;

    setPos({ top, left, placeBelow });
  }, [anchorRef]);

  useEffect(() => {
    updatePosition();
    // Scroll ve resize'da pozisyonu güncelle
    const scrollables = document.querySelectorAll('[class*="overflow"]');
    const handler = () => updatePosition();
    window.addEventListener('scroll', handler, true);
    window.addEventListener('resize', handler);
    scrollables.forEach(el => el.addEventListener('scroll', handler));
    return () => {
      window.removeEventListener('scroll', handler, true);
      window.removeEventListener('resize', handler);
      scrollables.forEach(el => el.removeEventListener('scroll', handler));
    };
  }, [updatePosition]);

  if (!pos) return null;

  return createPortal(
    <div
      ref={tooltipRef}
      className="fixed animate-fade-in"
      style={{
        top: pos.top,
        left: pos.left,
        transform: pos.placeBelow ? 'translate(-50%, 0)' : 'translate(-50%, -100%)',
        zIndex: 99999,
      }}
      onMouseEnter={(e) => e.stopPropagation()}
      onMouseLeave={onClose}
    >
      <div className="bg-nexus-card border border-nexus-border rounded-lg px-3 py-2 shadow-xl shadow-black/50 w-56">
        <div className="text-[11px] font-semibold text-nexus-accent mb-1">{info.title}</div>
        <div className="text-[10px] text-nexus-text-dim leading-relaxed">{info.desc}</div>
      </div>
      {/* Ok işareti — üstte veya altta */}
      <div className={`w-2 h-2 bg-nexus-card border-nexus-border rotate-45 absolute left-1/2 -translate-x-1/2 ${
        pos.placeBelow ? '-top-1 border-t border-l' : '-bottom-1 border-b border-r'
      }`} />
    </div>,
    document.body
  );
}

export default function InfoTooltip({ metricKey, size = 12, className = '' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const info = METRIC_GLOSSARY[metricKey];

  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  if (!info) return null;

  return (
    <span className={`relative inline-flex items-center ${className}`} ref={ref}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="text-nexus-text-dim/40 hover:text-nexus-accent transition-colors cursor-help ml-1"
        aria-label={info.title}
      >
        <FiInfo size={size} />
      </button>
      {open && <TooltipPortal anchorRef={ref} info={info} onClose={() => setOpen(false)} />}
    </span>
  );
}
