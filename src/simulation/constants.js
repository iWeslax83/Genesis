// ============================================================
// GENESIS - Tüm Bilimsel Sabitler ve Konfigürasyon
// Referanslar: NASA VEGGIE/APH, ESA MELiSSA, BIOS-3,
//              Yuegong-1 (Lunar Palace), Eden ISS, NASA CELSS
// ============================================================

// LED Spektrum Konfigürasyonu (NASA VEGGIE / APH referans)
// VEGGIE: 12 Red : 3 Blue : 1 Green oranında
export const LED_SPECTRUM = {
  red:    { wavelength: 630, ratio: 0.50, label: 'Kırmızı',  color: '#ff2222' },
  blue:   { wavelength: 455, ratio: 0.25, label: 'Mavi',      color: '#4466ff' },
  green:  { wavelength: 530, ratio: 0.05, label: 'Yeşil',     color: '#22cc44' },
  farRed: { wavelength: 730, ratio: 0.10, label: 'Uzak Kırmızı', color: '#cc0044' },
  white:  { wavelength: 4100, ratio: 0.10, label: 'Beyaz',    color: '#ffffee' },
};

// Fotoperiod sabitleri (Eden ISS referans: 17h — 15h tam + 1h rampa)
export const PHOTOPERIOD = {
  lightOn: 6,    // saat — LED açılma
  lightOff: 22,  // saat — LED kapanma
  rampMinutes: 60, // dakika — kademeli açılma/kapanma (Eden ISS)
  totalLight: 16,  // saat — toplam aydınlık süresi
  totalDark: 8,    // saat
};

