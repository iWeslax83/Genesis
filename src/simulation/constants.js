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
  // ═══════ AEROPONİK MODÜL — Kök/yumru ve tahıl ═══════
  potato: {
    id: 'potato', name: 'Patates', cultivar: 'Norland', growthDays: 105,
    caloriesPer100g: 77, proteinPer100g: 2.0, carbsPer100g: 17, fatPer100g: 0.1,
    yieldPerPlant: 800, waterPerDay: 0.5, area: 0.09,
    harvestIndex: 0.68,  // CELSS BPC: %68
    edibleYieldPerM2Day: 20.8, // g/m²/gün (CELSS BPC verisi)
    module: 'aeroponic', icon: '🥔',
    optimalTemp: 20, optimalPH: 5.8, optimalEC: 2.0,
    o2PerDay: 25, co2PerDay: 20,
    pollination: 'self',
    ethyleneSensitivity: 'low',
    reference: 'CELSS BPC: 4 döngü 90-105 gün, 18.4-20.8 g/m²/gün yenilebilir',
    spaceHistory: 'Yuegong-1 temel mahsul',
    // İklim Reçetesi (OpenAg konsepti)
    growthPhases: [
      { name: 'Çimlenme',       dayStart: 0,   dayEnd: 10,  temp: 22, humidity: 80, ppfd: 0,   co2: 400,  ph: 5.8, ec: 0.5 },
      { name: 'Fide',           dayStart: 10,  dayEnd: 25,  temp: 22, humidity: 70, ppfd: 300, co2: 800,  ph: 5.8, ec: 1.2 },
      { name: 'Vejetatif',      dayStart: 25,  dayEnd: 55,  temp: 20, humidity: 65, ppfd: 450, co2: 1000, ph: 5.8, ec: 2.0 },
      { name: 'Yumru Oluşumu',  dayStart: 55,  dayEnd: 85,  temp: 18, humidity: 60, ppfd: 400, co2: 800,  ph: 5.8, ec: 2.2 },
      { name: 'Olgunlaşma',     dayStart: 85,  dayEnd: 105, temp: 16, humidity: 55, ppfd: 300, co2: 600,  ph: 5.8, ec: 1.8 },
    ],
    gddBase: 7, gddToMaturity: 1800, // GDD taban sıcaklığı ve toplam ihtiyaç
    dliOptimal: 18, dliMin: 12, dliMax: 25, // mol/m²/gün
    nutrientCategory: 'root',
    successionInterval: 21, // gün — ardışık ekim aralığı
  },
  sweetPotato: {
    id: 'sweetPotato', name: 'Tatlı Patates', cultivar: 'Beauregard', growthDays: 120,
    caloriesPer100g: 86, proteinPer100g: 1.6, carbsPer100g: 20, fatPer100g: 0.1,
    yieldPerPlant: 600, waterPerDay: 0.4, area: 0.09,
    harvestIndex: 0.72,
    edibleYieldPerM2Day: 15.0,
    module: 'aeroponic', icon: '🍠',
    optimalTemp: 24, optimalPH: 5.8, optimalEC: 2.0,
    o2PerDay: 22, co2PerDay: 18,
    pollination: 'vegetative',
    ethyleneSensitivity: 'low',
    reference: 'CELSS aday bitki — A vitamini kaynağı (beta-karoten: 709µg/100g)',
    spaceHistory: 'Yuegong-1 temel mahsul',
    growthPhases: [
      { name: 'Çimlenme',       dayStart: 0,   dayEnd: 12,  temp: 26, humidity: 85, ppfd: 0,   co2: 400,  ph: 5.8, ec: 0.5 },
      { name: 'Fide',           dayStart: 12,  dayEnd: 30,  temp: 26, humidity: 70, ppfd: 300, co2: 800,  ph: 5.8, ec: 1.2 },
      { name: 'Vejetatif',      dayStart: 30,  dayEnd: 65,  temp: 24, humidity: 65, ppfd: 450, co2: 1000, ph: 5.8, ec: 2.0 },
      { name: 'Yumru Oluşumu',  dayStart: 65,  dayEnd: 100, temp: 22, humidity: 60, ppfd: 400, co2: 800,  ph: 5.8, ec: 2.2 },
      { name: 'Olgunlaşma',     dayStart: 100, dayEnd: 120, temp: 20, humidity: 55, ppfd: 300, co2: 600,  ph: 5.8, ec: 1.8 },
    ],
    gddBase: 10, gddToMaturity: 2200,
    dliOptimal: 18, dliMin: 12, dliMax: 25,
    nutrientCategory: 'root',
    successionInterval: 25,
  },
  wheat: {
    id: 'wheat', name: 'Cüce Buğday', cultivar: 'USU-Apogee', growthDays: 86,
    caloriesPer100g: 340, proteinPer100g: 13.2, carbsPer100g: 72, fatPer100g: 2.5,
    yieldPerPlant: 50, waterPerDay: 0.3, area: 0.04,
    harvestIndex: 0.42,
    edibleYieldPerM2Day: 15.8,
    module: 'aeroponic', icon: '🌾',
    optimalTemp: 22, optimalPH: 6.0, optimalEC: 1.8,
    o2PerDay: 18, co2PerDay: 15,
    pollination: 'self',
    ethyleneSensitivity: 'critical',
    reference: 'USU-Apogee: 40cm boy, etilen toleranslı. CELSS BPC: 5 döngü 64-86 gün',
    spaceHistory: 'BIOS-3 ana mahsul (63m²), Mir Super Dwarf (sterilite!), APH PH-02',
    growthPhases: [
      { name: 'Çimlenme',       dayStart: 0,  dayEnd: 7,   temp: 24, humidity: 75, ppfd: 200, co2: 800,  ph: 6.0, ec: 1.0 },
      { name: 'Fide',           dayStart: 7,  dayEnd: 21,  temp: 22, humidity: 65, ppfd: 400, co2: 1000, ph: 6.0, ec: 1.4 },
      { name: 'Kardeşlenme',    dayStart: 21, dayEnd: 42,  temp: 22, humidity: 60, ppfd: 500, co2: 1200, ph: 6.0, ec: 1.8 },
      { name: 'Başaklanma',     dayStart: 42, dayEnd: 56,  temp: 20, humidity: 55, ppfd: 500, co2: 1000, ph: 6.0, ec: 2.0 },
      { name: 'Tane Dolum',     dayStart: 56, dayEnd: 75,  temp: 18, humidity: 50, ppfd: 450, co2: 800,  ph: 6.0, ec: 1.8 },
      { name: 'Olgunlaşma',     dayStart: 75, dayEnd: 86,  temp: 16, humidity: 45, ppfd: 300, co2: 600,  ph: 6.0, ec: 1.5 },
    ],
    gddBase: 4.4, gddToMaturity: 1500,
    dliOptimal: 22, dliMin: 16, dliMax: 30,
    nutrientCategory: 'grain',
    successionInterval: 14,
  },
  soybean: {
    id: 'soybean', name: 'Soya Fasulyesi', cultivar: 'Hoyt', growthDays: 97,
    caloriesPer100g: 446, proteinPer100g: 36.5, carbsPer100g: 30, fatPer100g: 20,
    yieldPerPlant: 40, waterPerDay: 0.3, area: 0.04,
    harvestIndex: 0.40,
    edibleYieldPerM2Day: 6.9,
    module: 'aeroponic', icon: '🫘',
    optimalTemp: 25, optimalPH: 6.0, optimalEC: 2.2,
    o2PerDay: 20, co2PerDay: 16,
    pollination: 'self',
    ethyleneSensitivity: 'moderate',
    reference: 'CELSS BPC: 3 döngü 90-97 gün. Yağ kaynağı (%20 yağ) — kritik',
    spaceHistory: 'Yuegong-1, BIOS-3. Azot fiksasyonu yeteneği',
    growthPhases: [
      { name: 'Çimlenme',    dayStart: 0,  dayEnd: 8,   temp: 26, humidity: 75, ppfd: 0,   co2: 400,  ph: 6.0, ec: 0.5 },
      { name: 'Fide',        dayStart: 8,  dayEnd: 25,  temp: 25, humidity: 65, ppfd: 350, co2: 800,  ph: 6.0, ec: 1.5 },
      { name: 'Vejetatif',   dayStart: 25, dayEnd: 50,  temp: 25, humidity: 60, ppfd: 450, co2: 1000, ph: 6.0, ec: 2.0 },
      { name: 'Çiçeklenme',  dayStart: 50, dayEnd: 70,  temp: 24, humidity: 55, ppfd: 500, co2: 1000, ph: 6.0, ec: 2.2 },
      { name: 'Bakla Dolum', dayStart: 70, dayEnd: 90,  temp: 22, humidity: 50, ppfd: 400, co2: 800,  ph: 6.0, ec: 2.0 },
      { name: 'Olgunlaşma',  dayStart: 90, dayEnd: 97,  temp: 20, humidity: 45, ppfd: 300, co2: 600,  ph: 6.0, ec: 1.5 },
    ],
    gddBase: 10, gddToMaturity: 1700,
    dliOptimal: 20, dliMin: 14, dliMax: 28,
    nutrientCategory: 'grain',
    successionInterval: 20,
  },
  peanut: {
    id: 'peanut', name: 'Yer Fıstığı', cultivar: 'Pronto', growthDays: 100,
    caloriesPer100g: 567, proteinPer100g: 25.8, carbsPer100g: 16, fatPer100g: 49,
    yieldPerPlant: 30, waterPerDay: 0.25, area: 0.04,
    harvestIndex: 0.35,
    edibleYieldPerM2Day: 5.5,
    module: 'aeroponic', icon: '🥜',
    optimalTemp: 26, optimalPH: 6.0, optimalEC: 1.5,
    o2PerDay: 15, co2PerDay: 12,
    pollination: 'self',
    ethyleneSensitivity: 'low',
    reference: 'En yüksek kalorili uzay bitkisi (567 kcal/100g). %49 yağ — kritik yağ kaynağı',
    spaceHistory: 'Yuegong-1, CELSS aday',
    growthPhases: [
      { name: 'Çimlenme',    dayStart: 0,  dayEnd: 10,  temp: 28, humidity: 75, ppfd: 0,   co2: 400,  ph: 6.0, ec: 0.5 },
      { name: 'Fide',        dayStart: 10, dayEnd: 30,  temp: 26, humidity: 65, ppfd: 350, co2: 800,  ph: 6.0, ec: 1.2 },
      { name: 'Vejetatif',   dayStart: 30, dayEnd: 55,  temp: 26, humidity: 60, ppfd: 450, co2: 1000, ph: 6.0, ec: 1.5 },
      { name: 'Çiçeklenme',  dayStart: 55, dayEnd: 75,  temp: 24, humidity: 55, ppfd: 500, co2: 1000, ph: 6.0, ec: 1.8 },
      { name: 'Bakla Dolum', dayStart: 75, dayEnd: 95,  temp: 22, humidity: 50, ppfd: 400, co2: 800,  ph: 6.0, ec: 1.5 },
      { name: 'Olgunlaşma',  dayStart: 95, dayEnd: 100, temp: 20, humidity: 45, ppfd: 300, co2: 600,  ph: 6.0, ec: 1.2 },
    ],
    gddBase: 10, gddToMaturity: 1600,
    dliOptimal: 18, dliMin: 12, dliMax: 25,
    nutrientCategory: 'root',
    successionInterval: 20,
  },
  // ═══════ NFT MODÜL — Yapraklı sebzeler ve meyveler ═══════
  lettuce: {
    id: 'lettuce', name: 'Kırmızı Marul', cultivar: 'Outredgeous', growthDays: 28,
    caloriesPer100g: 15, proteinPer100g: 1.4, carbsPer100g: 2.9, fatPer100g: 0.2,
    yieldPerPlant: 200, waterPerDay: 0.15, area: 0.06,
    harvestIndex: 0.92,  // En yüksek — neredeyse tamamı yenilebilir
    edibleYieldPerM2Day: 11.8, // CELSS BPC verisi (kes-ve-tekrar-hasat)
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
  mizuna: {
    id: 'mizuna', name: 'Mizuna Hardalı', cultivar: 'Miz America', growthDays: 21,
    caloriesPer100g: 21, proteinPer100g: 2.3, carbsPer100g: 3.0, fatPer100g: 0.2,
    yieldPerPlant: 180, waterPerDay: 0.12, area: 0.04,
    harvestIndex: 0.90,
    edibleYieldPerM2Day: 194.0, // Eden ISS: İKİNCİ en verimli bitki!
    module: 'nft', icon: '🌿',
    optimalTemp: 20, optimalPH: 6.0, optimalEC: 1.8,
    o2PerDay: 7, co2PerDay: 5,
    pollination: 'none',
    ethyleneSensitivity: 'low',
    reference: 'Eden ISS\'te 194 g/m²/gün — en verimli yapraklı sebze. Hızlı büyüme',
    spaceHistory: 'VEGGIE VEG-03/04, VEGGIE-PONDS. ISS\'te düzenli olarak yetiştiriliyor',
    growthPhases: [
      { name: 'Çimlenme',  dayStart: 0,  dayEnd: 3,   temp: 22, humidity: 85, ppfd: 0,   co2: 400, ph: 6.0, ec: 0.5 },
      { name: 'Fide',      dayStart: 3,  dayEnd: 7,   temp: 20, humidity: 70, ppfd: 200, co2: 800, ph: 6.0, ec: 1.0 },
      { name: 'Vejetatif', dayStart: 7,  dayEnd: 18,  temp: 20, humidity: 65, ppfd: 350, co2: 1000, ph: 6.0, ec: 1.5 },
      { name: 'Hasat',     dayStart: 18, dayEnd: 21,  temp: 18, humidity: 60, ppfd: 300, co2: 800, ph: 6.0, ec: 1.2 },
    ],
    gddBase: 4, gddToMaturity: 350,
    dliOptimal: 16, dliMin: 10, dliMax: 20,
    nutrientCategory: 'leafy',
    successionInterval: 5,
  },
  tomato: {
    id: 'tomato', name: 'Cüce Domates', cultivar: 'Red Robin', growthDays: 65,
    caloriesPer100g: 18, proteinPer100g: 0.9, carbsPer100g: 3.9, fatPer100g: 0.2,
    yieldPerPlant: 1200, waterPerDay: 0.8, area: 0.16,
    harvestIndex: 0.50,
    edibleYieldPerM2Day: 11.4, // CELSS BPC verisi
    module: 'nft', icon: '🍅',
    optimalTemp: 24, optimalPH: 5.8, optimalEC: 3.49,
    o2PerDay: 30, co2PerDay: 24,
    pollination: 'self', // Titreşimle — mikro yerçekiminde hava akımı ile
    ethyleneSensitivity: 'high', // Etilen olgunlaşmayı hızlandırır
    reference: '20-30cm boy. Eden ISS: 46-52 g/m²/gün. Astronot Frank Rubio kayıp domates!',
    spaceHistory: 'VEGGIE VEG-05 (2023). Kayıp domates 8 ay sonra bulundu (Aralık 2023)',
    growthPhases: [
      { name: 'Çimlenme',    dayStart: 0,  dayEnd: 8,   temp: 26, humidity: 80, ppfd: 0,   co2: 400,  ph: 5.8, ec: 0.5 },
      { name: 'Fide',        dayStart: 8,  dayEnd: 20,  temp: 24, humidity: 70, ppfd: 300, co2: 800,  ph: 5.8, ec: 1.5 },
      { name: 'Vejetatif',   dayStart: 20, dayEnd: 35,  temp: 24, humidity: 65, ppfd: 450, co2: 1000, ph: 5.8, ec: 2.0 },
      { name: 'Çiçeklenme',  dayStart: 35, dayEnd: 50,  temp: 22, humidity: 60, ppfd: 500, co2: 1000, ph: 5.8, ec: 2.5 },
      { name: 'Meyve Olum',  dayStart: 50, dayEnd: 65,  temp: 22, humidity: 55, ppfd: 500, co2: 800,  ph: 5.8, ec: 3.0 },
    ],
    gddBase: 10, gddToMaturity: 1200,
    dliOptimal: 25, dliMin: 18, dliMax: 32,
    nutrientCategory: 'fruiting',
    successionInterval: 14,
  },
  spinach: {
    id: 'spinach', name: 'Ispanak', cultivar: 'Space Spinach', growthDays: 25,
    caloriesPer100g: 23, proteinPer100g: 2.9, carbsPer100g: 3.6, fatPer100g: 0.4,
    yieldPerPlant: 150, waterPerDay: 0.1, area: 0.04,
    harvestIndex: 0.88,
    edibleYieldPerM2Day: 8.5,
    module: 'nft', icon: '🍃',
    optimalTemp: 18, optimalPH: 6.2, optimalEC: 1.8,
    o2PerDay: 6, co2PerDay: 5,
    pollination: 'none',
    ethyleneSensitivity: 'moderate',
    reference: 'Demir (2.7mg/100g), kalsiyum (99mg/100g), A vitamini kaynağı',
    spaceHistory: 'Yuegong-1 sebze listesinde',
    growthPhases: [
      { name: 'Çimlenme',  dayStart: 0,  dayEnd: 4,   temp: 22, humidity: 85, ppfd: 0,   co2: 400, ph: 6.2, ec: 0.5 },
      { name: 'Fide',      dayStart: 4,  dayEnd: 10,  temp: 20, humidity: 70, ppfd: 250, co2: 800, ph: 6.2, ec: 1.2 },
      { name: 'Vejetatif', dayStart: 10, dayEnd: 22,  temp: 18, humidity: 65, ppfd: 350, co2: 1000, ph: 6.2, ec: 1.6 },
      { name: 'Hasat',     dayStart: 22, dayEnd: 25,  temp: 16, humidity: 60, ppfd: 300, co2: 800, ph: 6.2, ec: 1.4 },
    ],
    gddBase: 4, gddToMaturity: 400,
    dliOptimal: 14, dliMin: 8, dliMax: 18,
    nutrientCategory: 'leafy',
    successionInterval: 7,
  },
  pepper: {
    id: 'pepper', name: 'Hatch Biber', cultivar: 'NuMex Espanola Improved', growthDays: 137,
    caloriesPer100g: 20, proteinPer100g: 0.9, carbsPer100g: 4.6, fatPer100g: 0.2,
    yieldPerPlant: 400, waterPerDay: 0.5, area: 0.09,
    harvestIndex: 0.45,
    edibleYieldPerM2Day: 4.5,
    module: 'nft', icon: '🌶️',
    optimalTemp: 24, optimalPH: 5.8, optimalEC: 2.2,
    o2PerDay: 20, co2PerDay: 16,
    pollination: 'self',
    ethyleneSensitivity: 'moderate',
    reference: 'ISS\'te en uzun meyve deneyi (137 gün). C vitamini kaynağı (128mg/100g)',
    spaceHistory: 'APH PH-04 (2021) — mürettebat space taco yaptı! Roy Nakayama (NMSU 1984)',
    growthPhases: [
      { name: 'Çimlenme',    dayStart: 0,   dayEnd: 12,  temp: 28, humidity: 80, ppfd: 0,   co2: 400,  ph: 5.8, ec: 0.5 },
      { name: 'Fide',        dayStart: 12,  dayEnd: 30,  temp: 26, humidity: 70, ppfd: 300, co2: 800,  ph: 5.8, ec: 1.5 },
      { name: 'Vejetatif',   dayStart: 30,  dayEnd: 55,  temp: 24, humidity: 65, ppfd: 450, co2: 1000, ph: 5.8, ec: 2.0 },
      { name: 'Çiçeklenme',  dayStart: 55,  dayEnd: 80,  temp: 24, humidity: 60, ppfd: 500, co2: 1000, ph: 5.8, ec: 2.5 },
      { name: 'Meyve Olum',  dayStart: 80,  dayEnd: 120, temp: 22, humidity: 55, ppfd: 500, co2: 800,  ph: 5.8, ec: 2.8 },
      { name: 'Hasat',       dayStart: 120, dayEnd: 137, temp: 20, humidity: 50, ppfd: 400, co2: 600,  ph: 5.8, ec: 2.2 },
    ],
    gddBase: 10, gddToMaturity: 2400,
    dliOptimal: 22, dliMin: 16, dliMax: 30,
    nutrientCategory: 'fruiting',
    successionInterval: 30,
  },
  radish: {
    id: 'radish', name: 'Turp', cultivar: 'Cherry Belle', growthDays: 27,
    caloriesPer100g: 16, proteinPer100g: 0.7, carbsPer100g: 3.4, fatPer100g: 0.1,
    yieldPerPlant: 100, waterPerDay: 0.08, area: 0.02,
    harvestIndex: 0.65,
    edibleYieldPerM2Day: 78.0, // Eden ISS Raxe çeşidi
    module: 'nft', icon: '📍',
    optimalTemp: 18, optimalPH: 6.0, optimalEC: 1.2,
    o2PerDay: 4, co2PerDay: 3,
    pollination: 'none', // Kök aşamasında hasat
    ethyleneSensitivity: 'low',
    reference: 'APH PH-02: 27 günde olgunlaştı. Eden ISS Raxe/Lennox: 59-78 g/m²/gün',
    spaceHistory: 'APH PH-02 (2020) — astronot Kate Rubins 20 turp hasat etti',
    growthPhases: [
      { name: 'Çimlenme',    dayStart: 0,  dayEnd: 3,   temp: 22, humidity: 80, ppfd: 0,   co2: 400, ph: 6.0, ec: 0.5 },
      { name: 'Fide',        dayStart: 3,  dayEnd: 8,   temp: 20, humidity: 70, ppfd: 250, co2: 800, ph: 6.0, ec: 0.8 },
      { name: 'Kök Gelişim', dayStart: 8,  dayEnd: 22,  temp: 18, humidity: 65, ppfd: 350, co2: 1000, ph: 6.0, ec: 1.2 },
      { name: 'Hasat',       dayStart: 22, dayEnd: 27,  temp: 16, humidity: 60, ppfd: 300, co2: 800, ph: 6.0, ec: 1.0 },
    ],
    gddBase: 4, gddToMaturity: 400,
    dliOptimal: 14, dliMin: 10, dliMax: 20,
    nutrientCategory: 'root',
    successionInterval: 7,
  },
  strawberry: {
    id: 'strawberry', name: 'Çilek', cultivar: 'Albion', growthDays: 60,
    caloriesPer100g: 32, proteinPer100g: 0.7, carbsPer100g: 7.7, fatPer100g: 0.3,
    yieldPerPlant: 300, waterPerDay: 0.3, area: 0.06,
    harvestIndex: 0.85, // Meyvenin çoğu yenilebilir
    edibleYieldPerM2Day: 3.5,
    module: 'nft', icon: '🍓',
    optimalTemp: 22, optimalPH: 5.8, optimalEC: 1.5,
    o2PerDay: 10, co2PerDay: 8,
    pollination: 'self', // Kendi kendine tozlaşabilir
    ethyleneSensitivity: 'high',
    reference: 'Yuegong-1\'de tek meyve — yüksek hasat indeksi. Psikolojik fayda',
    spaceHistory: 'Yuegong-1 (2017). CELSS aday meyve',
    growthPhases: [
      { name: 'Çimlenme',    dayStart: 0,  dayEnd: 7,   temp: 24, humidity: 85, ppfd: 0,   co2: 400,  ph: 5.8, ec: 0.5 },
      { name: 'Fide',        dayStart: 7,  dayEnd: 20,  temp: 22, humidity: 70, ppfd: 250, co2: 800,  ph: 5.8, ec: 1.0 },
      { name: 'Vejetatif',   dayStart: 20, dayEnd: 35,  temp: 22, humidity: 65, ppfd: 350, co2: 1000, ph: 5.8, ec: 1.5 },
      { name: 'Çiçeklenme',  dayStart: 35, dayEnd: 45,  temp: 20, humidity: 60, ppfd: 400, co2: 1000, ph: 5.8, ec: 1.8 },
      { name: 'Meyve Olum',  dayStart: 45, dayEnd: 60,  temp: 20, humidity: 55, ppfd: 400, co2: 800,  ph: 5.8, ec: 2.0 },
    ],
    gddBase: 6, gddToMaturity: 900,
    dliOptimal: 16, dliMin: 10, dliMax: 22,
    nutrientCategory: 'fruiting',
    successionInterval: 14,
  },
};

