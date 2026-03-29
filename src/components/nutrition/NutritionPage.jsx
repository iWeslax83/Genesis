import { useGenesis } from '../../context/GenesisContext';
import { CREW, SOURCE_COLORS, SOURCE_LABELS } from '../../simulation/constants';
import { formatNumber } from '../../utils/formatters';
import InfoTooltip from '../ui/InfoTooltip';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { FiHeart, FiAlertTriangle, FiUser } from 'react-icons/fi';

function CalorieGauge({ produced, target }) {
  const ratio = Math.min(1, produced / target);
  const circumference = 2 * Math.PI * 70;
  const offset = circumference * (1 - ratio);
  const color = ratio >= 0.95 ? '#4ead5b' : ratio >= 0.7 ? '#d4903a' : '#d45555';

  return (
    <div className="flex flex-col items-center">
      <svg width={180} height={180} viewBox="0 0 180 180" role="img" aria-label={`Günlük Kalori Üretimi: ${formatNumber(produced)} / ${formatNumber(target)} kcal`}>
        <circle cx="90" cy="90" r="70" fill="none" stroke="#1a1c23" strokeWidth="12" />
        <circle
          cx="90" cy="90" r="70" fill="none" stroke={color} strokeWidth="12"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 90 90)"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
        <text x="90" y="80" textAnchor="middle" fill="#c5c6cc" fontSize="28" fontWeight="600" fontFamily="monospace">
          {formatNumber(produced)}
        </text>
        <text x="90" y="100" textAnchor="middle" fill="#6c6e78" fontSize="12">
          / {formatNumber(target)} kcal
        </text>
        <text x="90" y="120" textAnchor="middle" fill={color} fontSize="16" fontWeight="600">
          %{(ratio * 100).toFixed(1)}
        </text>
      </svg>
      <span className="text-xs text-nexus-text-dim mt-1 flex items-center gap-0.5">Günlük Kalori Üretimi <InfoTooltip metricKey="calorieProduction" size={10} /></span>
    </div>
  );
}

