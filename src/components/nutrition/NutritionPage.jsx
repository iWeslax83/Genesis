import React from 'react';
import { useGenesis } from '../../context/GenesisContext';
import { CREW } from '../../simulation/constants';
import { formatNumber } from '../../utils/formatters';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const SOURCE_COLORS = {
  aeroponic: '#22c55e',
  nft: '#06b6d4',
  spirulina: '#00f0ff',
  mushroom: '#a855f7',
  mealworm: '#ff8800',
};

const SOURCE_LABELS = {
  aeroponic: 'Aeroponik',
  nft: 'NFT Sebze',
  spirulina: 'Spirulina',
  mushroom: 'Mantar',
  mealworm: 'Böcek Protein',
};

function CalorieGauge({ produced, target }) {
  const ratio = Math.min(1, produced / target);
  const circumference = 2 * Math.PI * 70;
  const offset = circumference * (1 - ratio);
  const color = ratio >= 0.95 ? '#00ff88' : ratio >= 0.7 ? '#ff8800' : '#ff4466';

  return (
    <div className="flex flex-col items-center">
      <svg width={180} height={180} viewBox="0 0 180 180">
        <circle cx="90" cy="90" r="70" fill="none" stroke="#1a1f36" strokeWidth="12" />
        <circle
          cx="90" cy="90" r="70" fill="none" stroke={color} strokeWidth="12"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 90 90)"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
        <text x="90" y="80" textAnchor="middle" fill="#e2e8f0" fontSize="28" fontWeight="bold" fontFamily="monospace">
          {formatNumber(produced)}
        </text>
        <text x="90" y="100" textAnchor="middle" fill="#94a3b8" fontSize="12">
          / {formatNumber(target)} kcal
        </text>
        <text x="90" y="120" textAnchor="middle" fill={color} fontSize="16" fontWeight="bold">
          %{(ratio * 100).toFixed(1)}
        </text>
      </svg>
      <span className="text-xs text-nexus-text-dim mt-1">Günlük Kalori Üretimi</span>
    </div>
  );
}

