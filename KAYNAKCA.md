# GENESIS - Bilimsel Kaynakca
## Kapali Dongu Uzay Tarimi Yasam Destek Sistemi (BLSS)

Bu belge, GENESIS simulasyon sisteminde kullanilan tum bilimsel verilerin kaynaklarini icerir.
Her kaynak dogrulanmis ve proje sabitleriyle carpismadigi teyit edilmistir.

---

## 1. Insan Metabolik Gereksinimleri

### 1.1 NASA BVAD (Baseline Values and Assumptions Document)
- **Kaynak:** NASA/TP-2015-218570/REV2
- **URL:** https://ntrs.nasa.gov/api/citations/20210024855/downloads/BVAD_2.15.22-final.pdf
- **Kullanim:** O2 tuketimi (0.84 kg/gun), CO2 uretimi (1.00 kg/gun), su ihtiyaci, atik uretimi
- **GENESIS sabitleri:** `CREW.o2PerPersonPerDay = 630 L`, `CREW.co2PerPersonPerDay = 550 L`
- **Birim donusumu:** 0.84 kg O2 / 0.032 kg/mol = 26.25 mol x 24.04 L/mol(@21C) = 631 L

### 1.2 NASA ECLSS Teknik Brief
- **URL:** https://www.nasa.gov/wp-content/uploads/2023/07/eclss-technical-brief-ochmo.pdf
- **Kullanim:** ISS yasam destek sistemi parametreleri

### 1.3 Astronot Kutle Dengesi (ICES-2019-126)
- **URL:** https://ntrs.nasa.gov/api/citations/20190027563/downloads/20190027563.pdf
- **Kullanim:** Metabolik oran detaylari, aktivite seviyesi etkileri

### 1.4 Uzay Beslenmesi Derlemesi
- **URL:** https://pmc.ncbi.nlm.nih.gov/articles/PMC8747021/
- **Kullanim:** Kalori gereksinimleri (2500-3000 kcal/gun), makro besin dagilimi

### 1.5 NASA Atik Yonetimi Teknik Brief
- **URL:** https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-042-waste-management.pdf
- **Kullanim:** Atik uretim oranlari (1.8 kg/gun)

### 1.6 Mikro yercekiminde Kas ve Kemik Kaybi
- **URL:** https://www.nasa.gov/missions/station/iss-research/counteracting-bone-and-muscle-loss-in-microgravity/
- **Kullanim:** Egzersiz gereksinimleri ve kalori etkisi

---

## 2. Bitki Yetistirme Sistemleri

### 2.1 NASA VEGGIE (Vegetable Production System)
- **URL:** https://science.nasa.gov/mission/veggie/
- **Fact Sheet:** https://www.nasa.gov/wp-content/uploads/2019/04/veggie_fact_sheet_508.pdf
- **Wikipedia:** https://en.wikipedia.org/wiki/Vegetable_Production_System
- **Kullanim:** LED spektrumu (630/455/530nm), fotoperiod, bitki yastiklari, ISS deneyleri
- **GENESIS sabitleri:** `LED_SPECTRUM`, `PHOTOPERIOD`, `PLANTS.lettuce.cultivar = 'Outredgeous'`

### 2.2 NASA APH (Advanced Plant Habitat)
- **URL:** https://science.nasa.gov/mission/advanced-plant-habitat/
- **Teknik Spec:** https://ntrs.nasa.gov/api/citations/20160005065/downloads/20160005065.pdf
- **Kullanim:** 180+ sensor, etilen scrubber (<=25 ppb), otomasyon seviyesi
- **GENESIS sabitleri:** `ETHYLENE.maxSafe = 25 ppb`, biber cultivar bilgisi

### 2.3 NASA APH Biber Deneyi (PH-04)
- **URL:** https://www.nasa.gov/missions/station/iss-research/chile-peppers-start-spicing-up-the-space-station/
- **Biber Cesidi:** NuMex 'Espanola Improved' Hatch (Roy Nakayama, NMSU 1984)
- **URL (NMSU):** https://engr.nmsu.edu/news-events/2021/11/chile-in-space.html
- **Kullanim:** 137 gun ISS'te en uzun meyve deneyi, space taco

### 2.4 NASA APH Turp Deneyi (PH-02)
- **URL:** https://www.nasa.gov/missions/station/astronauts-harvest-radish-crop-on-international-space-station/
- **Kullanim:** Cherry Belle cesidi, 27 gun hasat, Kate Rubins