// Bitki veritabanı — Gerçek uzay deneylerine dayalı
// Seçim kriterleri (NASA CELSS): cüce boy, yüksek hasat indeksi,
// yüksek verim/m², kısa döngü, besin değeri, kendi kendine tozlaşma
export const PLANTS = {
  // ═══════ AEROPONİK MODÜL — Kök/yumru ═══════
  sweet_potato: {
    id: 'sweet_potato', name: 'Tatlı Patates', cultivar: 'Beauregard Compact', growthDays: 100,
    caloriesPer100g: 86, proteinPer100g: 1.6, carbsPer100g: 20, fatPer100g: 0.1, fiberPer100g: 3,
    yieldPerPlant: 600, waterPerDay: 0.4, area: 0.09,
    harvestIndex: 0.72,
    edibleYieldPerM2Day: 45.0,
    module: 'aeroponic', icon: '🍠',
    optimalTemp: 24, optimalPH: 5.8, optimalEC: 2.0,
    o2PerDay: 22, co2PerDay: 18,
    pollination: 'vegetative',
    ethyleneSensitivity: 'low',
    propagation: 'slip',  // Sürgün (slip) ile çoğalır — genetik sürekliliği korur
    reference: 'CELSS aday bitki — A vitamini şampiyonu (14.000 IU beta-karoten/100g). Aeroponik sisleme: 30sn püskürtme / 3dk bekleme döngüsü. B6 vitamini: 0.2mg/100g, Manganez: 0.275mg/100g, Potasyum: 335mg/100g',
    spaceHistory: 'Yuegong-1 temel mahsul. NASA CELSS uzay tarımı ilk aday — CIP (Uluslararası Patates Merkezi) Mars simülasyonu',
    growthPhases: [
      { name: 'Çimlenme',       dayStart: 0,   dayEnd: 10,  temp: 26, humidity: 85, ppfd: 0,   co2: 400,  ph: 5.8, ec: 0.5 },
      { name: 'Fide',           dayStart: 10,  dayEnd: 25,  temp: 26, humidity: 70, ppfd: 300, co2: 800,  ph: 5.8, ec: 1.2 },
      { name: 'Vejetatif',      dayStart: 25,  dayEnd: 55,  temp: 24, humidity: 65, ppfd: 450, co2: 1000, ph: 5.8, ec: 2.0 },
      { name: 'Yumru Oluşumu',  dayStart: 55,  dayEnd: 85,  temp: 22, humidity: 60, ppfd: 400, co2: 800,  ph: 5.8, ec: 2.2 },
      { name: 'Olgunlaşma',     dayStart: 85,  dayEnd: 100, temp: 20, humidity: 55, ppfd: 300, co2: 600,  ph: 5.8, ec: 1.8 },
    ],
    gddBase: 10, gddToMaturity: 1800,
    dliOptimal: 18, dliMin: 12, dliMax: 25,
    nutrientCategory: 'root',
    successionInterval: 25,
  },
  peanut: {
    id: 'peanut', name: 'Yer Fıstığı', cultivar: 'Pronto', growthDays: 120,
    caloriesPer100g: 567, proteinPer100g: 25.8, carbsPer100g: 16.1, fatPer100g: 49.2, fiberPer100g: 8.5,
    yieldPerPlant: 30, waterPerDay: 0.25, area: 0.04,
    harvestIndex: 0.35,
    edibleYieldPerM2Day: 18.75,
    module: 'aeroponic', icon: '🥜',
    optimalTemp: 26, optimalPH: 6.0, optimalEC: 1.5,
    o2PerDay: 15, co2PerDay: 12,
    pollination: 'self',
    ethyleneSensitivity: 'low',
    reference: 'En yüksek kalori yoğunluklu uzay bitkisi (567 kcal/100g). E Vitamini: 8.3mg, Niasin(B3): 12.1mg, Magnezyum: 168mg/100g. Hormon dengesi ve beyin sağlığı için ana yağ kaynağı.',
    spaceHistory: 'Yuegong-1, CELSS aday',
    growthPhases: [
      { name: 'Çimlenme',    dayStart: 0,   dayEnd: 12,  temp: 28, humidity: 75, ppfd: 0,   co2: 400,  ph: 6.0, ec: 0.5 },
      { name: 'Fide',        dayStart: 12,  dayEnd: 35,  temp: 26, humidity: 65, ppfd: 350, co2: 800,  ph: 6.0, ec: 1.2 },
      { name: 'Vejetatif',   dayStart: 35,  dayEnd: 65,  temp: 26, humidity: 60, ppfd: 450, co2: 1000, ph: 6.0, ec: 1.5 },
      { name: 'Çiçeklenme',  dayStart: 65,  dayEnd: 90,  temp: 24, humidity: 55, ppfd: 500, co2: 1000, ph: 6.0, ec: 1.8 },
      { name: 'Bakla Dolum', dayStart: 90,  dayEnd: 115, temp: 22, humidity: 50, ppfd: 400, co2: 800,  ph: 6.0, ec: 1.5 },
      { name: 'Olgunlaşma',  dayStart: 115, dayEnd: 120, temp: 20, humidity: 45, ppfd: 300, co2: 600,  ph: 6.0, ec: 1.2 },
    ],
    gddBase: 10, gddToMaturity: 1900,
    dliOptimal: 18, dliMin: 12, dliMax: 25,
    nutrientCategory: 'root',
    successionInterval: 20,
  },
  soybean: {
    id: 'soybean', name: 'Soya Fasulyesi', cultivar: 'Enrei Compact', growthDays: 80,
    caloriesPer100g: 173, proteinPer100g: 18.2, carbsPer100g: 9.9, fatPer100g: 9.0, fiberPer100g: 6.0,
    yieldPerPlant: 25, waterPerDay: 0.2, area: 0.04,
    harvestIndex: 0.40,
    edibleYieldPerM2Day: 46.4,
    module: 'aeroponic', icon: '🫘',
    optimalTemp: 25, optimalPH: 6.0, optimalEC: 1.8,
    o2PerDay: 14, co2PerDay: 11,
    pollination: 'self',
    ethyleneSensitivity: 'low',
    reference: 'Yüksek proteinli baklagil. Protein: 12.9g/100g, Demir: 5.1mg, Kalsiyum: 197mg, Folat: 165µg, Magnezyum: 86mg, Potasyum: 515mg/100g',
    spaceHistory: 'CELSS aday baklagil — yüksek protein verimi, azot fiksasyonu ile toprak iyileştirme',
    growthPhases: [
      { name: 'Çimlenme',    dayStart: 0,  dayEnd: 8,   temp: 26, humidity: 80, ppfd: 0,   co2: 400,  ph: 6.0, ec: 0.5 },
      { name: 'Fide',        dayStart: 8,  dayEnd: 20,  temp: 25, humidity: 65, ppfd: 350, co2: 800,  ph: 6.0, ec: 1.2 },
      { name: 'Vejetatif',   dayStart: 20, dayEnd: 40,  temp: 25, humidity: 60, ppfd: 450, co2: 1000, ph: 6.0, ec: 1.6 },
      { name: 'Çiçeklenme',  dayStart: 40, dayEnd: 60,  temp: 24, humidity: 55, ppfd: 500, co2: 1000, ph: 6.0, ec: 1.8 },
      { name: 'Bakla Dolum', dayStart: 60, dayEnd: 75,  temp: 22, humidity: 50, ppfd: 400, co2: 800,  ph: 6.0, ec: 1.5 },
      { name: 'Olgunlaşma',  dayStart: 75, dayEnd: 80,  temp: 20, humidity: 45, ppfd: 300, co2: 600,  ph: 6.0, ec: 1.2 },
    ],
    gddBase: 10, gddToMaturity: 1400,
    dliOptimal: 16, dliMin: 12, dliMax: 22,
    nutrientCategory: 'root',
    successionInterval: 16,
  },
  // ═══════ AEROPONİK MODÜL B — Yapraklı sebzeler ═══════
  lettuce: {
    id: 'lettuce', name: 'Kırmızı Marul', cultivar: 'Outredgeous', growthDays: 28,
    caloriesPer100g: 15, proteinPer100g: 1.4, carbsPer100g: 2.9, fatPer100g: 0.2, fiberPer100g: 1.3,
    yieldPerPlant: 200, waterPerDay: 0.15, area: 0.06,
    harvestIndex: 0.92,  // En yüksek — neredeyse tamamı yenilebilir
    edibleYieldPerM2Day: 110, // Optimize dikey aeroponik (kes-ve-tekrar-hasat)
    module: 'nft', icon: '🥬',
    optimalTemp: 21, optimalPH: 6.06, optimalEC: 2.21,
    o2PerDay: 8, co2PerDay: 6,
    pollination: 'none', // Hasat yaprak aşamasında — çiçek gerekmez
    ethyleneSensitivity: 'moderate',
    reference: 'ISS\'te yenen İLK bitki (10 Ağustos 2015). Eden ISS: 58-80 g/m²/gün',
    spaceHistory: 'VEGGIE VEG-01/03 — astronot Scott Kelly, Kjell Lindgren, Kimiya Yui yedi',
    growthPhases: [
      { name: 'Çimlenme',  dayStart: 0,  dayEnd: 3,   temp: 24, humidity: 90, ppfd: 0,   co2: 400, ph: 6.0, ec: 0.5 },
      { name: 'Fide',      dayStart: 3,  dayEnd: 8,   temp: 22, humidity: 70, ppfd: 200, co2: 800, ph: 6.0, ec: 1.0 },
      { name: 'Vejetatif', dayStart: 8,  dayEnd: 22,  temp: 20, humidity: 65, ppfd: 300, co2: 1000, ph: 6.0, ec: 1.4 },
      { name: 'Hasat',     dayStart: 22, dayEnd: 28,  temp: 18, humidity: 60, ppfd: 250, co2: 800, ph: 6.0, ec: 1.2 },
    ],
    gddBase: 4, gddToMaturity: 500,
    dliOptimal: 14, dliMin: 10, dliMax: 18,
    nutrientCategory: 'leafy',
    successionInterval: 7,
  },
  // ═══════ AEROPONİK MODÜL B — Aromatik Bitkiler (Uzay Aromatikleri) ═══════
  // Dokümantasyon: Mikrogravitede koku duyusu azalan astronotlar için
  // güçlü aromalar iştah artırıcıdır. K vitamini kaynağı.
  // Uçucu yağlar sindirimi kolaylaştırır, ağız içi bakteri dengesini korur.
  // Ödem kontrolü: uzayda sıvı kayması (fluid shift) kaynaklı ödem azaltma.
  basil: {
    id: 'basil', name: 'Fesleğen', cultivar: 'Genovese Compact', growthDays: 28,
    caloriesPer100g: 23, proteinPer100g: 3.2, carbsPer100g: 2.7, fatPer100g: 0.6, fiberPer100g: 1.6,
    yieldPerPlant: 80, waterPerDay: 0.08, area: 0.03,
    harvestIndex: 0.85,
    edibleYieldPerM2Day: 20.0,
    module: 'nft', icon: '🪴',
    optimalTemp: 22, optimalPH: 6.0, optimalEC: 1.6,
    o2PerDay: 5, co2PerDay: 4,
    pollination: 'none',
    ethyleneSensitivity: 'moderate',
    reference: 'Hidroponik sistemde hızlı gelişim ve dar alanda yüksek verim. K vitamini şampiyonu (414µg/100g)',
    spaceHistory: 'VEGGIE VEG-03 aday. Astronot morali için kritik aromatik bitki',
    growthPhases: [
      { name: 'Çimlenme',  dayStart: 0,  dayEnd: 5,   temp: 24, humidity: 85, ppfd: 0,   co2: 400, ph: 6.0, ec: 0.5 },
      { name: 'Fide',      dayStart: 5,  dayEnd: 12,  temp: 22, humidity: 70, ppfd: 200, co2: 800, ph: 6.0, ec: 1.0 },
      { name: 'Vejetatif', dayStart: 12, dayEnd: 24,  temp: 22, humidity: 65, ppfd: 300, co2: 1000, ph: 6.0, ec: 1.4 },
      { name: 'Hasat',     dayStart: 24, dayEnd: 28,  temp: 20, humidity: 60, ppfd: 250, co2: 800, ph: 6.0, ec: 1.2 },
    ],
    gddBase: 5, gddToMaturity: 450,
    dliOptimal: 14, dliMin: 10, dliMax: 20,
    nutrientCategory: 'aromatic',
    successionInterval: 7,
  },
  mint: {
    id: 'mint', name: 'Nane', cultivar: 'Spearmint Compact', growthDays: 25,
    caloriesPer100g: 70, proteinPer100g: 3.8, carbsPer100g: 14, fatPer100g: 0.9, fiberPer100g: 8,
    yieldPerPlant: 60, waterPerDay: 0.06, area: 0.02,
    harvestIndex: 0.88,
    edibleYieldPerM2Day: 20.0,
    module: 'nft', icon: '🍀',
    optimalTemp: 20, optimalPH: 6.0, optimalEC: 1.4,
    o2PerDay: 4, co2PerDay: 3,
    pollination: 'vegetative',  // Stolon ile çoğalır
    ethyleneSensitivity: 'low',
    reference: 'Düşük su ihtiyacı, yüksek antibakteriyel özellik. Sindirimi kolaylaştırır. Demir: 11.87mg/100g, Kalsiyum: 199mg/100g',
    spaceHistory: 'CELSS aday aromatik — düşük bakım, hızlı yayılım',
    growthPhases: [
      { name: 'Köklendirme', dayStart: 0,  dayEnd: 5,   temp: 22, humidity: 85, ppfd: 0,   co2: 400, ph: 6.0, ec: 0.5 },
      { name: 'Fide',        dayStart: 5,  dayEnd: 10,  temp: 20, humidity: 70, ppfd: 200, co2: 800, ph: 6.0, ec: 1.0 },
      { name: 'Vejetatif',   dayStart: 10, dayEnd: 22,  temp: 20, humidity: 65, ppfd: 250, co2: 1000, ph: 6.0, ec: 1.2 },
      { name: 'Hasat',       dayStart: 22, dayEnd: 25,  temp: 18, humidity: 60, ppfd: 200, co2: 800, ph: 6.0, ec: 1.0 },
    ],
    gddBase: 5, gddToMaturity: 380,
    dliOptimal: 12, dliMin: 8, dliMax: 18,
    nutrientCategory: 'aromatic',
    successionInterval: 6,
  },
  thyme: {
    id: 'thyme', name: 'Kekik', cultivar: 'French Compact', growthDays: 40,
    caloriesPer100g: 101, proteinPer100g: 5.6, carbsPer100g: 24.4, fatPer100g: 1.7, fiberPer100g: 14,
    yieldPerPlant: 40, waterPerDay: 0.04, area: 0.02,
    harvestIndex: 0.80,
    edibleYieldPerM2Day: 20.0,
    module: 'nft', icon: '🌿',
    optimalTemp: 20, optimalPH: 6.0, optimalEC: 1.4,
    o2PerDay: 4, co2PerDay: 3,
    pollination: 'none',
    ethyleneSensitivity: 'low',
    reference: 'Doğal antiseptik (Timol). Kapalı sistemlerde bakteri/mantar yüküne karşı ağız ve diş sağlığı. Demir: 17.4mg, Kalsiyum: 405mg, K Vitamini: 1714µg/100g',
    spaceHistory: 'CELSS aday aromatik — düşük bakım, yüksek antimikrobiyal etki',
    growthPhases: [
      { name: 'Çimlenme',  dayStart: 0,  dayEnd: 7,   temp: 22, humidity: 85, ppfd: 0,   co2: 400, ph: 6.0, ec: 0.5 },
      { name: 'Fide',      dayStart: 7,  dayEnd: 15,  temp: 20, humidity: 70, ppfd: 200, co2: 800, ph: 6.0, ec: 1.0 },
      { name: 'Vejetatif', dayStart: 15, dayEnd: 35,  temp: 20, humidity: 65, ppfd: 300, co2: 1000, ph: 6.0, ec: 1.2 },
      { name: 'Hasat',     dayStart: 35, dayEnd: 40,  temp: 18, humidity: 60, ppfd: 250, co2: 800, ph: 6.0, ec: 1.0 },
    ],
    gddBase: 5, gddToMaturity: 500,
    dliOptimal: 14, dliMin: 10, dliMax: 20,
    nutrientCategory: 'aromatic',
    successionInterval: 10,
  },
  spinach: {
    id: 'spinach', name: 'Ispanak', cultivar: 'Space Spinach Compact', growthDays: 35,
    caloriesPer100g: 23, proteinPer100g: 2.9, carbsPer100g: 3.6, fatPer100g: 0.4, fiberPer100g: 2.2,
    yieldPerPlant: 80, waterPerDay: 0.08, area: 0.04,
    harvestIndex: 0.85,
    edibleYieldPerM2Day: 110,
    module: 'nft', icon: '🥬',
    optimalTemp: 18, optimalPH: 6.2, optimalEC: 1.8,
    o2PerDay: 6, co2PerDay: 5,
    pollination: 'none',
    ethyleneSensitivity: 'moderate',
    reference: 'K vitamini şampiyonu (482.9µg/100g). Folat: 194µg/100g, Demir: 2.7mg/100g, Kalsiyum: 99mg/100g, Magnezyum: 79mg/100g',
    spaceHistory: 'CELSS aday yapraklı sebze — yüksek besin yoğunluğu, hızlı büyüme',
    growthPhases: [
      { name: 'Çimlenme',  dayStart: 0,  dayEnd: 5,   temp: 20, humidity: 85, ppfd: 0,   co2: 400, ph: 6.2, ec: 0.5 },
      { name: 'Fide',      dayStart: 5,  dayEnd: 12,  temp: 18, humidity: 70, ppfd: 200, co2: 800, ph: 6.2, ec: 1.0 },
      { name: 'Vejetatif', dayStart: 12, dayEnd: 30,  temp: 18, humidity: 65, ppfd: 300, co2: 1000, ph: 6.2, ec: 1.6 },
      { name: 'Hasat',     dayStart: 30, dayEnd: 35,  temp: 16, humidity: 60, ppfd: 250, co2: 800, ph: 6.2, ec: 1.4 },
    ],
    gddBase: 4, gddToMaturity: 500,
    dliOptimal: 14, dliMin: 10, dliMax: 18,
    nutrientCategory: 'leafy',
    successionInterval: 8,
  },
};