// Spirulina sabitleri (ESA MELiSSA Compartment 4a referans)
// Organizma: Limnospira indica PCC8005 (eski adı Arthrospira platensis)
export const SPIRULINA = {
  productivityPerM2Day: 6.0,   // g/m²/gün kuru biyokütle
  proteinPercent: 0.65,        // %60-70 protein (MELiSSA)
  caloriesPer100g: 290,
  proteinPer100g: 57,
  carbsPer100g: 24,
  fatPer100g: 8,
  // Stokiyometrik hesap (biyokütle mol formülü: CO₀.₄₈H₁.₈₃N₀.₁₁P₀.₀₁):
  //   1 kg biyokütle → 1.37 kg O₂ üretimi = 42.7 mol = ~960 L (@21°C)
  //   1 kg biyokütle ← 1.88 kg CO₂ fiksasyonu = 42.7 mol = ~960 L (@21°C)
  o2ProductionPerKg: 960,      // L O₂ / kg biyokütle (stokiyometrik)
  co2ConsumptionPerKg: 960,    // L CO₂ / kg (stokiyometrik — mol bazında 1:1 O₂:CO₂)
  tankVolume: 15,              // m³ (MELiSSA pilot: 83L, ölçeklenmiş)
  surfaceArea: 10,             // m²
  optimalTemp: 30,
  optimalPH: 9.5,
  photonFlux: 930,             // µmol/m²/s (MELiSSA pilot)
  dilutionRate: 0.025,         // /saat (MELiSSA pilot)
  reference: 'ESA MELiSSA C4a — Limnospira indica PCC8005',
};