function MacroBreakdown({ protein, carbs, fat }) {
  const total = protein * 4 + carbs * 4 + fat * 9;
  const data = [
    { name: 'Protein', value: protein, kcal: protein * 4, color: '#4a9caa' },
    { name: 'Karbonhidrat', value: carbs, kcal: carbs * 4, color: '#d4903a' },
    { name: 'Yağ', value: fat, kcal: fat * 9, color: '#8b7fc7' },
  ];

  return (
    <div className="bg-nexus-card rounded-lg border border-nexus-border p-4">
      <h3 className="text-xs text-nexus-text-dim uppercase tracking-wider mb-3 flex items-center gap-1">Makro Besin Dağılımı <InfoTooltip metricKey="macroNutrient" size={11} /></h3>
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
    color: SOURCE_COLORS[key] || '#6c6e78',
  }));

  return (
    <div className="bg-nexus-card rounded-lg border border-nexus-border p-4">
      <h3 className="text-xs text-nexus-text-dim uppercase tracking-wider mb-3 flex items-center gap-1">Kaynak Bazında Üretim <InfoTooltip metricKey="sourceBreakdown" size={11} /></h3>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2c35" />
          <XAxis type="number" tick={{ fill: '#6c6e78', fontSize: 10 }} />
          <YAxis dataKey="name" type="category" width={80} tick={{ fill: '#6c6e78', fontSize: 10 }} />
          <Tooltip contentStyle={{ background: '#1a1c23', border: '1px solid #2a2c35', borderRadius: 8 }} />
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
    <div className="bg-nexus-card rounded-lg border border-nexus-border p-4">
      <h3 className="text-xs text-nexus-text-dim uppercase tracking-wider mb-3 flex items-center gap-1">Mürettebat Beslenme Dağılımı <InfoTooltip metricKey="crewNutrition" size={11} /></h3>
      <div className="space-y-2">
        {CREW.members.map((member) => {
          const ratio = Math.min(1, perPerson / member.calorie);
          return (
            <div key={member.id} className="flex items-center gap-3">
              <FiUser className="w-3.5 h-3.5 text-nexus-text-dim" />
              <span className="text-xs text-nexus-text w-16">{member.name}</span>
              <div className="flex-1 h-2 bg-nexus-bg rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${ratio * 100}%`,
                    backgroundColor: ratio >= 0.95 ? '#4ead5b' : ratio >= 0.7 ? '#d4903a' : '#d45555',
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
      <div className="bg-nexus-card rounded-lg border border-nexus-border p-4">
        <h3 className="text-xs text-nexus-text-dim uppercase tracking-wider mb-3">Vitamin / Mineral Durumu</h3>
        <div className="text-xs text-nexus-text-dim">Veri toplanıyor...</div>
      </div>
    );
  }

  const statusColors = {
    sufficient: '#4ead5b',
    low: '#d4903a',
    deficient: '#d45555',
  };

  const statusLabels = {
    sufficient: 'Yeterli',
    low: 'Düşük',
    deficient: 'Eksik',
  };

  return (
    <div className="bg-nexus-card rounded-lg border border-nexus-border p-4">
      <h3 className="text-xs text-nexus-text-dim uppercase tracking-wider mb-3 flex items-center gap-1">
        Vitamin / Mineral Durumu <span className="text-nexus-text-dim">(kişi başı / gün)</span> <InfoTooltip metricKey="vitaminStatus" size={11} />
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
            <FiAlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
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
  const color = score >= 70 ? '#4ead5b' : score >= 40 ? '#d4903a' : '#d45555';
  const label = score >= 70 ? 'İyi Çeşitlilik' : score >= 40 ? 'Orta' : 'Düşük Çeşitlilik';
  const circumference = 2 * Math.PI * 35;
  const offset = circumference * (1 - score / 100);

  return (
    <div className="bg-nexus-card rounded-lg border border-nexus-border p-4 flex flex-col items-center">
      <h3 className="text-xs text-nexus-text-dim uppercase tracking-wider mb-3 flex items-center gap-1">
        Beslenme Çeşitliliği <InfoTooltip metricKey="biodiversityScore" size={11} />
      </h3>
      <svg width={90} height={90} viewBox="0 0 90 90" role="img" aria-label={`Beslenme Çeşitliliği: ${score} / 100`}>
        <circle cx="45" cy="45" r="35" fill="none" stroke="#1a1c23" strokeWidth="6" />
        <circle
          cx="45" cy="45" r="35" fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 45 45)"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
        <text x="45" y="42" textAnchor="middle" fill={color} fontSize="18" fontWeight="600" fontFamily="monospace">
          {score}
        </text>
        <text x="45" y="56" textAnchor="middle" fill="#6c6e78" fontSize="8">
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

const PLANT_NAMES = {
  potato: 'Patates', peanut: 'Fıstık', lettuce: 'Marul',
  spinach: 'Ispanak', basil: 'Fesleğen', mint: 'Nane',
};

function HarvestLog({ harvestLog }) {
  if (!harvestLog || harvestLog.length === 0) return null;

  const recent = harvestLog.slice(-8).reverse();

  return (
    <div className="bg-nexus-card rounded-lg border border-nexus-border p-4">
      <h3 className="text-xs text-nexus-text-dim uppercase tracking-wider mb-3">Son Hasatlar</h3>
      <div className="space-y-1.5">
        {recent.map((h, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <span className="text-nexus-text">{PLANT_NAMES[h.type] || h.type} x{h.count}</span>
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
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#d455551a' }}>
          <FiHeart className="w-4 h-4" style={{ color: '#d45555' }} />
        </div>
        <div>
          <h2 className="text-base font-semibold text-nexus-text">Beslenme Analizi</h2>
          <p className="text-[10px] text-nexus-text-dim">Kalori üretimi, makro besinler, vitamin durumu ve mürettebat beslenme dağılımı</p>
        </div>
      </div>

      {/* Top: Calorie gauge + Macro + Source */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        <div className="col-span-12 lg:col-span-3 bg-nexus-card rounded-lg border border-nexus-border p-4 flex justify-center">
          <CalorieGauge produced={cal.dailyProduction} target={cal.dailyTarget} />
        </div>
        <div className="col-span-12 lg:col-span-4">
          <MacroBreakdown protein={cal.protein} carbs={cal.carbs} fat={cal.fat} />
        </div>
        <div className="col-span-12 lg:col-span-5">
          <SourceBreakdown bySource={cal.bySource} />
        </div>
      </div>

      {/* Orta: Vitamin + Biyoçeşitlilik + Mürettebat */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="col-span-12 md:col-span-5">
          <VitaminPanel vitaminStatus={state.resources.vitaminStatus} />
        </div>
        <div className="col-span-12 md:col-span-2">
          <BiodiversityScore score={state.resources.biodiversityScore || 0} />
        </div>
        <div className="col-span-12 md:col-span-5">
          <CrewAllocation totalCalories={cal.dailyProduction} />
        </div>
      </div>

      {/* Hasat Günlüğü */}
      <div className="grid grid-cols-1 gap-4">
        <HarvestLog harvestLog={state.compartments.growth.harvestLog} />
      </div>
    </div>
  );
}