// Mürettebat sabitleri (NASA BVAD Rev2 — NASA/TP-2015-218570)
// O₂: 0.84 kg/gün = ~630 L/gün (kabin: 21°C, 101.3 kPa)
//   Hesap: 0.84kg / 0.032kg/mol = 26.25 mol × 24.04 L/mol(@21°C) = 631 L
// CO₂: 1.00 kg/gün = ~550 L/gün (kabin: 21°C, 101.3 kPa)
//   Hesap: 1.00kg / 0.044kg/mol = 22.73 mol × 24.04 L/mol(@21°C) = 547 L
// RQ (solunum katsayısı): 0.87 (NASA BVAD)
export const CREW = {
  count: 1,
  o2PerPersonPerDay: 630,      // litre (kabin basıncında — 101.3 kPa, 21°C)
  co2PerPersonPerDay: 550,     // litre
  waterPerPersonPerDay: 3.8,   // litre (içme + yemek)
  caloriePerPersonPerDay: 2500, // kcal (uzay görevi ortalaması — NASA: 2500-3000)
  wastePerPersonPerDay: 1.8,   // kg (dışkı + idrar + gıda atığı)
  members: [
    { id: 1, name: 'Cmdr. Yıldız',  role: 'Komutan',   calorie: 2500 },
  ],
};

// Sistem limitleri (alarm eşikleri)
export const LIMITS = {
  o2: { min: 19.5, max: 23.5, critical: 18.0, unit: '%' },
  co2: { min: 0.02, max: 0.5, critical: 1.0, unit: '%' },
  temperature: { min: 18, max: 30, critical: 35, unit: '°C' },
  humidity: { min: 30, max: 80, critical: 90, unit: '%' },
  pH: { min: 5.0, max: 7.0, critical: 4.0, unit: '' },
  ec: { min: 0.5, max: 4.0, critical: 5.0, unit: 'mS/cm' },
  par: { min: 100, max: 1000, critical: 50, unit: 'µmol/m²/s' },
  ethylene: { min: 0, max: 25, critical: 50, unit: 'ppb' }, // APH: ≤25 ppb
};

// Etilen kontrolü (NASA APH referans — bitki gelişimi için kritik)
// Kapalı ortamda etilen birikimi meyve olgunlaşmasını hızlandırır ve yaprak dökümüne neden olur
export const ETHYLENE = {
  maxSafe: 25,          // ppb (APH scrubber hedefi)
  critical: 50,         // ppb
  plantEmission: 0.5,   // ppb/saat/m² bitki alanı
  scrubberRate: 0.85,   // scrubber verimlilik oranı
};