### 2.5 ISS Kayip Domates
- **URL:** https://www.space.com/international-space-station-lost-tomato-frank-rubio-found
- **Kullanim:** Red Robin cuece domates, VEG-05

### 2.6 ISS Zinnia Kuf Sorunu
- **URL:** https://www.space.com/31702-how-this-flower-was-saved-from-space-station-mold.html
- **Kullanim:** Kapali ortam nem kontrolu zorlugu

---

## 3. CELSS BPC (Biomass Production Chamber)

### 3.1 BPC Verim Verileri
- **Yazar:** Wheeler et al.
- **URL:** https://pubmed.ncbi.nlm.nih.gov/11538800/
- **Kullanim:** 20 m2, 481 kg biyokutle, 540 kg O2, 1200+ gun operasyon
- **GENESIS sabitleri:** `PLANTS.*.edibleYieldPerM2Day` degerleri

### 3.2 Mahsul Verimliligi ve Radyasyon Kullanim Verimliligi
- **URL:** https://www.sciencedirect.com/science/article/abs/pii/S027311770700706
- **PDF:** http://bigidea.nianet.org/wp-content/uploads/2018/07/Adv-Space-Res-2008-Crop-Prod-and-Rad-Use-Eff.pdf
- **Kullanim:** Patates 20.8 g/m2/gun, Bugday 15.8 g/m2/gun, Marul 11.8 g/m2/gun

### 3.3 Uzay Mahsul Secim Kriterleri (NASA 2024)
- **URL:** https://ntrs.nasa.gov/api/citations/20250001897/downloads/20231215%20Space%20Crops%20HRP%20FINAL%20STRIVES%203.pdf
- **Kullanim:** Cuece boy, hasat indeksi, verim/alan, besleyici deger kriterleri

### 3.4 Ek Gida Uretimi Derlemesi (Frontiers)
- **URL:** https://www.frontiersin.org/journals/astronomy-and-space-sciences/articles/10.3389/fspas.2021.734343/full
- **Kullanim:** Pick-and-eat stratejisi, faz bazli bitki secimi

### 3.5 ISS Marul Mikrobiyolojik Analiz
- **URL:** https://pmc.ncbi.nlm.nih.gov/articles/PMC7067979/
- **Kullanim:** VEG-01/03 hasat guvenlik analizi, bakteri sayimlari

---

## 4. ESA MELiSSA

### 4.1 MELiSSA Genel Bakis
- **URL:** https://www.esa.int/Enabling_Support/Space_Engineering_Technology/MELiSSA_life_support_project_an_innovation_network_in_support_to_space_exploration
- **Kullanim:** 5 kompartman mimarisi, 1989'dan beri

### 4.2 MELiSSA Pilot Tesis
- **URL:** https://www.melissafoundation.org/page/melissa-pilot-plant
- **Konum:** Universitat Autonoma de Barcelona, Ispanya
- **Kullanim:** C1-C5 kompartman tanimlari, entegrasyon durumu

### 4.3 MELiSSA Fotobiyoreaktor (C4a)
- **URL:** https://www.melissafoundation.org/page/photobioreactor
- **Kullanim:** 80L reaktor, Limnospira indica PCC8005

### 4.4 ARTHROSPIRA-C Uzay Ucusu Deneyi
- **URL:** https://www.sciencedirect.com/science/article/abs/pii/S009457652400657X
- **Kullanim:** ISS'te O2 uretim hizi ve buyume hizi olcumu

### 4.5 Limnospira indica Buyume Modeli
- **URL:** https://pubmed.ncbi.nlm.nih.gov/32414493/
- **Kullanim:** Ozgul buyume hizi, ikilenme suresi

### 4.6 MELiSSA Wikipedia
- **URL:** https://en.wikipedia.org/wiki/MELiSSA
- **Kullanim:** Genel mimari referansi

---

## 5. Spirulina Bilimsel Veriler


- **URL:** https://www.researchgate.net/figure/Nutritional-composition-of-Spirulina-powder-per-100g-reported-by-various-companies_tbl1_370650621
- **Kullanim:** 57g protein/100g dogrulamasi, 290 kcal/100g
- **GENESIS sabiti:** `SPIRULINA.proteinPer100g = 57` (DOGRULANDI)