function MacroBreakdown({ protein, carbs, fat }) {
  const total = protein * 4 + carbs * 4 + fat * 9;
  const data = [
    { name: 'Protein', value: protein, kcal: protein * 4, color: '#06b6d4' },
    { name: 'Karbonhidrat', value: carbs, kcal: carbs * 4, color: '#ff8800' },
    { name: 'Yağ', value: fat, kcal: fat * 9, color: '#a855f7' },
  ];

  return (
    <div className="bg-nexus-card rounded-xl border border-nexus-border p-4">
      <h3 className="text-xs text-nexus-text-dim uppercase tracking-wider mb-3">Makro Besin Dağılımı</h3>
      <div className="flex items-center gap-4">
        <ResponsiveContainer width={120} height={120}>
          <PieChart>
            <Pie data={data} dataKey="kcal" cx="50%" cy="50%" innerRadius={30} outerRadius={50} paddingAngle={2}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="space-y-2 flex-1">
          {data.map((d) => (
            <div key={d.name}>
              <div className="flex justify-between text-xs mb-0.5">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-nexus-text">{d.name}</span>
                </div>
                <span className="font-mono text-nexus-text-dim">{formatNumber(d.value)}g</span>
              </div>
              <div className="h-1 bg-nexus-bg rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{
                  width: `${total > 0 ? (d.kcal / total * 100) : 0}%`,
                  backgroundColor: d.color,
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SourceBreakdown({ bySource }) {
  const data = Object.entries(bySource).map(([key, val]) => ({
    name: SOURCE_LABELS[key] || key,
    value: Math.round(val),
    color: SOURCE_COLORS[key] || '#94a3b8',
  }));

  return (
    <div className="bg-nexus-card rounded-xl border border-nexus-border p-4">
      <h3 className="text-xs text-nexus-text-dim uppercase tracking-wider mb-3">Kaynak Bazında Üretim</h3>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#1a1f36" />
          <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 10 }} />
          <YAxis dataKey="name" type="category" width={80} tick={{ fill: '#94a3b8', fontSize: 10 }} />
          <Tooltip contentStyle={{ background: '#1a1f36', border: '1px solid #2a3154', borderRadius: 8 }} />
          <Bar dataKey="value" name="kcal">
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function CrewAllocation({ totalCalories }) {
  const perPerson = totalCalories / CREW.count;

  return (
    <div className="bg-nexus-card rounded-xl border border-nexus-border p-4">
      <h3 className="text-xs text-nexus-text-dim uppercase tracking-wider mb-3">Mürettebat Beslenme Dağılımı</h3>
      <div className="space-y-2">
        {CREW.members.map((member) => {
          const ratio = Math.min(1, perPerson / member.calorie);
          return (
            <div key={member.id} className="flex items-center gap-3">
              <span className="text-sm">👨‍🚀</span>
              <span className="text-xs text-nexus-text w-16">{member.name}</span>
              <div className="flex-1 h-2 bg-nexus-bg rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${ratio * 100}%`,
                    backgroundColor: ratio >= 0.95 ? '#00ff88' : ratio >= 0.7 ? '#ff8800' : '#ff4466',
                  }}
                />
              </div>
              <span className="text-xs font-mono text-nexus-text-dim w-20 text-right">
                {formatNumber(Math.round(perPerson))} / {member.calorie}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function VitaminPanel({ vitaminStatus }) {
  if (!vitaminStatus || Object.keys(vitaminStatus).length === 0) {
    return (
      <div className="bg-nexus-card rounded-xl border border-nexus-border p-4">
        <h3 className="text-xs text-nexus-text-dim uppercase tracking-wider mb-3">Vitamin / Mineral Durumu</h3>
        <div className="text-xs text-nexus-text-dim">Veri toplanıyor...</div>
      </div>
    );
  }

  const statusColors = {
    sufficient: '#00ff88',
    low: '#ff8800',
    deficient: '#ff4466',
  };

  const statusLabels = {
    sufficient: 'Yeterli',
    low: 'Düşük',
    deficient: 'Eksik',
  };

  return (
    <div className="bg-nexus-card rounded-xl border border-nexus-border p-4">
      <h3 className="text-xs text-nexus-text-dim uppercase tracking-wider mb-3">
        Vitamin / Mineral Durumu <span className="text-nexus-text-dim">(kişi başı / gün)</span>
      </h3>
      <div className="space-y-2.5">
        {Object.entries(vitaminStatus).map(([key, vit]) => {
          const ratio = Math.min(1, vit.ratio);
          const color = statusColors[vit.status];

          return (
            <div key={key}>
              <div className="flex justify-between items-center text-xs mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-nexus-text font-medium">{vit.name}</span>
                  <span
                    className="px-1.5 py-0.5 rounded text-[10px] font-mono"
                    style={{ backgroundColor: `${color}15`, color }}
                  >
                    {statusLabels[vit.status]}
                  </span>
                </div>
                <span className="font-mono text-nexus-text-dim">
                  {vit.dailyIntake.toFixed(1)} / {vit.dailyNeed} {vit.unit}
                </span>
              </div>
              <div className="h-1.5 bg-nexus-bg rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${ratio * 100}%`, backgroundColor: color }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Eksik vitamin uyarısı */}
      {Object.values(vitaminStatus).some(v => v.status === 'deficient') && (
        <div className="mt-3 p-2 rounded-lg bg-nexus-red/10 border border-nexus-red/20">
          <div className="flex items-start gap-1.5 text-xs text-nexus-red">
            <span>⚠</span>
            <span>
              Mikro besin eksiklikleri tespit edildi. Uzun süreli eksiklik mürettebat sağlığını ciddi şekilde etkiler.
              {Object.entries(vitaminStatus)
                .filter(([, v]) => v.status === 'deficient')
                .map(([, v]) => v.name)
                .join(', ')} takviyesi önerilir.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function BiodiversityScore({ score }) {
  const color = score >= 70 ? '#00ff88' : score >= 40 ? '#ff8800' : '#ff4466';
  const label = score >= 70 ? 'İyi Çeşitlilik' : score >= 40 ? 'Orta' : 'Düşük Çeşitlilik';
  const circumference = 2 * Math.PI * 35;
  const offset = circumference * (1 - score / 100);

  return (
    <div className="bg-nexus-card rounded-xl border border-nexus-border p-4 flex flex-col items-center">
      <h3 className="text-xs text-nexus-text-dim uppercase tracking-wider mb-3">
        Beslenme Çeşitliliği
      </h3>
      <svg width={90} height={90} viewBox="0 0 90 90">
        <circle cx="45" cy="45" r="35" fill="none" stroke="#1a1f36" strokeWidth="6" />
        <circle
          cx="45" cy="45" r="35" fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 45 45)"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
        <text x="45" y="42" textAnchor="middle" fill={color} fontSize="18" fontWeight="bold" fontFamily="monospace">
          {score}
        </text>
        <text x="45" y="56" textAnchor="middle" fill="#94a3b8" fontSize="8">
          / 100
        </text>
      </svg>
      <span className="text-xs font-medium mt-1" style={{ color }}>{label}</span>
      <p className="text-[10px] text-nexus-text-dim text-center mt-1">
        Shannon İndeksi — kalori kaynaklarının eşit dağılımını ölçer
      </p>
    </div>
  );
}

function MenuSuggestion({ bySource, harvestLog }) {
  // Dinamik menü oluşturma — mevcut üretim verilerine göre
  const RECIPES = {
    potato:      { icon: '🥔', meals: ['Patates haşlama', 'Patates çorbası', 'Fırın patates'] },
    sweetPotato: { icon: '🍠', meals: ['Tatlı patates püresi', 'Tatlı patates cipsi', 'Karamel tatlı patates'] },
    wheat:       { icon: '🌾', meals: ['Buğday lapası', 'Ekmek', 'Makarna'] },
    soybean:     { icon: '🫘', meals: ['Soya fasulyesi sote', 'Tofu', 'Soya sütü'] },
    peanut:      { icon: '🥜', meals: ['Fıstık ezmesi', 'Fıstıklı sos', 'Enerji bar'] },
    lettuce:     { icon: '🥬', meals: ['Marul salatası', 'Wrap', 'Taze garnitür'] },
    mizuna:      { icon: '🌿', meals: ['Mizuna salatası', 'Yeşil smoothie', 'Çiğ garnitür'] },
    tomato:      { icon: '🍅', meals: ['Domates çorbası', 'Bruschetta', 'Domates sos'] },
    spinach:     { icon: '🍃', meals: ['Ispanak sote', 'Ispanaklı börek', 'Yeşil smoothie'] },
    pepper:      { icon: '🌶️', meals: ['Biberli pilav', 'Dolma biber', 'Acılı sos'] },
    radish:      { icon: '📍', meals: ['Turp salatası', 'Turp garnitür', 'Turşu'] },
    strawberry:  { icon: '🍓', meals: ['Çilek tatlısı', 'Meyve tabağı', 'Smoothie'] },
  };

  // Son hasatlardan mevcut stok belirle
  const recentHarvests = (harvestLog || []).slice(-12);
  const availableCrops = [...new Set(recentHarvests.map(h => h.type))];
  const hasAeroponic = (bySource?.aeroponic || 0) > 500;
  const hasNFT = (bySource?.nft || 0) > 100;

  // Mevcut üretime göre dinamik menü oluştur
  const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length) % arr.length] || arr[0];

  const breakfastItems = ['🥤 Spirulina smoothie'];
  const lunchItems = [];
  const dinnerItems = [];
  const snackItems = ['🥤 Spirulina bar'];

  if (hasAeroponic) {
    breakfastItems.push(`${RECIPES.wheat?.icon || '🌾'} ${pickRandom(RECIPES.wheat?.meals || ['Buğday lapası'])}`);
    lunchItems.push(`${RECIPES.potato?.icon || '🥔'} ${pickRandom(RECIPES.potato?.meals || ['Patates haşlama'])}`);
    dinnerItems.push(`${RECIPES.soybean?.icon || '🫘'} ${pickRandom(RECIPES.soybean?.meals || ['Soya fasulyesi sote'])}`);
    snackItems.push(`${RECIPES.peanut?.icon || '🥜'} ${pickRandom(RECIPES.peanut?.meals || ['Fıstık ezmesi'])}`);
  }

  if (hasNFT) {
    lunchItems.push(`${RECIPES.lettuce?.icon || '🥬'} ${pickRandom(RECIPES.lettuce?.meals || ['Marul salatası'])}`);
    dinnerItems.push(`🍄 Mantar sote`);
    if (availableCrops.includes('tomato')) {
      lunchItems.push(`${RECIPES.tomato?.icon || '🍅'} ${pickRandom(RECIPES.tomato?.meals || ['Domates çorbası'])}`);
    }
    if (availableCrops.includes('pepper')) {
      dinnerItems.push(`${RECIPES.pepper?.icon || '🌶️'} ${pickRandom(RECIPES.pepper?.meals || ['Biberli pilav'])}`);
    }
    if (availableCrops.includes('strawberry')) {
      snackItems.push(`${RECIPES.strawberry?.icon || '🍓'} ${pickRandom(RECIPES.strawberry?.meals || ['Çilek tatlısı'])}`);
    }
  }

  // Fallback
  if (lunchItems.length === 0) lunchItems.push('🥔 Depo gıdası');
  if (dinnerItems.length === 0) dinnerItems.push('🍄 Mantar sote');

  const menu = [
    { meal: 'Kahvaltı', items: breakfastItems.join(' + ') },
    { meal: 'Öğle', items: lunchItems.join(' + ') },
    { meal: 'Akşam', items: dinnerItems.join(' + ') },
    { meal: 'Ara', items: snackItems.join(' + ') },
  ];

  return (
    <div className="bg-nexus-card rounded-xl border border-nexus-border p-4">
      <h3 className="text-xs text-nexus-text-dim uppercase tracking-wider mb-3">
        Bugünün Menüsü <span className="text-nexus-accent">(dinamik)</span>
      </h3>
      <div className="space-y-2">
        {menu.map((m) => (
          <div key={m.meal} className="flex items-start gap-2">
            <span className="text-xs font-bold text-nexus-accent w-14">{m.meal}</span>
            <span className="text-xs text-nexus-text-dim">{m.items}</span>
          </div>
        ))}
      </div>
      <div className="mt-2 pt-2 border-t border-nexus-border">
        <p className="text-[10px] text-nexus-text-dim">
          Menü mevcut hasat ve üretim verilerine göre otomatik oluşturulur
        </p>
      </div>
    </div>
  );
}

function HarvestLog({ harvestLog }) {
  if (!harvestLog || harvestLog.length === 0) return null;

  const PLANT_NAMES = {
    potato: '🥔 Patates', sweetPotato: '🍠 T. Patates', wheat: '🌾 Buğday',
    soybean: '🫘 Soya', peanut: '🥜 Fıstık', lettuce: '🥬 Marul',
    tomato: '🍅 Domates', spinach: '🍃 Ispanak', pepper: '🌶️ Biber', radish: '📍 Turp',
  };

  const recent = harvestLog.slice(-8).reverse();

  return (
    <div className="bg-nexus-card rounded-xl border border-nexus-border p-4">
      <h3 className="text-xs text-nexus-text-dim uppercase tracking-wider mb-3">Son Hasatlar</h3>
      <div className="space-y-1.5">
        {recent.map((h, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <span className="text-nexus-text">{PLANT_NAMES[h.type] || h.type} ×{h.count}</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-nexus-green">{h.yieldKg} kg</span>
              <span className="text-nexus-text-dim">Gün {h.day}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function NutritionPage() {
  const { state } = useGenesis();
  const cal = state.resources.calories;

  return (
    <div className="h-full flex flex-col gap-3 animate-fade-in overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center text-lg">🍽️</div>
        <div>
          <h2 className="text-base font-bold text-nexus-text">Beslenme Analizi</h2>
          <p className="text-[10px] text-nexus-text-dim">Kalori üretimi, makro besinler, vitamin durumu ve mürettebat beslenme dağılımı</p>
        </div>
      </div>

      {/* Top: Calorie gauge + Macro + Source */}
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-3 bg-nexus-card rounded-xl border border-nexus-border p-4 flex justify-center">
          <CalorieGauge produced={cal.dailyProduction} target={cal.dailyTarget} />
        </div>
        <div className="col-span-4">
          <MacroBreakdown protein={cal.protein} carbs={cal.carbs} fat={cal.fat} />
        </div>
        <div className="col-span-5">
          <SourceBreakdown bySource={cal.bySource} />
        </div>
      </div>

      {/* Orta: Vitamin + Biyoçeşitlilik + Mürettebat */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-5">
          <VitaminPanel vitaminStatus={state.resources.vitaminStatus} />
        </div>
        <div className="col-span-2">
          <BiodiversityScore score={state.resources.biodiversityScore || 0} />
        </div>
        <div className="col-span-5">
          <CrewAllocation totalCalories={cal.dailyProduction} />
        </div>
      </div>

      {/* Alt: Menü + Hasat Günlüğü */}
      <div className="grid grid-cols-2 gap-4">
        <MenuSuggestion bySource={cal.bySource} harvestLog={state.compartments.growth.harvestLog} />
        <HarvestLog harvestLog={state.compartments.growth.harvestLog} />
      </div>
    </div>
  );
}