// Modül alanları (3 Katlı Dikey Aeroponik Sistem — kat başı 15.7 m², toplam 47 m²)
export const MODULE_AREAS = {
  aeroponic: 42,    // m² (Tatlı Patates 20 + Soya 14 + Yer Fıstığı 8)
  nft: 5,           // m² (Aeroponik Yaprak: Yeşillik 3.5 + Mikro Filiz & Baharat 1.5)
};

// Sensör konfigürasyonları (simülasyon için)
// Toplam 180+ sensör (APH referans) — modül başına temsili sensörler
export const SENSOR_CONFIGS = {
  aeroponic: {
    temperature: { base: 24, amplitude: 1.5, period: 24, noiseLevel: 0.3, trend: 0 },
    humidity: { base: 65, amplitude: 5, period: 24, noiseLevel: 1.5, trend: 0 },
    co2: { base: 1000, amplitude: 200, period: 24, noiseLevel: 25, trend: 0 }, // Eden ISS: 1000 ppm setpoint
    pH: { base: 5.8, amplitude: 0.08, period: 48, noiseLevel: 0.03, trend: 0 },
    ec: { base: 2.21, amplitude: 0.15, period: 72, noiseLevel: 0.08, trend: 0 }, // Eden ISS: 2.21±0.13
    par: { base: 450, amplitude: 350, period: 24, noiseLevel: 10, trend: 0, nightZero: true },
    ethylene: { base: 12, amplitude: 5, period: 24, noiseLevel: 2, trend: 0 }, // ppb
  },
  nft: {
    temperature: { base: 21, amplitude: 1.2, period: 24, noiseLevel: 0.25, trend: 0 }, // Eden ISS: 21°C foto/19°C dark
    humidity: { base: 65, amplitude: 4, period: 24, noiseLevel: 1.2, trend: 0 }, // Eden ISS: 65% setpoint
    co2: { base: 1000, amplitude: 150, period: 24, noiseLevel: 20, trend: 0 },
    pH: { base: 6.06, amplitude: 0.1, period: 48, noiseLevel: 0.04, trend: 0 }, // Eden ISS: 6.06±0.18
    ec: { base: 2.21, amplitude: 0.12, period: 72, noiseLevel: 0.06, trend: 0 },
    par: { base: 400, amplitude: 300, period: 24, noiseLevel: 8, trend: 0, nightZero: true },
    ethylene: { base: 15, amplitude: 6, period: 24, noiseLevel: 2.5, trend: 0 },
  },
  habitat: {
    o2: { base: 21.0, amplitude: 0.15, period: 24, noiseLevel: 0.05, trend: 0 },
    co2: { base: 0.04, amplitude: 0.005, period: 24, noiseLevel: 0.002, trend: 0 },
    temperature: { base: 22, amplitude: 0.8, period: 24, noiseLevel: 0.15, trend: 0 },
    humidity: { base: 50, amplitude: 3, period: 24, noiseLevel: 0.8, trend: 0 },
    ethylene: { base: 10, amplitude: 4, period: 24, noiseLevel: 1.5, trend: 0 },
  },
};

// Kapalılık oranı hedefleri (gerçek projelerden)
export const CLOSURE_TARGETS = {
  o2:       { target: 100, reference: 'Yuegong-1: %100 O₂ geri kazanımı' },
  co2:      { target: 100, reference: 'Yuegong-1: %100 CO₂ geri kazanımı' },
  water:    { target: 98,  reference: 'Yuegong-1: %100, BIOS-3: %85' },
  food:     { target: 80,  reference: 'Yuegong-1: %80 gıda döngüsü' },
  material: { target: 98,  reference: 'Yuegong-1: %98.2 malzeme geri dönüşümü' },
};

// What-if senaryoları (gerçek arıza modlarına dayalı)
export const SCENARIOS = [
  {
    id: 'led_failure',
    name: 'LED Panel Arızası',
    icon: '💡',
    description: 'Aeroponik modülün LED panellerinin %50\'si devre dışı (Eden ISS: LED soğutma arızası)',
    severity: 'warning',
    effects: { aeroponicPAR: 0.5, aeroponicGrowth: 0.6 },
    duration: 14,
  },
  {
    id: 'water_leak',
    name: 'Su Kaçağı',
    icon: '💧',
    description: 'Su arıtma sisteminde %20 kayıp (ISS su geri kazanım sistemi arızası referans)',
    severity: 'critical',
    effects: { waterRecycleRate: 0.78 },
    duration: 7,
  },
  {
    id: 'co2_spike',
    name: 'CO₂ Yükselişi',
    icon: '🌫️',
    description: 'Havalandırma arızası — CO₂ seviyesi yükseliyor (ISS CO₂ scrubber arızası)',
    severity: 'critical',
    effects: { habitatCO2: 1.8 },
    duration: 3,
  },
  {
    id: 'crew_increase',
    name: 'Mürettebat Artışı',
    icon: '👨‍🚀',
    description: 'Acil durum: 1 ek mürettebat üyesi — kaynak yükü 2 katına çıkıyor',
    severity: 'warning',
    effects: { crewCount: 2 },
    duration: 30,
  },
  {
    id: 'ethylene_buildup',
    name: 'Etilen Birikimi',
    icon: '⚗️',
    description: 'Etilen scrubber arızası — bitkilerde erken olgunlaşma ve yaprak dökümü riski (APH referans)',
    severity: 'warning',
    effects: { ethyleneMultiplier: 3.0 },
    duration: 10,
  },
];

// Başlangıçta ekili bitkiler (3 Katlı Dikey Aeroponik Sistem — kat başı 15.7 m², toplam 47 m²)
//
// Alan hesabı (5 sütun modülü × 3 kat):
//   Sütun 1: Tatlı Patates — 20 m² (222 bitki × 0.09)
//   Sütun 2: Soya Fasulyesi — 14 m² (350 bitki × 0.04)
//   Sütun 3: Yer Fıstığı — 8 m² (200 bitki × 0.04)
//   Sütun 4: Yeşillik — 3.5 m² (marul 35×0.06 + ıspanak 35×0.04)
//   Sütun 5: Mikro Filiz & Baharat — 1.5 m² (fesleğen 30×0.03 + nane 30×0.02)
//
// Kademeli ekim: sürekli hasat garantisi
export const INITIAL_PLANTS = {
  aeroponic: [
    // Tatlı Patates: 3 kademe (100 gün döngü → ~33 gün aralık) — 20 m²
    { type: 'sweet_potato', plantedDay: -97, count: 74 },  // hasada 3 gün
    { type: 'sweet_potato', plantedDay: -64, count: 74 },  // %64 olgun
    { type: 'sweet_potato', plantedDay: -31, count: 74 },  // %31 olgun
    // Soya Fasulyesi: 3 kademe (80 gün döngü → ~27 gün aralık) — 14 m²
    { type: 'soybean', plantedDay: -77, count: 117 },      // hasada 3 gün
    { type: 'soybean', plantedDay: -50, count: 117 },      // %63 olgun
    { type: 'soybean', plantedDay: -23, count: 116 },      // %29 olgun
    // Yer Fıstığı: 3 kademe (120 gün döngü → 40 gün aralık) — 8 m²
    { type: 'peanut', plantedDay: -117, count: 67 },       // hasada 3 gün
    { type: 'peanut', plantedDay: -77, count: 67 },        // %64 olgun
    { type: 'peanut', plantedDay: -37, count: 66 },        // %31 olgun
  ],
  nft: [
    // Marul: 2 kademe (28 gün döngü → ~14 gün aralık) — 2.1 m²
    { type: 'lettuce', plantedDay: -26, count: 18 },       // hasada 2 gün
    { type: 'lettuce', plantedDay: -12, count: 17 },       // %43 olgun
    // Ispanak: 2 kademe (35 gün döngü → ~17 gün aralık) — 1.4 m²
    { type: 'spinach', plantedDay: -33, count: 18 },       // hasada 2 gün
    { type: 'spinach', plantedDay: -16, count: 17 },       // %46 olgun
    // ═══ Mikro Filiz & Aromatik Bitkiler ═══
    // Fesleğen: 2 kademe (28 gün döngü → 14 gün aralık) — 0.9 m²
    { type: 'basil', plantedDay: -26, count: 15 },         // hasada 2 gün
    { type: 'basil', plantedDay: -12, count: 15 },         // %43 olgun
    // Nane: 1 kademe (25 gün, stolon ile sürekli yayılım) — 0.4 m²
    { type: 'mint', plantedDay: -23, count: 20 },          // hasada 2 gün
    // Kekik: 2 kademe (40 gün döngü → 20 gün aralık) — 0.3 m²
    { type: 'thyme', plantedDay: -38, count: 8 },          // hasada 2 gün
    { type: 'thyme', plantedDay: -18, count: 7 },          // %45 olgun
  ],
};