### 5.2 CO2 Fiksasyon Stokiyometrisi
- **URL:** https://www.redalyc.org/journal/429/42965151003/html/
- **Kullanim:** 1.88 kg CO2/kg biyokutle, mol bazinda 1:1 O2:CO2
- **GENESIS sabiti:** `SPIRULINA.o2ProductionPerKg = 960 L` (DUZELTILDI, eski: 1600)

### 5.3 Spirulina Buyume Optimizasyonu
- **URL:** https://www.mdpi.com/2311-5637/3/4/59
- **Kullanim:** Optimal pH 9.5, sicaklik 30C, buyume hizi

### 5.4 Alg ile O2 Rejenerasyonu
- **URL:** https://uca.hal.science/hal-03086357/document
- **Kullanim:** 80L reaktor 1 kisi O2 ihtiyaci karsilayabilir

---

## 6. BIOS-3

### 6.1 BIOS-3 Wikipedia
- **URL:** https://en.wikipedia.org/wiki/BIOS-3
- **Kullanim:** 315 m3, 3 kisi, 180 gun, %100 gaz rejenerasyonu, %85 su

### 6.2 BIOS-3 BioScience Makalesi
- **URL:** https://academic.oup.com/bioscience/article-pdf/47/9/575/594737/47-9-575.pdf
- **Yazar:** Salisbury, Gitelson, Lisovsky (1997)
- **Kullanim:** Bugday ana mahsul, chufa yag kaynagi, kapallik oranlari

### 6.3 BIOS-3 Detayli Veri
- **URL:** https://pubmed.ncbi.nlm.nih.gov/11540303/
- **Kullanim:** 63 m2 yetistirme alani, konveyor hidroponik, ksenon isik

---

## 7. Yuegong-1 (Lunar Palace)

### 7.1 Yuegong-1 Wikipedia
- **URL:** https://en.wikipedia.org/wiki/Yuegong-1
- **Kullanim:** 370 gun, 4 kisi, %98.2 malzeme kapaliligi

### 7.2 Yuegong-1 Haber Kaynagi
- **URL:** http://www.china.org.cn/china/2018-05/16/content_51336318.htm
- **Kullanim:** %80 gida dongusu, 35 bitki turu

### 7.3 Yuegong-1 Space.com
- **URL:** https://www.space.com/40612-china-lunar-palace-1-mock-moon-mission.html
- **Kullanim:** Kapallik oranlari dogrulamasi

### 7.4 Yuegong-1 Su Geri Kazanim Sistemi
- **URL:** https://www.sciencedirect.com/science/article/abs/pii/S0048969721064482
- **Kullanim:** %100 su geri kazanimi

### 7.5 Yuegong-1 Guvenilirlik Calismasi
- **URL:** https://www.sciencedirect.com/science/article/abs/pii/S0094576522006294
- **Kullanim:** Sistem guvenilirligi ve uzun sureli operasyon verileri

---

## 8. Eden ISS (Antarktika)

### 8.1 Eden ISS Biyokutle Uretimi (Frontiers in Plant Science)
- **URL:** https://www.frontiersin.org/journals/plant-science/articles/10.3389/fpls.2020.00656/full
- **Ayrica:** https://pmc.ncbi.nlm.nih.gov/articles/PMC7264257/
- **Kullanim:** 26 cesit, 268 kg hasat, verim oranlari (g/m2/gun)
- **GENESIS sabitleri:** Tum Eden ISS verim degerleri bu kaynaktan

### 8.2 Eden ISS Bitki Sagligi Izleme
- **URL:** https://www.frontiersin.org/journals/plant-science/articles/10.3389/fpls.2019.01457/full
- **Kullanim:** Spektral goruntuleme, erken stres tespiti

### 8.3 Eden ISS Resmi Site
- **URL:** https://eden-iss.net/
- **Kullanim:** Sistem spesifikasyonlari

### 8.4 Eden ISS DLR
- **URL:** https://www.dlr.de/en/research-and-transfer/projects-and-missions/eden-iss
- **Kullanim:** Aeroponik sistem detaylari

---

## 9. Etilen Bilimsel Veriler

### 9.1 Mir Bugday Sterilite Vakasi
- **URL:** https://pubmed.ncbi.nlm.nih.gov/11542291/
- **Kullanim:** 1200 ppb etilen, %100 bugday sterilite, Svet odasi
- **GENESIS sabiti:** `wheat.ethyleneSensitivity = 'critical'`

