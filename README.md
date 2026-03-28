# GENESIS

**Kapalı Döngü Uzay Tarımı Yaşam Destek Sistemi Simülatörü**

GENESIS, uzun süreli uzay görevleri için biyorejeneratif yaşam destek sistemlerini (BLSS) modelleyen gerçek zamanlı bir simülasyon platformudur. ESA'nın MELiSSA protokolünü temel alarak 6 kişilik bir mürettebatın 980 günlük görev süresince hava, su, gıda ve atık döngüsünü simüle eder.

Simülasyon NASA VEGGIE/APH, ESA MELiSSA, BIOS-3, Yuegong-1 ve Eden ISS deneylerinden elde edilen gerçek verilere dayanır.

---

## Kurulum

```bash
git clone https://github.com/iWeslax83/genesis.git
cd genesis
npm install
npm run dev
```

Geliştirme sunucusu `http://localhost:3000` adresinde başlar.

### Diğer Komutlar

```bash
npm run build      # Üretim derlemesi
npm run preview    # Derleme önizlemesi
```

---

## Özellikler

### Simülasyon Modülleri

- **Bitki Büyüme Modeli** — Sigmoid büyüme eğrisi, çevresel çarpanlar (sıcaklık, nem, PAR, CO2, pH, EC), GDD ve DLI hesaplamaları
- **Kaynak Akış Motoru** — O2/CO2 dengesi, su döngüsü, kalori üretimi, besin geri kazanımı
- **Güç Sistemi** — Güneş/nükleer enerji üretimi, 9 alt sistem tüketimi, güç kısıtlama algoritması
- **Isıl Kontrol** — Isı üretimi, radyatör kapasitesi, kabin sıcaklık regülasyonu
- **Su İşleme** — Çok aşamalı geri kazanım, gri su arıtma, idrar işleme, nem yoğuşturma
- **Sensör Simülatörü** — 180+ sanal sensör, gürültü, sapma ve günlük döngüler (NASA APH referans)
- **NDVI Modeli** — Bitki sağlık indeksi, stres tespiti, mekansal sağlık haritaları
- **Patojen Modeli** — Hastalık riski değerlendirmesi, çevresel tetikleyiciler, enfeksiyon yayılımı
- **Anomali Dedektörü** — İstatistiksel sapma analizi, eşik bazlı alarmlar, kök neden önerileri
- **Radyasyon Modeli** — GCR doz takibi, SPE olayları, kalkan etkinliği, bitki büyüme etkisi
- **Mürettebat Aktivite Modeli** — Vardiya rotasyonu, aktivite bazlı kaynak tüketimi
- **Görev Planlayıcı** — Faz yönetimi, kilometre taşı takibi, kaynak tahsisi
- **Ardıl Ekim Planlayıcı** — Kademeli ekim, sürekli hasat, ürün rotasyonu
- **Eser Kirletici Takibi** — Etilen, amonyak, formaldehit, VOC izleme ve scrubber kontrolü
- **Ekipman Bozulma Modeli** — Bileşen sağlığı, güvenilirlik eğrileri, bakım planlaması

### Sayfa ve Paneller

| Sayfa | Açıklama |
|-------|----------|
| **Genel Bakış** | Görev özeti, MELiSSA kapalı döngü diyagramı, BLSS kapalılık oranları, kompartıman durumları |
| **Bitki İzleme** | 4 modül (aeroponik, NFT, spirulina, mantar), canlı sensör gauge'ları, iklim reçetesi, büyüme zaman çizelgesi, NDVI ısı haritası, ortam grafikleri |
| **Beslenme** | Kalori gauge, makro besin dağılımı, kaynak bazlı üretim, vitamin/mineral durumu, mürettebat dağılımı |
| **Güç & Enerji** | Üretim/tüketim dengesi, alt sistem güç dağılımı, ısıl denge, bileşen bozulma durumu |
| **Görev Planlama** | Görev zaman çizelgesi, mürettebat aktiviteleri, radyasyon izleme, su işleme aşamaları, eser kirleticiler |
| **Dijital İkiz** | 3D habitat modeli, şematik sistem görünümü, çiftlik 3D, tesis haritası, what-if senaryoları |
| **AI Tahmin** | Sistem sağlık skoru, 30 günlük kaynak projeksiyonu, hasat tahminleri, anomali zaman çizelgesi, risk göstergeleri |

---

## Bilimsel Altyapı

### MELiSSA Kapalı Döngü Mimarisi

Simülasyon ESA'nın 5 kompartmanlı MELiSSA modelini uygular:

```
C1 (Anaerobik Fermenter)  →  C3 (Nitrifikasyon)  →  C4a/4b (Fotobiyoreaktör + Bitkiler)
        ↑                                                           ↓
        └────────────────── C5 (Mürettebat Modülü) ←───────────────┘
```

| Kompartman | İşlev |
|------------|-------|
| **C1** — Anaerobik Fermenter | Organik atığın 55°C'de termofil ayrıştırması |
| **C3** — Nitrifikasyon | NH4+ → NO2- → NO3- dönüşümü (Nitrosomonas + Nitrobacter) |
| **C4a** — Fotobiyoreaktör | Spirulina üretimi (O2 + protein kaynağı) |
| **C4b** — Bitki Modülleri | Aeroponik + NFT hidroponik + mantar + böcek proteini |
| **C5** — Habitat | Mürettebat yaşam alanı, gaz değişimi, atık üretimi |

### Bitki Türleri (12 tür)

**Aeroponik Modül:**