// MELiSSA mimarisi bazlı kompartman tanımları
export const COMPARTMENTS = {
  waste: {
    id: 'waste',
    name: 'Anaerobik Fermenter',
    shortName: 'C1',
    color: '#ff8800',
    icon: '♻️',
    description: 'MELiSSA C1 — Termofil anaerobik ayrıştırma (55°C)',
    melissaRef: 'Compartment 1: Liquefying/Anaerobic Fermenter',
  },
  nutrient: {
    id: 'nutrient',
    name: 'Nitrifikasyon',
    shortName: 'C3',
    color: '#c084fc',
    icon: '🧪',
    description: 'MELiSSA C3 — Nitrosomonas + Nitrobacter biyofilm reaktör',
    melissaRef: 'Compartment 3: NH₄⁺ → NO₂⁻ → NO₃⁻',
  },
  growth: {
    id: 'growth',
    name: 'Fotobiyoreaktör + Bitki',
    shortName: 'C4',
    color: '#22c55e',
    icon: '🌱',
    description: 'MELiSSA C4b — Üst bitkiler (Aeroponik dikey çiftlik sistemi)',
    melissaRef: 'Compartment 4a+4b: Photobioreactor + Higher Plants',
  },
  habitat: {
    id: 'habitat',
    name: 'Mürettebat Modülü',
    shortName: 'C5',
    color: '#3b82f6',
    icon: '👨‍🚀',
    description: 'MELiSSA C5 — Yaşam alanı ve metabolik gaz değişimi',
    melissaRef: 'Compartment 5: Crew (MELiSSA pilot: lab rats)',
  },
};

// Habitat hacmi (gaz simülasyonu için — tek kişilik kompakt modül)
export const HABITAT_VOLUME = 40000; // litre (40 m³)

// Simülasyon zaman dilimi: 1 tick = 5 dakika = 1/288 gün
export const TICK_FRACTION = 1 / 288;

// ============================================================
// BESİN ÇÖZELTİSİ REÇETELERİ (Hoagland & Arnon 1950 bazlı)
// ============================================================
export const NUTRIENT_RECIPES = {
  leafy: {
    label: 'Yapraklı Sebze',
    N: 180, P: 40, K: 220, Ca: 180, Mg: 50, S: 65, Fe: 3,
    B: 0.5, Mn: 0.5, Zn: 0.05, Cu: 0.02, Mo: 0.01,
    pH: 6.0, EC: 1.4, unit: 'ppm',
    crops: ['lettuce', 'spinach'],
  },
  root: {
    label: 'Kök/Yumru Bitkileri',
    N: 140, P: 60, K: 250, Ca: 150, Mg: 40, S: 55, Fe: 3,
    B: 0.5, Mn: 0.5, Zn: 0.05, Cu: 0.02, Mo: 0.01,
    pH: 5.8, EC: 2.0, unit: 'ppm',
    crops: ['sweet_potato', 'soybean', 'peanut'],
  },
  aromatic: {
    label: 'Aromatik Bitkiler',
    N: 150, P: 45, K: 200, Ca: 160, Mg: 45, S: 55, Fe: 3,
    B: 0.5, Mn: 0.5, Zn: 0.05, Cu: 0.02, Mo: 0.01,
    pH: 6.0, EC: 1.4, unit: 'ppm',
    crops: ['basil', 'mint', 'thyme'],
  },
};

// ============================================================
// ÇÖZÜNMÜŞ OKSİJEN MODELİ (Hidroponik Kök Sağlığı)
// ============================================================
export const DISSOLVED_OXYGEN = {
  // DO doyma kapasitesi (mg/L) = 14.6 - 0.39*T + 0.007*T² (sıcaklık °C)
  saturationCoeffs: { a: 14.6, b: -0.39, c: 0.007 },
  minHealthy: 5.0,      // mg/L — altında kök sağlığı risk
  critical: 3.0,        // mg/L — altında Pythium riski yüksek
  aerationEfficiency: 0.85, // Pompalarla aerasyon verimi
  rootUptakeRate: 0.8,  // mg/L/saat — bitki köklerinin O₂ tüketimi
  pythiumRiskThreshold: 4.0, // mg/L — altında Pythium oluşma riski artar
};

// ============================================================
// ARDIŞ EKİM (Succession Planting) Sabitleri
// ============================================================
export const SUCCESSION = {
  maxBatchesPerCrop: 5,       // Bir bitkiden maks eşzamanlı parti
  minHarvestGap: 3,           // gün — ardışık hasatlar arası min süre
  autoReplant: true,          // Hasat sonrası otomatik yeniden ekim
  staggerPercent: 0.2,        // Her yeni partide %20 bitki sayısı azaltma
};

// Vitamin/mineral veritabanı
export const VITAMINS = {
  A:       { name: 'A Vitamini',   unit: 'µg', dailyNeed: 900,  sources: { sweet_potato: 4200, basil: 527, spinach: 469, mint: 424, lettuce: 370, soybean: 9 } },
  C:       { name: 'C Vitamini',   unit: 'mg', dailyNeed: 90,   sources: { thyme: 160, mint: 31, spinach: 28, basil: 18, lettuce: 9, soybean: 6, sweet_potato: 2.4 } },
  K:       { name: 'K Vitamini',   unit: 'µg', dailyNeed: 120,  sources: { thyme: 1714, spinach: 482.9, mint: 458, basil: 414, lettuce: 126, soybean: 26.7 } },
  E:       { name: 'E Vitamini',   unit: 'mg', dailyNeed: 15,   sources: { peanut: 8.3, soybean: 0.9 } },
  B3:      { name: 'Niasin (B3)',  unit: 'mg', dailyNeed: 16,   sources: { peanut: 12.1, sweet_potato: 0.6, soybean: 0.4 } },
  B6:      { name: 'B6 Vitamini',  unit: 'mg', dailyNeed: 1.3,  sources: { sweet_potato: 0.2, soybean: 0.1 } },
  iron:    { name: 'Demir',        unit: 'mg', dailyNeed: 8,    sources: { thyme: 17.4, peanut: 15, soybean: 5.1, mint: 5, basil: 3.2, spinach: 2.7 } },
  calcium: { name: 'Kalsiyum',     unit: 'mg', dailyNeed: 1000, sources: { thyme: 405, peanut: 275, mint: 243, soybean: 197, basil: 177, spinach: 99 } },
  folat:   { name: 'Folat (B9)',   unit: 'µg', dailyNeed: 400,  sources: { peanut: 375, spinach: 194, mint: 152, soybean: 54, lettuce: 38 } },
  magnesium: { name: 'Magnezyum', unit: 'mg', dailyNeed: 420,  sources: { peanut: 168, soybean: 86, mint: 80, spinach: 79, basil: 64 } },
  potassium: { name: 'Potasyum',  unit: 'mg', dailyNeed: 2600, sources: { peanut: 705, mint: 569, spinach: 558, soybean: 515, sweet_potato: 337, lettuce: 194 } },
};

