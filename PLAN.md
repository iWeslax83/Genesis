# GENESIS - Kapsamlı Geliştirme Planı
## Uzay Tarımı Biyorejeneratif Yaşam Destek Simülatörü

---

## 1. ARAŞTIRMA BULGULARI

### 1.1 Referans Projeler

| Proje | Platform | Öne Çıkan Özellik | Genesis'e Katkısı |
|-------|----------|-------------------|-------------------|
| **NASA VEGGIE/APH** | ISS | 180+ sensör, otomatik çevre kontrolü | Sensör modellemesi referansı |
| **MIT OpenAg** | Masaüstü | "İklim Reçeteleri" - büyüme aşamasına göre JSON ayarları | Climate Recipe sistemi |
| **FarmBot** | React Web | Sürükle-bırak çiftlik haritası, görsel programlama | UI/UX ilhamı |
| **Mycodo** | Python/Flask | PID tabanlı kontrol, zaman serisi grafikleri | Otomasyon mantığı |
| **ESA MELiSSA** | Araştırma | Kapalı döngü konsepti, spirulina kültürleri | Zaten uygulandı ✓ |
| **BIOS-3** | Gerçek tesis | 63m² ekim alanı, uzun süreli kapalı ortam | Referans veriler |
| **Yuegong-1** | Gerçek tesis | 980 gün, %98.2 malzeme döngüsü | Zaten referans ✓ |

### 1.2 Biyolojik Bilgiler - Mevcut vs Eksik

#### ✅ Zaten Uygulanan Biyolojik Özellikler:
- 12 bitki türü (gerçek NASA/ESA verileriyle)
- Sigmoid büyüme eğrisi + çevresel çarpanlar
- Spirulina üretimi (stokiyometrik O₂/CO₂)
- Mantar üretimi (substrat dengesi)
- Un kurdu protein geri dönüşümü (Tenebrio molitor)
- MELiSSA kapalı döngü modeli
- Etilen kontrolü (APH referans ≤25 ppb)
- NDVI bitki sağlığı indeksi
- Patojen risk değerlendirmesi
- Radyasyon etkileri (GCR + SPE)

#### ❌ Eksik Biyolojik Özellikler:

**a) İklim Reçeteleri (Climate Recipes)**
- Her bitki için büyüme aşamasına göre farklı çevresel ihtiyaçlar
- Aşamalar: Çimlenme → Fide → Vejetatif → Çiçeklenme → Meyve → Hasat
- Her aşamada farklı: sıcaklık, nem, ışık yoğunluğu, ışık süresi, CO₂, pH, EC
- Örnek: Marul çimlenmede 24°C, vejetatif dönemde 20°C, hasatta 18°C ister

**b) Büyüme Derece Günü (GDD - Growing Degree Days)**
- Mevcut: sabit gün sayısına göre büyüme
- Gerçek: sıcaklık bazlı kümülatif hesap
- Formül: GDD = Σ max(0, T_ortalama - T_taban)
- Domates T_taban: 10°C, Buğday: 4.4°C, Marul: 4°C

**c) Günlük Işık İntegrali (DLI)**
- DLI = PPFD × fotoperiod × 0.0036 (mol/m²/gün)
- Marul: 12-17 mol/m²/gün optimal
- Domates: 20-30 mol/m²/gün optimal
- Büyüme hızını doğrudan etkiler

**d) Çözünmüş Oksijen (DO)**
- Hidroponik kök sağlığı için kritik (>5 mg/L)
- Sıcaklık arttıkça DO kapasitesi düşer
- Pythium (kök çürüklüğü) riski düşük DO'da artar

**e) Besin Çözeltisi Reçeteleri (Hoagland Bazlı)**
- Yapraklı sebzeler: N=150-200, P=30-50, K=200-250 ppm
- Meyve bitkileri: K=250-350 ppm (meyve döneminde)
- Ca=150-250 ppm (çiçek ucu çürüklüğü önleme)
- Mikro elementler: Fe, B, Mn, Zn, Cu, Mo

**f) Hastalık Yayılma Mekanizması**
- Mevcut: basit risk yüzdesi
- Gerekli: bitki arası yayılma, kuluçka süresi, tedavi mekanizması
- Pythium: nem >85%, DO <4 mg/L → tetikleme
- Botrytis: nem >80%, sıcaklık 15-25°C → tetikleme
- Fusarium: pH düzensizliği → tetikleme

**g) Ardışık Ekim Planı (Succession Planting)**
- Sürekli hasat için kademeli ekim
- Her 7-14 günde yeni parti marul ekimi
- Her 30 günde yeni parti turp ekimi
- Otomatik takvim hesaplama