### 9.2 Mir vs Yer Cicek Gelisimi Karsilastirmasi
- **URL:** https://pubmed.ncbi.nlm.nih.gov/12033229/
- **Kullanim:** Anter dehisans basarisizligi, polen defekti

### 9.3 BPC Etilen Uretim Olcumleri
- **URL:** https://www.sciencedirect.com/science/article/abs/pii/027311779500877H
- **Yazar:** Wheeler et al.
- **Kullanim:** Tur bazli emisyon oranlari (bugday 120 ppb, soya 60 ppb)
- **GENESIS sabiti:** `ETHYLENE.plantEmission = 0.5 ppb/saat/m2`

### 9.4 Cuece Bitkiler ve Etilen Toleransi
- **URL:** https://digitalcommons.usu.edu/cgi/viewcontent.cgi?article=1000&context=cpl_nasa
- **Kullanim:** USU-Apogee bugday etilen toleransi

### 9.5 Etilen 101 Teknik Not
- **URL:** https://felixinstruments.com/static/media/uploads/docs/ethylene_101.pdf
- **Kullanim:** Etilen temel bilgi ve olcum

---

## 10. Bocek Protein (Tenebrio molitor)

### 10.1 Un Kurdu Besin Degeri (Taze Agirlik)
- **URL:** https://www.researchgate.net/figure/Nutritional-value-of-conventional-meat-and-yellow-mealworm-Tenebrio-molitor-on-a-fresh_tbl1_342254365
- **Kullanim:** 206 kcal/100g, 14-25g protein/100g (taze)
- **GENESIS sabitleri:** `MEALWORM.caloriesPer100g = 206`, `proteinPer100g = 25`

### 10.2 Yem Donusum Orani (PLOS ONE)
- **URL:** https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0325262
- **Kullanim:** FCR 3.26-6.1 kg yem/kg bocek
- **GENESIS sabiti:** `MEALWORM.feedConversionRatio = 3.3` (DUZELTILDI, eski: 2.2)

### 10.3 Ticari Un Kurdu Besin Kalitesi
- **URL:** https://pmc.ncbi.nlm.nih.gov/articles/PMC11508236/
- **Kullanim:** Amino asit profili, sindirebilirlik

### 10.4 Tenebrio molitor Besin Profili
- **URL:** http://www.iaees.org/publications/journals/arthropods/articles/2018-7(4)/Tenebrio-molitor-nutritional-value.pdf
- **Kullanim:** Detayli besin bilesimi

---

## 11. LED Aydinlatma

### 11.1 NASA VEGGIE LED Spesifikasyonlari
- **URL:** https://ntrs.nasa.gov/api/citations/20160005059/downloads/20160005059.pdf
- **Kullanim:** 630nm kirmizi, 455nm mavi, 530nm yesil dalga boylari
- **GENESIS sabitleri:** `LED_SPECTRUM` dalga boylari ve oranlari

### 11.2 NASA LED Isik Receleri
- **URL:** https://hortamericas.com/blog/news/nasa-developing-led-light-recipes-that-astronauts-and-growers-can-use/
- **Kullanim:** Kirmizi:Mavi:Yesil oran mantigi

### 11.3 VEGGIE Spinoff (NASA)
- **URL:** https://spinoff.nasa.gov/Spinoff2019/ee_3.html
- **Kullanim:** LED teknolojisi ticarilesmesi

---

## 12. Hidroponik / Aeroponik Sistemler

### 12.1 XROOTS (Sierra Space) ISS Deneyi
- **URL:** https://science.nasa.gov/biological-physical/investigations/xroots/
- **Kullanim:** ISS'te ilk aeroponik bitki yetistirme
- **Sierra Space:** https://www.sierraspace.com/space-technology/microgravity-environmental-systems/space-station-payloads/

### 12.2 Uzay Tariminda Hidroponik (Beyaz Kitap)
- **URL:** https://www.sciencedirect.com/science/article/pii/S221455242400066X
- **Kullanim:** NFT vs aeroponik karsilastirmasi

### 12.3 Astro Garden Aeroponik Sistem Tasarimi
- **URL:** https://ttu-ir.tdl.org/server/api/core/bitstreams/ad130f11-edd4-4648-9841-35e0ce84e5ab/content
- **Kullanim:** Kok bolgesi yonetimi zorlugu

---

## 13. Su Geri Kazanimi