// ============================================================
// GÜÇ VE ENERJİ SİSTEMİ (NASA BVAD, Kilopower, Eden ISS)
// ============================================================
export const POWER = {
  // Alt sistem güç tüketimi (kW) — 33 m² dikey aeroponik sistem
  subsystems: {
    ledLighting:    { base: 14.0, label: 'LED Aydınlatma',         priority: 3 },  // ~0.42 kW/m² × 33 m²
    thermalHVAC:    { base: 4.0,  label: 'Isıl Kontrol / HVAC',    priority: 1 },
    waterProcessing:{ base: 1.5,  label: 'Su İşleme',              priority: 2 },
    atmosphere:     { base: 1.5,  label: 'Atmosfer Yönetimi',       priority: 1 },
    sensors:        { base: 0.8,  label: 'Sensör ve Kontrol',       priority: 1 },
    wasteProcessing:{ base: 0.5,  label: 'Atık İşleme',            priority: 3 },
    crewSupport:    { base: 0.3,  label: 'Mürettebat Desteği',     priority: 2 },
  },
  // Güç kaynakları (33 m² dikey çiftlik: 2 Kilopower + güneş paneli)
  sources: {
    solar:   { capacity: 12, efficiency: 0.30, area: 80, degradationPerYear: 0.02, label: 'Güneş Paneli' },
    nuclear: { capacity: 10, units: 2, totalCapacity: 20, mass: 3000, lifetime: 15, label: 'Kilopower Reaktör' },
  },
  // Konum bazlı güneş verimi (W/m²)
  solarByLocation: {
    leo:         { avg: 155, label: 'LEO (ISS)' },
    lunarEquator:{ avg: 70,  label: 'Ay Ekvator' },
    lunarPoles:  { avg: 200, label: 'Ay Kutupları' },
    marsOrbit:   { avg: 70,  label: 'Mars Yörünge' },
    marsSurface: { avg: 52,  label: 'Mars Yüzeyi' },
  },
  location: 'marsSurface', // Varsayılan konum
  sourceType: 'solar',     // 'solar' veya 'nuclear'
  // LED verimlilik zinciri
  ledEfficiency: {
    wallPlug: 0.50,        // Elektrik → foton: %50
    parFraction: 1.0,      // Hedefli LED'ler: %100
    canopyAbsorption: 0.90,
    photosynthesis: 0.08,  // Kuantum verimi maks: %8
    harvestIndex: 0.50,
    overall: 0.018,        // ~%1.8 elektrik → yenilebilir biyokütle
  },
};

// ============================================================
// ISIL KONTROL SİSTEMİ
// ============================================================
export const THERMAL = {
  // Isı kaynakları
  crewMetabolicHeat: {
    sleep: 80,          // W/kişi
    rest: 105,
    lightWork: 170,
    moderateWork: 240,
    heavyExercise: 500,
    eva: 320,
    dailyAverage: 125,  // W/kişi (NASA HIDH)
  },
  avionicsHeat: 2.0,     // kW
  // Radyatör (küçük ölçek)
  radiator: {
    area: 25,             // m²
    emissivity: 0.88,
    operatingTemp: 300,   // K
    sinkTemp: 220,        // K (Mars çevresi)
    maxRejection: 6,      // kW (Stefan-Boltzmann hesabı)
  },
  // Kabin
  cabin: {
    thermalMass: 50000,   // J/K (hava ~40m³ + yapı/ekipman)
    targetTemp: 22,       // °C
    minSafe: 15,
    maxSafe: 30,
    criticalLow: 5,
    criticalHigh: 40,
  },
};

// ============================================================
// BİLEŞEN BOZULMA MODELLERİ
// ============================================================
export const DEGRADATION = {
  hepaFilter: {
    lifespanDays: 1095,       // ~3 yıl
    pressureDropThreshold: 1.5, // Nominal'in katı
    label: 'HEPA Filtre',
  },
  carbonBed: {
    lifespanDays: 365,        // ~1 yıl
    saturationCurve: 'sigmoid',
    label: 'Aktif Karbon Yatak',
  },
  waterPump: {
    weibullBeta: 2.0,         // Şekil parametresi
    weibullEta: 15000,        // Saat (karakteristik ömür)
    label: 'Su Pompası',
  },
  led: {
    l70Hours: 35000,          // L70 ömrü (saat)
    alphaDecay: 0.00001,      // Üstel azalma katsayısı
    radiationPenalty: 0.25,   // Uzayda %25 ek bozulma
    label: 'LED Paneller',
  },
  co2Scrubber: {
    lifespanDays: 730,        // ~2 yıl
    label: 'CO₂ Temizleyici',
  },
};

// ============================================================
// MÜRETTEBAT AKTİVİTE MODELİ (NASA BVAD)
// ============================================================
export const CREW_ACTIVITIES = {
  sleep:         { duration: 8,   o2Rate: 0.020, co2Factor: 0.87, heatW: 80,  calPerHour: 69,  label: 'Uyku' },
  rest:          { duration: 3,   o2Rate: 0.025, co2Factor: 0.87, heatW: 105, calPerHour: 90,  label: 'Dinlenme' },
  lightWork:     { duration: 8,   o2Rate: 0.040, co2Factor: 0.87, heatW: 170, calPerHour: 146, label: 'Hafif İş' },
  exercise:      { duration: 2,   o2Rate: 0.090, co2Factor: 0.87, heatW: 500, calPerHour: 430, label: 'Egzersiz' },
  gardening:     { duration: 2,   o2Rate: 0.035, co2Factor: 0.87, heatW: 150, calPerHour: 130, label: 'Bahçecilik' },
  meals:         { duration: 1,   o2Rate: 0.030, co2Factor: 0.87, heatW: 120, calPerHour: 100, label: 'Yemek' },
};

// Varsayılan günlük program (saat bazlı)
export const DEFAULT_CREW_SCHEDULE = [
  { activity: 'sleep',     startHour: 22, endHour: 6  },
  { activity: 'meals',     startHour: 6,  endHour: 7  },
  { activity: 'exercise',  startHour: 7,  endHour: 9  },
  { activity: 'lightWork', startHour: 9,  endHour: 13 },
  { activity: 'meals',     startHour: 13, endHour: 14 },
  { activity: 'gardening', startHour: 14, endHour: 16 },
  { activity: 'lightWork', startHour: 16, endHour: 20 },
  { activity: 'rest',      startHour: 20, endHour: 22 },
];

// ============================================================
// NDVI BİTKİ SAĞLIĞI MODELİ (Eden ISS referans)
// ============================================================
export const NDVI = {
  healthy:       { min: 0.70, max: 0.95 },
  warning:       { min: 0.50, max: 0.70 },
  critical:      { min: 0.00, max: 0.50 },
  alertDropRate: 0.10,       // 48 saatte >0.10 düşüş → uyarı
  growthCurve: 'sigmoid',    // Çimlenme → hasat sigmoid NDVI eğrisi
};