**h) Dinamik Menü Sistemi**
- Mevcut: sabit 4 öğünlük menü
- Gerekli: mevcut üretime dayalı otomatik menü oluşturma
- Kalori, protein, vitamin dengesi gözetimi
- Astronot tercihlerine uyum

---

## 2. UYGULAMA PLANI

### Öncelik 1: Biyolojik Doğruluk (constants.js + simulation/)

#### 2.1 İklim Reçeteleri Sistemi
**Dosya:** `src/simulation/constants.js`
**Değişiklik:** Her bitkiye `growthPhases` dizisi ekle

```javascript
// Örnek yapı:
potato: {
  ...mevcutÖzellikler,
  growthPhases: [
    { name: 'Çimlenme', days: 10, temp: 22, humidity: 80, ppfd: 0, co2: 400, ph: 5.8, ec: 0.5 },
    { name: 'Fide', days: 15, temp: 22, humidity: 70, ppfd: 300, co2: 800, ph: 5.8, ec: 1.2 },
    { name: 'Vejetatif', days: 40, temp: 20, humidity: 65, ppfd: 450, co2: 1000, ph: 5.8, ec: 2.0 },
    { name: 'Yumru Oluşumu', days: 25, temp: 18, humidity: 60, ppfd: 400, co2: 800, ph: 5.8, ec: 2.2 },
    { name: 'Olgunlaşma', days: 15, temp: 16, humidity: 55, ppfd: 300, co2: 600, ph: 5.8, ec: 1.8 },
  ],
  gpiBase: 10, // Growing Degree Day taban sıcaklığı
  gddToMaturity: 1800, // Toplam GDD ihtiyacı
  dliOptimal: 18, // mol/m²/gün
  dliMin: 12,
  dliMax: 25,
}
```

#### 2.2 GDD Büyüme Modeli
**Dosya:** `src/simulation/plantGrowthModel.js`
**Değişiklik:** Sigmoid modele GDD katmanı ekle

```javascript
// Her tick'te:
// 1. Günlük ortalama sıcaklığı al
// 2. GDD += max(0, T_avg - T_base)
// 3. Olgunluk yüzdesi = GDD / GDD_maturity
// 4. Mevcut sigmoid ile birleştirilmiş hibrit model
```

#### 2.3 DLI Hesaplama
**Dosya:** `src/simulation/plantGrowthModel.js`
**Değişiklik:** Işık integral hesabı ekle

```javascript
// DLI = PPFD(µmol/m²/s) × fotoperiod(saat) × 3600 / 1000000
// Büyüme çarpanı = clamp(actualDLI / optimalDLI, 0.3, 1.2)
```

#### 2.4 Besin Çözeltisi Reçeteleri
**Dosya:** `src/simulation/constants.js`
**Değişiklik:** Yeni `NUTRIENT_RECIPES` objesi

```javascript
export const NUTRIENT_RECIPES = {
  leafy: { N: 180, P: 40, K: 220, Ca: 180, Mg: 50, Fe: 3, pH: 6.0, EC: 1.4 },
  fruiting: { N: 160, P: 50, K: 300, Ca: 220, Mg: 50, Fe: 4, pH: 5.8, EC: 2.5 },
  root: { N: 140, P: 60, K: 250, Ca: 150, Mg: 40, Fe: 3, pH: 5.8, EC: 2.0 },
  grain: { N: 120, P: 40, K: 180, Ca: 100, Mg: 30, Fe: 2, pH: 6.0, EC: 1.8 },
}
```

#### 2.5 Çözünmüş Oksijen
**Dosya:** `src/simulation/constants.js` + `waterProcessing.js`
**Değişiklik:** DO sensörü ve hesaplaması

```javascript
// DO doyma kapasitesi (mg/L) = 14.6 - 0.39*T + 0.007*T²
// Gerçek DO = doyma * aerasyon_verimi
// Kök sağlığı çarpanı = DO > 5 ? 1.0 : DO/5 * 0.7 + 0.3
```

### Öncelik 2: Simülasyon Derinliği (simulation/)

#### 2.6 Hastalık Yayılma Modeli
**Dosya:** `src/simulation/pathogenModel.js`
**Değişiklik:** Yayılma mekanizması ekle

```javascript
// Hastalık durumları: sağlıklı → enfekte → semptomatik → ağır
// Yayılma: komşu bitkiye proximity bazlı
// Kuluçka: 2-5 gün (hastalığa göre)
// Tedavi: etkilenen parametreyi düzelt → iyileşme başlar
// Karantina: enfekte bitkiyi izole et (yield %50 azalır)
```