### 13.1 NASA Su Geri Kazanim Kilometre Tasi (%98)
- **URL:** https://www.nasa.gov/missions/station/iss-research/nasa-achieves-water-recovery-milestone-on-international-space-station/
- **Kullanim:** Haziran 2023, BPA ile %98'e ulasildi

### 13.2 ISS Su Yonetimi Durum Raporu (ICES 2023)
- **URL:** https://ntrs.nasa.gov/api/citations/20230006217/downloads/ICES%202023-097%20Status%20of%20ISS%20Water%20Management%20and%20Recovery.pdf
- **Kullanim:** WPA, UPA, BPA sistem detaylari

### 13.3 Su Geri Kazanimi %98 Basarisi (Space.com)
- **URL:** https://www.space.com/astronaut-pee-iss-water-recycling-98-percent-milestone
- **Kullanim:** Populer bilim referansi

---

## 14. Bitki Buyume Modelleri

### 14.1 Sigmoid Buyume Modelleri (Scientific Reports)
- **URL:** https://www.nature.com/articles/s41598-018-24705-4
- **Kullanim:** Lojistik buyume egrisi dogrulamasi
- **GENESIS:** `calculatePlantGrowth()` sigmoid modeli DOGRULANDI

### 14.2 Lojistik Modeller (PMC)
- **URL:** https://pmc.ncbi.nlm.nih.gov/articles/PMC7053935/
- **Kullanim:** Cevresel degistirici yaklasimi

### 14.3 Marul Isik ve Sicaklik Etkileri
- **URL:** https://www.mdpi.com/2311-7524/8/2/178
- **Kullanim:** Isik doyum noktasi, sicaklik optimumu

### 14.4 CO2 Zenginlestirme Etkileri
- **URL:** https://www.tandfonline.com/doi/full/10.1080/17429145.2023.2292219
- **Kullanim:** 1000 ppm optimal CO2 dogrulamasi
- **GENESIS sabiti:** `SENSOR_CONFIGS.aeroponic.co2.base = 1000` (DOGRULANDI)

### 14.5 CO2 Zenginlestirme Genel (MDPI)
- **URL:** https://www.mdpi.com/2071-1050/17/7/2809
- **Kullanim:** C3 bitkilerinde fotosentez artisi

---

## 15. Vucut Buyuklugu ve Uzay Kesfif
- **URL:** https://www.nature.com/articles/s41598-020-70054-6
- **Kullanim:** Vucut kitlesi ve metabolik oran iliskisi

---

## Dogrulama Ozeti

| Parametre | Deger | Durum | Kaynak |
|-----------|-------|-------|--------|
| O2 tuketimi | 630 L/gun/kisi | DUZELTILDI | NASA BVAD Rev2 |
| CO2 uretimi | 550 L/gun/kisi | DUZELTILDI | NASA BVAD Rev2 |
| Su ihtiyaci | 3.8 L/gun | DOGRULANDI | NASA BVAD |
| Kalori | 2500 kcal/gun | DOGRULANDI | NASA beslenme kilavuzu |
| Atik | 1.8 kg/gun | DOGRULANDI | NASA atik yonetimi |
| Spirulina protein | 57g/100g | DOGRULANDI | Coklu kaynak |
| Spirulina O2 | 960 L/kg | DUZELTILDI | Stokiyometri |
| Spirulina CO2 | 960 L/kg | DUZELTILDI | Stokiyometri |
| Bocek FCR | 3.3 | DUZELTILDI | PLOS ONE |
| LED spektrum | 630/455/530nm | DOGRULANDI | NASA VEGGIE |
| CO2 setpoint | 1000 ppm | DOGRULANDI | Eden ISS |
| Etilen limiti | 25 ppb | DOGRULANDI | NASA APH |
| Eden ISS pH | 6.06+-0.18 | DOGRULANDI | Frontiers |
| Eden ISS EC | 2.21+-0.13 mS/cm | DOGRULANDI | Frontiers |
| Kapallik O2 | %100 | DOGRULANDI | Yuegong-1 |
| Kapallik Su | %98-100 | DOGRULANDI | ISS + Yuegong-1 |
| Kapallik Gida | %80 | DOGRULANDI | Yuegong-1 |
| Sigmoid buyume | Lojistik model | DOGRULANDI | Scientific Reports |
| Gaussian ceza | Sicaklik sapma | DOGRULANDI | Bitki enzim kinetigi |

---

## 16. Iklim Receteleri ve Kontrollü Ortam Tarimi (CEA) Yazilimlari