// ============================================================
// PATOJEN MODELİ (Eden ISS, ISS Veggie referans)
// ============================================================
export const PATHOGENS = {
  powderyMildew: {
    id: 'powderyMildew', name: 'Külleme',
    optimalTemp: 24, optimalHumidity: 70,
    spreadRate: 0.05,       // Gün başına yayılma oranı
    yieldReduction: 0.30,   // %30 verim kaybı
    detectionLag: 3,        // NDVI ile 3 gün önce tespit
  },
  rootRot: {
    id: 'rootRot', name: 'Kök Çürümesi',
    optimalTemp: 26, optimalHumidity: 95,
    spreadRate: 0.03,
    yieldReduction: 0.50,
    detectionLag: 5,
  },
  fungalMold: {
    id: 'fungalMold', name: 'Mantar Küfü',
    optimalTemp: 22, optimalHumidity: 85,
    spreadRate: 0.07,
    yieldReduction: 0.40,
    detectionLag: 2,        // ISS Veg-03 zinnya küfü referansı
  },
};

// ============================================================
// ÇOK AŞAMALI SU İŞLEME (MELiSSA + Yuegong-1)
// ============================================================
export const WATER_PROCESSING = {
  stages: {
    condensate: {
      label: 'Bitki Terleme Yoğunlaşması',
      efficiency: 0.95,
      fraction: 0.75, // Toplam geri kazanımın %75'i
    },
    urineProcessing: {
      label: 'İdrar İşleme (VCD)',
      efficiency: 0.85,
      fraction: 0.20,
    },
    polishing: {
      label: 'Son İşlem (UV + Karbon)',
      efficiency: 0.99,
      fraction: 0.05,
    },
  },
  overallTarget: 0.987,    // Yuegong-1: %98.7
  bufferCapacityPerPerson: 50, // L
  tocLimit: 0.5,            // mg/L (potable su limiti)
  microbialLimit: 100,      // CFU/mL
};

// ============================================================
// ESER KİRLETİCİ KONTROL (ISS TCCS referans)
// ============================================================
export const TRACE_CONTAMINANTS = {
  ammonia:      { name: 'Amonyak',       unit: 'mg/m³', smac180: 7.0,  baseRate: 0.05,  scrubberEff: 0.90, source: 'Mürettebat metabolizması' },
  formaldehyde: { name: 'Formaldehit',   unit: 'mg/m³', smac180: 0.05, baseRate: 0.002, scrubberEff: 0.95, source: 'Polimer gaz salımı' },
  co:           { name: 'Karbon Monoksit',unit: 'mg/m³', smac180: 17.0, baseRate: 0.083, scrubberEff: 0.95, source: 'Ekipman, metabolizma' },
  methane:      { name: 'Metan',         unit: 'mg/m³', smac180: 3800, baseRate: 0.167, scrubberEff: 0.80, source: 'Mürettebat, malzeme' },
  voc:          { name: 'Toplam VOC',    unit: 'mg/m³', smac180: 25.0, baseRate: 0.083, scrubberEff: 0.85, source: 'Yapıştırıcılar, contalar' },
};
export const TCCS = {
  carbonBedMass: 22,        // kg
  catalystTemp: 400,        // °C
  powerDraw: 0.12,          // kW
  carbonLifespan: 1460,     // gün (~4 yıl)
};

// ============================================================
// RADYASYON MODELİ (GCR + SPE)
// ============================================================
export const RADIATION = {
  gcr: {
    dailyDose: 0.0005,     // Gy/gün (serbest uzay)
    marsSurface: 0.0002,   // Mars yüzeyinde atmosfer kalkanlaması
    shieldingFactor: 0.5,  // Habitat kalkanlaması
  },
  spe: {
    probability: 0.003,    // Gün başına büyük SPE olasılığı (~1/yıl)
    minDose: 0.05,         // Gy (küçük olay)
    maxDose: 0.5,          // Gy (büyük olay, kalkanlanmış)
    durationDays: 2,
  },
  cropSensitivity: {
    sweet_potato: 0.6, soybean: 0.5, peanut: 0.5,  // Aeroponik — yüksek dayanıklılık
    lettuce: 0.3, spinach: 0.3,      // Aeroponik Yaprak — düşük dayanıklılık
    basil: 0.3, mint: 0.3, thyme: 0.3, // Aromatik — orta-düşük dayanıklılık
  },
  seedTolerance: 100,      // Gy — kuru tohumlar çok dayanıklı
};

// ============================================================
// GÖREV PLANLAMA VE ERZAK TAMPONU
// ============================================================
export const MISSION = {
  phases: [
    { id: 'transit1',  name: 'Dünya-Mars Transit', durationDays: 240, blssActive: false },
    { id: 'surface',   name: 'Mars Yüzey Operasyonları', durationDays: 500, blssActive: true },
    { id: 'transit2',  name: 'Mars-Dünya Dönüş', durationDays: 240, blssActive: false },
  ],
  storedFood: {
    perPersonPerDay: 1.8,   // kg (ambalaj dahil)
    shelfLifeYears: 5,
    caloriesPerKg: 1800,    // kcal/kg ortalama
  },
  blssRampUpDays: 120,       // İlk hasat: 60-120 gün
  emergencyReserveDays: 90,  // Acil durum yedek erzak
  seedMassPerM2: 0.75,       // kg/m² (döngü başına)
};

// ============================================================
// MORAL VE PSİKOLOJİK İYİLİK HALİ
// ============================================================
export const MORALE = {
  factors: {
    foodVariety:     { weight: 0.25, label: 'Gıda Çeşitliliği' },
    freshFood:       { weight: 0.20, label: 'Taze Gıda Oranı' },
    lastHarvest:     { weight: 0.15, label: 'Son Hasat Süresi' },
    workload:        { weight: 0.15, label: 'İş Yükü' },
    gardeningTime:   { weight: 0.15, label: 'Bahçecilik Süresi' },
    luxuryCrops:     { weight: 0.10, label: 'Lüks Ürünler' },
  },
  luxuryCrops: ['basil', 'mint', 'thyme', 'spinach'],
  lowMoraleThreshold: 40,    // 0-100 — altında verimlilik düşer
  efficiencyPenalty: 0.15,   // Düşük moralde %15 verimlilik kaybı
};

// ============================================================
// YERÇEKİMİ SEVİYELERİ
// ============================================================
export const GRAVITY_LEVELS = {
  iss:   { g: 0.00, label: 'ISS (Mikro-g)',   plantMultiplier: 0.85, waterFlowMod: 0.70 },
  moon:  { g: 0.16, label: 'Ay (0.16g)',      plantMultiplier: 0.90, waterFlowMod: 0.85 },
  mars:  { g: 0.38, label: 'Mars (0.38g)',    plantMultiplier: 0.95, waterFlowMod: 0.92 },
  earth: { g: 1.00, label: 'Dünya (1g)',      plantMultiplier: 1.00, waterFlowMod: 1.00 },
};

// Referans projeler (UI gösterimi için)
export const REFERENCE_PROJECTS = [
  { id: 'veggie',   name: 'NASA VEGGIE',    year: '2014-', desc: 'ISS üzerinde bitki yetiştirme — ilk uzayda yenen marul (2015)' },
  { id: 'aph',      name: 'NASA APH',       year: '2017-', desc: '180+ sensörlü tam otomatik bitki habitatı — PHARMER telemetri' },
  { id: 'melissa',  name: 'ESA MELiSSA',    year: '1989-', desc: '5 kompartmanlı kapalı döngü ekosistem — pilot tesis Barcelona' },
  { id: 'bios3',    name: 'BIOS-3',         year: '1972',  desc: '315 m³ kapalı habitat — 180 gün, 3 kişi, Krasnoyarsk' },
  { id: 'yuegong1', name: 'Yuegong-1',      year: '2017',  desc: '370 gün, 4 kişi — %98.2 malzeme geri dönüşümü, böcek protein' },
  { id: 'edeniss',  name: 'Eden ISS',       year: '2018',  desc: 'Antarktika serası — 268 kg hasat, 12.5 m², 286 gün' },
  { id: 'celss',    name: 'NASA CELSS BPC', year: '1988-', desc: '20 m², 481 kg biyokütle, 540 kg O₂ üretimi — 1200+ gün' },
];