#### 2.7 Ardışık Ekim Planlayıcı
**Dosya:** `src/simulation/successionPlanner.js` (YENİ)
**İçerik:**

```javascript
// Her bitki için ekim aralığı hesapla:
// interval = growthDays / (istenen_aktif_parti_sayısı)
// Otomatik ekim takvimi oluştur
// Hasat tahmin tarihleri
// Sürekli üretim garantisi
```

### Öncelik 3: UI/Kullanıcı Deneyimi (components/)

#### 2.8 Dinamik Menü Oluşturucu
**Dosya:** `src/components/nutrition/NutritionPage.jsx`
**Değişiklik:** Sabit menüyü dinamik sisteme çevir

```javascript
// Mevcut hasattan menü oluştur:
// 1. Hazır bitkileri listele
// 2. Kalori/protein/vitamin dengesi hesapla
// 3. 4 öğüne dağıt (sabah, öğle, akşam, atıştırma)
// 4. Spirulina takviyesini dahil et
```

#### 2.9 Gelişmiş AI Tahmin Sistemi
**Dosya:** `src/simulation/anomalyDetector.js`
**Değişiklik:** Trend analizi ve prediktif uyarılar

```javascript
// Rate-of-change tespiti: ΔT/Δt > eşik → erken uyarı
// Lineer regresyon ile 6 saat sonrası tahmin
// Hasat güven aralığı: ±%X (çevresel kararlılığa göre)
// Kaynak tükenme tahmini: "Su X günde kritik seviyeye düşecek"
```

#### 2.10 GrowthMonitor'da İklim Reçetesi Gösterimi
**Dosya:** `src/components/growth/GrowthMonitorPage.jsx`
**Değişiklik:** Her bitkinin mevcut aşamasını ve hedef değerlerini göster

---

## 3. DOSYA DEĞİŞİKLİK HARİTASI

| Dosya | İşlem | Açıklama |
|-------|-------|----------|
| `src/simulation/constants.js` | **GÜNCELLE** | İklim reçeteleri, besin reçeteleri, GDD sabitleri, DO sabitleri |
| `src/simulation/plantGrowthModel.js` | **GÜNCELLE** | GDD modeli, DLI hesabı, iklim reçetesi entegrasyonu |
| `src/simulation/pathogenModel.js` | **GÜNCELLE** | Yayılma mekanizması, kuluçka süresi, tedavi |
| `src/simulation/anomalyDetector.js` | **GÜNCELLE** | Trend analizi, prediktif uyarılar, güven aralıkları |
| `src/simulation/waterProcessing.js` | **GÜNCELLE** | Çözünmüş oksijen, gri su/atık su ayrımı |
| `src/simulation/resourceFlowEngine.js` | **GÜNCELLE** | Besin çözeltisi tüketimi, DO entegrasyonu |
| `src/simulation/successionPlanner.js` | **YENİ** | Ardışık ekim takvimi hesaplayıcı |
| `src/context/GenesisContext.jsx` | **GÜNCELLE** | Yeni state alanları (DO, DLI, GDD, nutrientRecipe) |
| `src/hooks/useSimulation.js` | **GÜNCELLE** | Yeni modüllerin tick döngüsüne eklenmesi |
| `src/components/nutrition/NutritionPage.jsx` | **GÜNCELLE** | Dinamik menü oluşturucu |
| `src/components/growth/GrowthMonitorPage.jsx` | **GÜNCELLE** | İklim reçetesi gösterimi, GDD/DLI bilgisi |
| `src/components/ai/AIPredictionPage.jsx` | **GÜNCELLE** | Gelişmiş tahminler, trend grafikleri |

---

## 4. BİLİMSEL REFERANSLAR

- **NASA BVAD Rev2** (NASA/TP-2015-218570): Mürettebat metabolizma verileri
- **NASA CELSS BPC**: Bitki verim verileri (5 döngü, 16 bitki türü)
- **ESA MELiSSA**: Spirulina stokiyometrisi, kapalı döngü konsepti
- **Eden ISS**: Verim verileri (mizuna 194 g/m²/gün, turp 78 g/m²/gün)
- **Yuegong-1**: 980 gün kapalı ortam, %98.2 malzeme döngüsü
- **BIOS-3**: 63m² ekim alanı, 6 kişi kapalı ortam
- **MIT OpenAg**: İklim reçetesi konsepti
- **Hoagland & Arnon (1950)**: Besin çözeltisi formülasyonu
- **PlantVillage Dataset**: 54,000+ yaprak hastalık görüntüsü (38 sınıf)
- **ISS VEGGIE/APH Deneyleri**: VEG-01 (2014), VEG-03 (2016), PH-02 (2020), PH-04 (2021)