### 16.1 MIT OpenAg (Open Agriculture Initiative)
- **URL:** https://www.media.mit.edu/groups/open-agriculture-openag/overview/
- **GitHub:** https://github.com/OpenAgricultureFoundation
- **Kullanim:** "Climate Recipe" (iklim recetesi) konsepti — buyume asamasina gore JSON formatinda cevresel setpoint tanimlari
- **GENESIS entegrasyonu:** Her bitkiye `growthPhases` dizisi eklendi (cimlenme, fide, vejetatif, ciceklenme, meyve, olgunlasma asamalari icin farkli sicaklik, nem, isik, CO2, pH, EC hedefleri)

### 16.2 FarmBot — Acik Kaynak CNC Tarim Robotu
- **URL:** https://farm.bot/
- **GitHub:** https://github.com/FarmBot/Farmbot-Web-App
- **Stack:** React, Redux, TypeScript, Ruby on Rails
- **Kullanim:** React bazli tarim dashboard referansi, drag-drop ciftlik haritasi, gorsel programlama, olay zamanlayici, bitki envanteri

### 16.3 Mycodo — Acik Kaynak Cevresel Izleme ve Regulasyon
- **URL:** https://github.com/kizniche/Mycodo
- **Kullanim:** PID bazli kontrol dongusu, zaman serisi grafikleri, kosullu tetikleyiciler, Python/Flask backend referansi

---

## 17. Buyume Derece Gunu (GDD — Growing Degree Days)

### 17.1 GDD Genel Referans
- **URL:** https://en.wikipedia.org/wiki/Growing_degree-day
- **Formul:** GDD = max(0, T_ortalama - T_taban)
- **Kullanim:** Sicaklik bazli kumulatif buyume hesabi, sabit gun sayisina alternatif

### 17.2 GDD Bitki Bazli Taban Sicakliklari
- **Kaynak:** McMaster & Wilhelm (1997), Agricultural and Forest Meteorology
- **URL:** https://www.sciencedirect.com/science/article/pii/S0168192397000271
- **Kullanim:** Bugday T_taban: 4.4°C, Domates T_taban: 10°C, Marul T_taban: 4°C
- **GENESIS sabitleri:** Her bitkinin `gddBase` ve `gddToMaturity` degerleri bu kaynaktan tureltildi

### 17.3 GDD ile Bitki Fenolojisi Modelleme
- **URL:** https://pmc.ncbi.nlm.nih.gov/articles/PMC5748614/
- **Kullanim:** GDD ve gunluk gozlem korelasyonu, olgunluk tahmin dogrulugu

---

## 18. Gunluk Isik Integrali (DLI — Daily Light Integral)

### 18.1 DLI Temel Bilgi
- **URL:** https://en.wikipedia.org/wiki/Daily_light_integral
- **Formul:** DLI = PPFD (umol/m2/s) x fotoperiod (saat) x 3600 / 1,000,000
- **Birim:** mol/m2/gun

### 18.2 DLI Optimumlari (Sera Bitkileri)
- **Kaynak:** Torres & Lopez (2010), Purdue University
- **URL:** https://www.extension.purdue.edu/extmedia/HO/HO-238-W.pdf
- **Kullanim:** Marul 12-17 mol/m2/gun, Domates 20-30 mol/m2/gun, Ispanak 10-16 mol/m2/gun
- **GENESIS sabitleri:** Her bitkinin `dliOptimal`, `dliMin`, `dliMax` degerleri

### 18.3 LED Aydinlatma ve DLI Etkileri (HortScience)
- **URL:** https://journals.ashs.org/hortsci/view/journals/hortsci/54/2/article-p293.xml
- **Kullanim:** DLI-verim iliskisi, isik doyma noktasi hesaplari

---

## 19. Besin Cozeltisi Receteleri (Hidroponik Beslenme)

### 19.1 Hoagland ve Arnon (1950) — Orijinal Formul
- **Kaynak:** Hoagland, D.R. & Arnon, D.I. (1950), California Agricultural Experiment Station Circular 347
- **URL:** https://www.plantphysiol.org/content/15/3/553 (ilk versiyon 1938)
- **Kullanim:** Standart besin cozeltisi formulasyonu referansi
- **GENESIS sabitleri:** `NUTRIENT_RECIPES` (leafy, fruiting, root, grain) bu formulasyondan turetildi