// Besin kaynağı renkleri (NutritionPage ve diğer bileşenler için)
export const SOURCE_COLORS = {
  aeroponic: '#4ead5b',
  nft: '#4a9caa',
};

export const SOURCE_LABELS = {
  aeroponic: 'Aeroponik Kök',
  nft: 'Aeroponik Yaprak',
};

// ============================================================
// AEROPONİK SİSLEME DÖNGÜSÜ (Tatlı Patates optimizasyonu)
// Köklerin kurumadan maksimum oksijen almasını sağlar, çürümeyi engeller
// ============================================================
export const AEROPONIC_MISTING = {
  sprayDuration: 30,    // saniye — püskürtme süresi
  waitDuration: 180,    // saniye (3 dakika) — bekleme süresi
  cycleTotal: 210,      // saniye — toplam döngü
  cyclesPerHour: 17.1,  // döngü/saat
  purpose: 'Köklerin kurumadan maksimum oksijen almasını sağlayarak çürümeyi engeller',
};

// ============================================================
// DÖNER SANTRİFÜJ FİLİZLENDİRME SİSTEMİ (Centrifuge Germination)
// Mikrogravitede bitkinin yerçekimi yönünü algılaması için
// Statolitler (nişasta tanecikleri) merkezkaç kuvvetiyle hücre dış çeperine çöker
// Kökler dışa (merkezkaç yönüne), gövde içe (merkeze doğru) büyür
// ============================================================
export const CENTRIFUGE_GERMINATION = {
  drumRadius: 0.30,       // m (30 cm yarıçap)
  rotationSpeed: 40,      // RPM
  medium: 'rockwool',     // Taş yünü (Rockwool)
  mediumLabel: 'Taş Yünü (Rockwool)',
  humidity: { min: 70, max: 90, unit: '%' },
  temperature: { min: 18, max: 24, unit: '°C' },
  airflow: true,          // Taze hava akışı gerekli
  mechanism: 'Hücre içindeki statolitler (nişasta tanecikleri) merkezkaç kuvvetiyle dış çepere çöker → bitki yön algılar',
  rootDirection: 'outward',   // Merkezkaç yönüne (dışa)
  shootDirection: 'inward',   // Merkeze doğru (içe)
};

// ============================================================
// TOHUM YÖNETİMİ VE DÖNGÜSÜ
// Sürdürülebilir uzay tarımı için tohum üretim protokolü
// ============================================================
export const SEED_MANAGEMENT = {
  separation: {
    method: 'airBlown',          // Hava üflemeli ayrıştırma
    label: 'Hava Üflemeli Ayrıştırma',
    description: 'Hasat sonrası çekirdekler hava akımıyla bitkiden ayrılır',
  },
  drying: {
    targetMoisture: { min: 8, max: 10, unit: '%' },   // Nem oranı
    temperature: { min: 20, max: 25, unit: '°C' },
  },
  storage: {
    temperature: { min: 4, max: 10, unit: '°C' },
    light: 'dark',               // Karanlık ortam
    humidity: 'dry',             // Kuru ortam
    label: 'Karanlık ve kuru, 4-10°C',
  },
  wasteRecycling: {
    method: 'compost',
    label: 'Kompost',
    description: 'Hasat edilen bitki artıkları kompost yapılarak döngüye geri kazandırılır',
  },
};

// ============================================================
// MİKRO FİLİZLER (Microgreens) — Nutrasötik Değer
// Yetişkin bitkilere oranla çok daha yüksek besin yoğunluğu
// ============================================================
export const MICROGREENS = {
  antiCarcinogenMultiplier: { min: 40, max: 100 },  // Yetişkin bitkiye oranla kat
  vitaminCMultiplier: 10,     // Yetişkin bitkiye oranla 10 kat daha yoğun
  growthDays: { min: 7, max: 14 },   // Hasat süresi
  suitableCrops: ['lettuce', 'basil'],
  reference: 'Mikro filizler, yetişkin bitkilere oranla 40-100 kat daha fazla anti-kanserojen madde ve 10 kat daha yoğun C vitamini içerir',
};

// ============================================================
// LED BİYOLOJİK ETKİLERİ (Işık Modülasyonu ve Bitki Stresi)
// Farklı dalga boylarının bitki metabolizması üzerindeki etkileri
// ============================================================
export const LED_BIO_EFFECTS = {
  blue: {
    wavelength: 455,
    primaryEffect: 'Aroma yoğunluğunu ve antioksidan üretimini maksimize eder',
    targets: ['aromatic'],    // Aromatik bitkiler için özellikle kritik
    metaboliteBoost: 1.3,     // Sekonder metabolit artış çarpanı
  },
  red: {
    wavelength: 630,
    primaryEffect: 'Biyokütle artışını ve hızlı boy uzamasını tetikler',
    targets: ['root'],
    biomassBoost: 1.2,
  },
  controlledStress: {
    description: 'Hafif su kısıtlaması ve sıcaklık değişimleri bitkinin savunma mekanizmalarını (sekonder metabolitleri) artırarak daha besleyici olmasını sağlar',
    waterReduction: 0.85,     // %15 su kısıtlaması
    tempVariation: 3,         // ±3°C sıcaklık değişimi
    nutrientDensityBoost: 1.15, // %15 besin yoğunluğu artışı
    psychologicalBenefit: 'Bitki bakımı astronotların psikolojik sağlığını olumlu etkiler',
  },
};

// ============================================================
// DİKEY ÇİFTLİK ALAN PLANLAMASI (3 Katlı Dikey Sistem)
// Her kat 15.7 m² — 5 sütun modülü × 3 kat = toplam 47 m²
// ============================================================
export const VERTICAL_FARM_PLAN = {
  totalArea: 47,       // m² (3 kat × 15.7 m²)
  areaPerLayer: 15.7,  // m²
  layers: 3,
  zones: [
    { id: 'sweet_potato', label: 'Tatlı Patates',        area: 20,  areaPerLayer: 6.7, role: 'Ana karbonhidrat ve A vitamini kaynağı',  crops: ['sweet_potato'] },
    { id: 'soybean',     label: 'Soya Fasulyesi',       area: 14,  areaPerLayer: 4.7, role: 'Tam protein (tüm amino asitler) ve sağlıklı yağ', crops: ['soybean'] },
    { id: 'peanut',      label: 'Yer Fıstığı',          area: 8,   areaPerLayer: 2.7, role: 'Yüksek kalori yoğunluğu, E vitamini ve yağ', crops: ['peanut'] },
    { id: 'greens',      label: 'Yeşillik & Filiz',     area: 3.5, areaPerLayer: 1.2, role: 'K vitamini, mikro besinler ve hidrasyon',  crops: ['lettuce', 'spinach'] },
    { id: 'aromatic',    label: 'Mikro Filiz & Baharat', area: 1.5, areaPerLayer: 0.4, role: 'Antiseptik, sindirim ve antioksidan',     crops: ['basil', 'mint', 'thyme'] },
  ],
};