| Tür | Çeşit | Döngü | Verim | Kalori | Referans |
|-----|-------|-------|-------|--------|----------|
| Patates | Norland | 105 gün | 20.8 g/m2/gün | 77 kcal/100g | CELSS BPC, Yuegong-1 |
| Tatlı Patates | Beauregard | 120 gün | 15.0 g/m2/gün | 86 kcal/100g | Yuegong-1 |
| Cüce Buğday | USU-Apogee | 86 gün | 15.8 g/m2/gün | 340 kcal/100g | BIOS-3, Mir |
| Soya Fasulyesi | Hoyt | 97 gün | 6.9 g/m2/gün | 446 kcal/100g | Yuegong-1 |
| Yer Fıstığı | Pronto | 100 gün | 5.5 g/m2/gün | 567 kcal/100g | CELSS |

**NFT Hidroponik Modül:**

| Tür | Çeşit | Döngü | Verim | Kalori | Referans |
|-----|-------|-------|-------|--------|----------|
| Kırmızı Marul | Outredgeous | 28 gün | 11.8 g/m2/gün | 15 kcal/100g | NASA VEGGIE, ISS |
| Mizuna | Miz America | 21 gün | 194 g/m2/gün | 21 kcal/100g | Eden ISS |
| Cüce Domates | Red Robin | 65 gün | 11.4 g/m2/gün | 18 kcal/100g | NASA VEGGIE |
| Ispanak | Space Spinach | 25 gün | 8.5 g/m2/gün | 23 kcal/100g | Yuegong-1 |
| Biber | NuMex Espanola | 137 gün | 4.5 g/m2/gün | 20 kcal/100g | NASA APH PH-04 |
| Turp | Cherry Belle | 27 gün | 78 g/m2/gün | 16 kcal/100g | NASA APH PH-02 |
| Çilek | Albion | 60 gün | 3.5 g/m2/gün | 32 kcal/100g | Yuegong-1 |

**Ek Modüller:**
- **Spirulina** (Limnospira indica PCC8005) — 57g protein/100g, 960 L O2/kg biyokütle
- **Mantar** — Karbon döngüsünde ayrıştırıcı rol
- **Un Kurdu** (Tenebrio molitor) — Atıktan böcek proteini üretimi

### Mürettebat (6 kişi, 980 gün görev)

| Görev | İsim | Günlük Kalori |
|-------|------|---------------|
| Komutan | Cmdr. Yıldız | 2.700 kcal |
| Pilot | Plt. Demir | 2.500 kcal |
| Mühendis | Müh. Kaya | 2.600 kcal |
| Mühendis | Müh. Aras | 2.500 kcal |
| Doktor | Dr. Işık | 2.300 kcal |
| Botanikçi | Bot. Toprak | 2.400 kcal |

Kişi başı günlük tüketim: 630 L O2, 550 L CO2 üretimi, 3.8 L su, 1.8 kg atık.

### What-If Senaryoları

| Senaryo | Süre | Etki |
|---------|------|------|
| LED Panel Arızası | 14 gün | Aeroponik PAR %50 düşüş |
| Su Sızıntısı | 7 gün | Geri kazanım oranı %98 → %78 |
| CO2 Spike | 3 gün | Habitat CO2 %1.8'e yükselme |
| Spirulina Çöküşü | 21 gün | Kontaminasyon, O2 üretimi durur |
| Mürettebat Artışı | 30 gün | 6 → 8 kişi, kaynak yükü artar |
| Etilen Birikmesi | 10 gün | 3x etilen, erken olgunlaşma riski |

---

## Teknoloji

| Katman | Teknoloji |
|--------|-----------|
| Framework | React 19 |
| Build | Vite 8 |
| 3D | Three.js + React Three Fiber + Drei |
| Grafikler | Recharts |
| Stil | Tailwind CSS 3 |
| İkonlar | React Icons (Feather) |

---

## Proje Yapısı

```
src/
├── components/
│   ├── ai/                 AI anomali tespiti ve tahminler
│   ├── digital-twin/       3D habitat ve şematik görünüm
│   ├── farm-view/          Bölge bazlı tesis haritası
│   ├── growth/             Bitki izleme ve sensör verileri
│   ├── layout/             Ana düzen, sidebar, üst bar
│   ├── mission/            Görev zaman çizelgesi ve mürettebat
│   ├── nutrition/          Kalori ve besin takibi
│   ├── overview/           Genel bakış ve MELiSSA diyagramı
│   ├── power/              Güç ve enerji yönetimi
│   └── ui/                 Yeniden kullanılabilir UI bileşenleri
├── context/                React context (global state)
├── hooks/                  Simülasyon döngüsü, kısayollar, bildirimler
├── simulation/             17 simülasyon motoru modülü
└── utils/                  Biçimlendirme ve veri dışa aktarma
```

---

## Bilimsel Kaynaklar

- NASA VEGGIE/APH Program Verileri (ISS VEG-01 ~ VEG-05, PH-02 ~ PH-04)
- ESA MELiSSA Pilot Plant (Universitat Autonoma de Barcelona, 1989-)
- CELSS Breadboard Project (Kennedy Space Center)
- Yuegong-1 / Lunar Palace (Beijing, 980 gün, %98.2 kapalılık)
- BIOS-3 (Krasnoyarsk, 315 m3, 180+ gün)
- Eden ISS (Antarktika, 26 tür, 268 kg hasat)
- NASA BVAD (TP-2015-218570/REV2)

Detaylı kaynak listesi: [`KAYNAKCA.md`](./KAYNAKCA.md)

---

## Lisans

MIT License - [LICENSE](./LICENSE)