// Mantar sabitleri
export const MUSHROOM = {
  growthDays: 14,
  caloriesPer100g: 22,
  proteinPer100g: 3.1,
  carbsPer100g: 3.3,
  fatPer100g: 0.3,
  yieldPerBatch: 5000,
  batchesPerMonth: 4,
  dailyYield: 714,
  substrateFromWaste: true,
  lightRequired: false,
  optimalTemp: 18,
  optimalHumidity: 90,
};

// Böcek protein modülü (Yuegong-1 referans — Tenebrio molitor / sarı un kurdu)
export const MEALWORM = {
  caloriesPer100g: 206,
  proteinPer100g: 25.0,       // Tam amino asit profili
  carbsPer100g: 5.4,
  fatPer100g: 12.0,
  feedConversionRatio: 3.3,   // kg yem → 1 kg böcek (en iyi yayınlanmış: 3.26, PLOS ONE)
  yieldPerKgWaste: 450,       // g böcek / kg bitki atığı
  dailyCapacity: 0.8,         // kg bitki atığı / gün işleme
  waterPerDay: 0.1,           // L
  growthDays: 45,             // Larva evresi
  reference: 'Yuegong-1 — yenilenemeyen bitki kısımları ile beslenir',
};

// Mürettebat sabitleri (NASA BVAD Rev2 — NASA/TP-2015-218570)
// O₂: 0.84 kg/gün = ~630 L/gün (kabin: 21°C, 101.3 kPa)
//   Hesap: 0.84kg / 0.032kg/mol = 26.25 mol × 24.04 L/mol(@21°C) = 631 L
// CO₂: 1.00 kg/gün = ~550 L/gün (kabin: 21°C, 101.3 kPa)
//   Hesap: 1.00kg / 0.044kg/mol = 22.73 mol × 24.04 L/mol(@21°C) = 547 L
// RQ (solunum katsayısı): 0.87 (NASA BVAD)
export const CREW = {
  count: 6,
  o2PerPersonPerDay: 630,      // litre (kabin basıncında — 101.3 kPa, 21°C)
  co2PerPersonPerDay: 550,     // litre
  waterPerPersonPerDay: 3.8,   // litre (içme + yemek)
  caloriePerPersonPerDay: 2500, // kcal (uzay görevi ortalaması — NASA: 2500-3000)
  wastePerPersonPerDay: 1.8,   // kg (dışkı + idrar + gıda atığı)
  members: [
    { id: 1, name: 'Cmdr. Yıldız',  role: 'Komutan',   calorie: 2700 },
    { id: 2, name: 'Plt. Demir',     role: 'Pilot',     calorie: 2500 },
    { id: 3, name: 'Müh. Kaya',      role: 'Mühendis',  calorie: 2600 },
    { id: 4, name: 'Müh. Aras',      role: 'Mühendis',  calorie: 2500 },
    { id: 5, name: 'Dr. Işık',       role: 'Doktor',    calorie: 2300 },
    { id: 6, name: 'Bot. Toprak',    role: 'Botanikçi', calorie: 2400 },
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

// Modül alanları (Yuegong-1 ölçeğine yakın: 58 m² bitki alanı)
export const MODULE_AREAS = {
  aeroponic: 15,    // m² (Eden ISS: 12.5 m²)
  nft: 7,           // m²
  spirulina: 10,    // m² yüzey (MELiSSA fotobiyoreaktör)
  mushroom: 2,      // m³
  mealworm: 0.5,    // m² (kompakt ünite)
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
  spirulina: {
    temperature: { base: 30, amplitude: 0.8, period: 24, noiseLevel: 0.2, trend: 0 },
    pH: { base: 9.5, amplitude: 0.15, period: 36, noiseLevel: 0.05, trend: 0 },
    density: { base: 1.2, amplitude: 0.1, period: 72, noiseLevel: 0.03, trend: 0 },
    o2: { base: 8.0, amplitude: 1.5, period: 24, noiseLevel: 0.3, trend: 0 }, // Çözünmüş O₂ (mg/L)
  },
  mushroom: {
    temperature: { base: 18, amplitude: 0.5, period: 24, noiseLevel: 0.2, trend: 0 },
    humidity: { base: 90, amplitude: 2, period: 24, noiseLevel: 0.8, trend: 0 },
    co2: { base: 1200, amplitude: 100, period: 24, noiseLevel: 30, trend: 0 },
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
    id: 'spirulina_crash',
    name: 'Spirulina Çöküşü',
    icon: '🧬',
    description: 'Kontaminasyon: Spirulina üretimi durdu (MELiSSA C4a kontaminasyon senaryosu)',
    severity: 'warning',
    effects: { spirulinaDensity: 0.1, spirulinaO2: 0.1 },
    duration: 21,
  },
  {
    id: 'crew_increase',
    name: 'Mürettebat Artışı',
    icon: '👨‍🚀',
    description: 'Acil durum: 2 ek mürettebat üyesi (kaynak yükü artışı)',
    severity: 'warning',
    effects: { crewCount: 8 },
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

// Başlangıçta ekili bitkiler (karma strateji — CELSS seçim kriterlerine dayalı)
// Seçim: kısa boy, yüksek hasat indeksi, yüksek verim/m², besleyici değer
//
// Alan hesabı:
//   Aeroponik 15 m²: patates 4.5m²(50×0.09) + tatlıPatates 2.0m²(22×0.09) +
//     buğday 4.8m²(120×0.04) + soya 2.0m²(50×0.04) + fıstık 1.6m²(40×0.04) ≈ 14.9 m²
//   NFT 7 m²: marul 1.8m²(30×0.06) + mizuna 1.0m²(25×0.04) + domates 1.28m²(8×0.16) +
//     ıspanak 0.8m²(20×0.04) + biber 0.72m²(8×0.09) + turp 0.4m²(20×0.02) +
//     çilek 0.9m²(15×0.06) ≈ 6.9 m²
//
// Ardışık ekim: farklı plantedDay değerleri ile sürekli hasat garantisi
export const INITIAL_PLANTS = {
  aeroponic: [
    { type: 'potato', plantedDay: -55, count: 50 },
    { type: 'sweetPotato', plantedDay: -40, count: 22 },
    { type: 'wheat', plantedDay: -70, count: 120 },
    { type: 'soybean', plantedDay: -30, count: 50 },
    { type: 'peanut', plantedDay: -50, count: 40 },
  ],
  nft: [
    { type: 'lettuce', plantedDay: -18, count: 30 },
    { type: 'mizuna', plantedDay: -12, count: 25 },    // Eden ISS en verimli yapraklı
    { type: 'tomato', plantedDay: -35, count: 8 },
    { type: 'spinach', plantedDay: -14, count: 20 },
    { type: 'pepper', plantedDay: -80, count: 8 },      // 137 gün döngü — erken ekildi
    { type: 'radish', plantedDay: -16, count: 20 },
    { type: 'strawberry', plantedDay: -35, count: 15 },  // Yuegong-1 tek meyve
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
    description: 'MELiSSA C4a (Spirulina) + C4b (Üst bitkiler) + Mantar + Böcek',
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

// Habitat hacmi (gaz simülasyonu için)
export const HABITAT_VOLUME = 200000; // litre (200 m³)

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
    crops: ['lettuce', 'mizuna', 'spinach'],
  },
  fruiting: {
    label: 'Meyve Bitkileri',
    N: 160, P: 50, K: 300, Ca: 220, Mg: 50, S: 70, Fe: 4,
    B: 0.7, Mn: 0.8, Zn: 0.1, Cu: 0.05, Mo: 0.01,
    pH: 5.8, EC: 2.5, unit: 'ppm',
    crops: ['tomato', 'pepper', 'strawberry'],
  },
  root: {
    label: 'Kök/Yumru Bitkileri',
    N: 140, P: 60, K: 250, Ca: 150, Mg: 40, S: 55, Fe: 3,
    B: 0.5, Mn: 0.5, Zn: 0.05, Cu: 0.02, Mo: 0.01,
    pH: 5.8, EC: 2.0, unit: 'ppm',
    crops: ['potato', 'sweetPotato', 'radish', 'peanut'],
  },
  grain: {
    label: 'Tahıl ve Baklagil',
    N: 120, P: 40, K: 180, Ca: 100, Mg: 30, S: 45, Fe: 2,
    B: 0.3, Mn: 0.4, Zn: 0.05, Cu: 0.02, Mo: 0.01,
    pH: 6.0, EC: 1.8, unit: 'ppm',
    crops: ['wheat', 'soybean'],
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

// Mantar substrat sabitleri
export const SUBSTRATE = {
  depletionRatePerDay: 2.86,
  replenishRatePerKgWaste: 0.2,
};

// Vitamin/mineral veritabanı
export const VITAMINS = {
  A:       { name: 'A Vitamini',   unit: 'µg', dailyNeed: 900,  sources: { spinach: 469, sweetPotato: 709, lettuce: 370, pepper: 157, mizuna: 198 } },
  B12:     { name: 'B12 Vitamini', unit: 'µg', dailyNeed: 2.4,  sources: { spirulina: 0.1 } },  // MELiSSA: B12 eksikliği bilinen risk
  C:       { name: 'C Vitamini',   unit: 'mg', dailyNeed: 90,   sources: { pepper: 128, strawberry: 59, tomato: 14, spinach: 28, potato: 20 } },
  iron:    { name: 'Demir',        unit: 'mg', dailyNeed: 8,    sources: { spinach: 2.7, soybean: 15.7, spirulina: 28.5, peanut: 4.6 } },
  calcium: { name: 'Kalsiyum',     unit: 'mg', dailyNeed: 1000, sources: { spinach: 99, soybean: 277, spirulina: 120, mizuna: 210 } },
};

// ============================================================
// GÜÇ VE ENERJİ SİSTEMİ (NASA BVAD, Kilopower, Eden ISS)
// ============================================================
export const POWER = {
  // Alt sistem güç tüketimi (kW) — Eden ISS ölçeğine dayalı
  subsystems: {
    ledLighting:    { base: 18.0, label: 'LED Aydınlatma',         priority: 3 },
    thermalHVAC:    { base: 6.0,  label: 'Isıl Kontrol / HVAC',    priority: 1 },
    waterProcessing:{ base: 2.5,  label: 'Su İşleme',              priority: 2 },
    atmosphere:     { base: 3.5,  label: 'Atmosfer Yönetimi',       priority: 1 },
    sensors:        { base: 1.2,  label: 'Sensör ve Kontrol',       priority: 1 },
    wasteProcessing:{ base: 1.5,  label: 'Atık İşleme',            priority: 3 },
    crewSupport:    { base: 1.3,  label: 'Mürettebat Desteği',     priority: 2 },
  },
  // Güç kaynakları
  sources: {
    solar:   { capacity: 40, efficiency: 0.30, area: 260, degradationPerYear: 0.02, label: 'Güneş Paneli' },
    nuclear: { capacity: 10, units: 4, totalCapacity: 40, mass: 6000, lifetime: 15, label: 'Kilopower Reaktör' },
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
  // Radyatör
  radiator: {
    area: 120,            // m²
    emissivity: 0.88,
    operatingTemp: 300,   // K
    sinkTemp: 220,        // K (Mars çevresi)
    maxRejection: 25,     // kW (Stefan-Boltzmann hesabı)
  },
  // Kabin
  cabin: {
    thermalMass: 50000,   // J/K (basitleştirilmiş)
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
  ammonia:      { name: 'Amonyak',       unit: 'mg/m³', smac180: 7.0,  baseRate: 0.3,  scrubberEff: 0.90, source: 'Mürettebat metabolizması' },
  formaldehyde: { name: 'Formaldehit',   unit: 'mg/m³', smac180: 0.05, baseRate: 0.01, scrubberEff: 0.95, source: 'Polimer gaz salımı' },
  co:           { name: 'Karbon Monoksit',unit: 'mg/m³', smac180: 17.0, baseRate: 0.5,  scrubberEff: 0.95, source: 'Ekipman, metabolizma' },
  methane:      { name: 'Metan',         unit: 'mg/m³', smac180: 3800, baseRate: 1.0,  scrubberEff: 0.80, source: 'Mürettebat, malzeme' },
  voc:          { name: 'Toplam VOC',    unit: 'mg/m³', smac180: 25.0, baseRate: 0.5,  scrubberEff: 0.85, source: 'Yapıştırıcılar, contalar' },
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
    lettuce: 0.3,   spinach: 0.3,   mizuna: 0.2,  // Düşük LD50 → hassas
    wheat: 0.8,     potato: 0.6,    soybean: 0.5,  // Yüksek LD50 → dayanıklı
    tomato: 0.4,    pepper: 0.4,    radish: 0.5,
    sweetPotato: 0.6, peanut: 0.5, strawberry: 0.3,
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
  luxuryCrops: ['strawberry', 'tomato', 'pepper'],
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
  spirulina: '#5b8def',
  mushroom: '#8b7fc7',
  mealworm: '#d4903a',
};

export const SOURCE_LABELS = {
  aeroponic: 'Aeroponik',
  nft: 'NFT Sebze',
  spirulina: 'Spirulina',
  mushroom: 'Mantar',
  mealworm: 'Böcek Protein',
};