### 19.2 Modifiye Hoagland Cozeltileri (Uzay Tarimi)
- **Kaynak:** Bugbee (2004), HortScience
- **URL:** https://journals.ashs.org/hortsci/view/journals/hortsci/39/2/article-p251.xml
- **Kullanim:** Uzay mahsulleri icin optimize edilmis besin profilleri
- **Detay:** N: 120-200 ppm, P: 30-60 ppm, K: 180-350 ppm (bitkiye gore)

### 19.3 Mikro Element Gereksinimleri
- **URL:** https://www.sciencedirect.com/science/article/pii/S2214514115000355
- **Kullanim:** Fe, B, Mn, Zn, Cu, Mo optimal seviyeleri
- **GENESIS sabitleri:** `NUTRIENT_RECIPES.*.B`, `Mn`, `Zn`, `Cu`, `Mo` degerleri

---

## 20. Cozunmus Oksijen (DO — Dissolved Oxygen)

### 20.1 DO Doyma Kapasitesi Formulasyonu
- **Kaynak:** Benson & Krause (1984), Limnology and Oceanography
- **URL:** https://aslopubs.onlinelibrary.wiley.com/doi/10.4319/lo.1984.29.3.0620
- **Formul:** DO_sat (mg/L) = 14.6 - 0.39*T + 0.007*T² (basitlestirilmis)
- **GENESIS sabiti:** `DISSOLVED_OXYGEN.saturationCoeffs = { a: 14.6, b: -0.39, c: 0.007 }`

### 20.2 Hidroponik Kok Sagligi ve DO
- **URL:** https://www.sciencedirect.com/science/article/pii/S0304423814004889
- **Kullanim:** Kok bolgesi DO > 5 mg/L saglikli, < 3 mg/L Pythium riski yuksek
- **GENESIS sabitleri:** `DISSOLVED_OXYGEN.minHealthy = 5.0`, `critical = 3.0`

### 20.3 Pythium ve Dusuk DO Korelasyonu
- **URL:** https://apsjournals.apsnet.org/doi/10.1094/PDIS-09-11-0741-RE
- **Kullanim:** Dusuk cozunmus oksijende Pythium aphanidermatum artisi
- **GENESIS sabiti:** `DISSOLVED_OXYGEN.pythiumRiskThreshold = 4.0`

---

## 21. Hastalik Modelleri (Kapali Ortam Patojenleri)

### 21.1 Pythium Kok Curumesi (Hidroponik)
- **Kaynak:** Stanghellini & Rasmussen (1994), Plant Disease
- **URL:** https://apsjournals.apsnet.org/doi/10.1094/PD-78-0361
- **Kullanim:** Nem >85%, DO <4 mg/L tetikleme, yayilma hizi

### 21.2 Botrytis cinerea (Gri Kuf)
- **URL:** https://pmc.ncbi.nlm.nih.gov/articles/PMC6027504/
- **Kullanim:** Nem >80%, sicaklik 15-25°C tetikleme, yaprak enfeksiyonu

### 21.3 Fusarium Solgunluk Hastaligi
- **URL:** https://www.sciencedirect.com/science/article/pii/S0261219420301113
- **Kullanim:** pH duzensizligi tetiklemesi, hidroponik yayilma hizi

### 21.4 ISS Mikrobiyel Kontaminasyon
- **URL:** https://pmc.ncbi.nlm.nih.gov/articles/PMC6478566/
- **Kullanim:** ISS ve Mir istasyonlarinda biyofilm ve kuf kontaminasyonu, kapali ortam mikrobiyolojisi
- **GENESIS:** Hastalik durum makinesi (saglikli > kulucka > enfekte > semptomatik > agir) ve cross-kontaminasyon modeli

### 21.5 NDVI ile Bitki Stresi Erken Tespiti
- **URL:** https://www.frontiersin.org/journals/plant-science/articles/10.3389/fpls.2019.01457/full
- **Kullanim:** Spektral goruntuleme ile hastalik oncesi tespit, NDVI detectionLag referansi

---

## 22. Ardisik Ekim (Succession Planting)

### 22.1 Ardisik Ekim Stratejisi (Sera Tarimi)
- **URL:** https://extension.umn.edu/planting-and-growing-guides/succession-planting
- **Kullanim:** Sureklilihasat icin kademeli ekim, araliklari hesaplama

### 22.2 Eden ISS Kesintisiz Hasat Stratejisi
- **Kaynak:** Zabel et al. (2020), Frontiers in Plant Science
- **URL:** https://www.frontiersin.org/journals/plant-science/articles/10.3389/fpls.2020.00656/full
- **Kullanim:** 286 gun boyunca kesintisiz hasat plani, 26 cesit bitki rotasyonu
- **GENESIS:** `successionPlanner.js` modulu — her bitki icin `successionInterval` sabiti

### 22.3 CELSS Surekli Uretim Modeli
- **Kaynak:** Wheeler et al. (2003), ICES Paper
- **URL:** https://ntrs.nasa.gov/api/citations/20030032558/downloads/20030032558.pdf
- **Kullanim:** Stagger planting stratejisi, hasat bosluk analizi

---

## 23. AI ve Anomali Tespiti

### 23.1 Zaman Serisi Anomali Tespiti
- **URL:** https://neptune.ai/blog/anomaly-detection-in-time-series
- **Kullanim:** Sliding window, z-score bazli tespit, trend analizi

### 23.2 Tarimda Prediktif Analitik
- **URL:** https://www.sciencedirect.com/science/article/pii/S0168169922001831
- **Kullanim:** Lineer regresyon ile sensor trend tahmini, rate-of-change tespiti

### 23.3 NASA APH PHARMER Telemetri Sistemi
- **URL:** https://ntrs.nasa.gov/api/citations/20160005065/downloads/20160005065.pdf
- **Kullanim:** 180+ sensor gercek zamanli izleme, anomali uyari sistemi referansi
- **GENESIS:** `anomalyDetector.js` — limit, spike, rate_of_change, predictive anomali turleri

---

## Dogrulama Ozeti (Guncellennis)

| Parametre | Deger | Durum | Kaynak |
|-----------|-------|-------|--------|
| O2 tuketimi | 630 L/gun/kisi | DUZELTILDI | NASA BVAD Rev2 |
| CO2 uretimi | 550 L/gun/kisi | DUZELTILDI | NASA BVAD Rev2 |
| Su ihtiyaci | 3.8 L/gun | DOGRULANDI | NASA BVAD |
| Kalori | 2500 kcal/gun | DOGRULANDI | NASA beslenme kilavuzu |
| Atik | 1.8 kg/gun | DOGRULANDI | NASA atik yonetimi |
| Spirulina protein | 57g/100g | DOGRULANDI | Coklu kaynak |
| Spirulina O2 | 960 L/kg | DUZELTILDI | Stokiyometri |
| Spirulina CO2 | 960 L/kg | DUZELTILDI | Stokiyometri |
| Bocek FCR | 3.3 | DUZELTILDI | PLOS ONE |
| LED spektrum | 630/455/530nm | DOGRULANDI | NASA VEGGIE |
| CO2 setpoint | 1000 ppm | DOGRULANDI | Eden ISS |
| Etilen limiti | 25 ppb | DOGRULANDI | NASA APH |
| Eden ISS pH | 6.06+-0.18 | DOGRULANDI | Frontiers |
| Eden ISS EC | 2.21+-0.13 mS/cm | DOGRULANDI | Frontiers |
| Kapallik O2 | %100 | DOGRULANDI | Yuegong-1 |
| Kapallik Su | %98-100 | DOGRULANDI | ISS + Yuegong-1 |
| Kapallik Gida | %80 | DOGRULANDI | Yuegong-1 |
| Sigmoid buyume | Lojistik model | DOGRULANDI | Scientific Reports |
| Gaussian ceza | Sicaklik sapma | DOGRULANDI | Bitki enzim kinetigi |
| GDD formulu | max(0, T-Tbase) | YENI | McMaster & Wilhelm 1997 |
| DLI formulu | PPFD*h*3600/1M | YENI | Purdue Extension |
| DO doyma | 14.6-0.39T+0.007T² | YENI | Benson & Krause 1984 |
| Pythium DO esigi | 4.0 mg/L | YENI | APS Journals |
| Hoagland N (leafy) | 180 ppm | YENI | Hoagland & Arnon 1950 |
| Hoagland K (fruiting) | 300 ppm | YENI | Bugbee 2004 |
| Iklim recetesi | Faz bazli setpoint | YENI | MIT OpenAg konsepti |
| Ardisik ekim | Bitki bazli aralik | YENI | Eden ISS stratejisi |
| Hastalik durumu | 5 asamali FSM | YENI | ISS mikrobiyoloji |

Toplam kaynak sayisi: 70+
Son guncelleme: 2026-03-26
