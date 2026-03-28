import { useGenesis } from '../../context/GenesisContext';
import { FiMessageCircle, FiChevronUp, FiChevronDown } from 'react-icons/fi';
import { useState, useMemo } from 'react';

function generateNarrative(state) {
  const { time, resources, compartments, ai, power, mission, degradation } = state;
  const lines = [];

  // Time context
  const isDaytime = time.hour >= 6 && time.hour < 22;
  const dayPhrase = isDaytime ? 'Gün aydınlık, LED paneller çalışıyor' : 'Gece modu aktif, bitkiler karanlık döneminde';
  lines.push({
    marker: isDaytime ? 'LED' : 'GCE',
    text: `Gün ${time.day} — ${dayPhrase}.`,
    type: 'neutral',
  });

  // Crew status
  const crew = compartments.habitat?.crewCount || 6;
  const o2 = compartments.habitat?.o2Level || 21;
  const co2val = compartments.habitat?.co2Level || 0.04;

  if (o2 > 20 && co2val < 0.08) {
    lines.push({
      marker: 'O2',
      text: `${crew} kişilik mürettebat rahatça nefes alıyor. Oksijen %${o2.toFixed(1)}, CO2 seviyesi normal.`,
      type: 'good',
    });
  } else if (o2 < 19) {
    lines.push({
      marker: 'O2',
      text: `Dikkat! Oksijen seviyesi %${o2.toFixed(1)}'e düştü. Mürettebat rahatsız hissediyor olabilir.`,
      type: 'critical',
    });
  } else {
    lines.push({
      marker: 'O2',
      text: `Hava kalitesi kabul edilebilir ama ideal değil. O2: %${o2.toFixed(1)}, CO2: %${co2val.toFixed(3)}.`,
      type: 'warning',
    });
  }

  // Food production
  const cal = resources.calories;
  const foodRatio = cal.dailyTarget > 0 ? (cal.dailyProduction / cal.dailyTarget * 100) : 0;
  if (foodRatio >= 90) {
    lines.push({
      marker: 'GDA',
      text: `Bitkiler günde ${Math.round(cal.dailyProduction).toLocaleString('tr-TR')} kcal üretiyor — mürettebatın ihtiyacının %${foodRatio.toFixed(0)}'ini karşılıyor.`,
      type: 'good',
    });
  } else if (foodRatio >= 60) {
    lines.push({
      marker: 'GDA',
      text: `Gıda üretimi ihtiyacın %${foodRatio.toFixed(0)}'ini karşılıyor (${Math.round(cal.dailyProduction).toLocaleString('tr-TR')} kcal). Stok gıdalar kullanılıyor.`,
      type: 'warning',
    });
  } else {
    lines.push({
      marker: 'GDA',
      text: `Gıda üretimi düşük! Sadece ihtiyacın %${foodRatio.toFixed(0)}'i karşılı. Stok gıdaya bağımlılık yüksek.`,
      type: 'critical',
    });
  }

  // Water
  const waterRate = (resources.water?.recycleRate || 0.98) * 100;
  lines.push({
    marker: 'H2O',
    text: `Su geri kazanım oranı %${waterRate.toFixed(1)}. ${waterRate >= 97 ? 'Her damla değerlendiriliyor.' : 'Kayıp oranı biraz yüksek, dikkat!'}`,
    type: waterRate >= 97 ? 'good' : 'warning',
  });

  // Power
  if (power?.powerDeficit) {
    lines.push({
      marker: 'PWR',
      text: 'Enerji açığı var! Bazı sistemler kısıtlanmış durumda.',
      type: 'critical',
    });
  } else if ((power?.utilizationPercent || 0) > 90) {
    lines.push({
      marker: 'PWR',
      text: `Enerji kullanımı %${(power.utilizationPercent).toFixed(0)} — kapasiteye yakın çalışıyor.`,
      type: 'warning',
    });
  }

  // Mission progress
  const progress = mission?.missionProgress || 0;
  if (progress < 15) {
    lines.push({
      marker: 'MSN',
      text: `Görev henüz başında (%${progress.toFixed(0)}). Sistemler devreye alınıyor, bitkiler büyüyor.`,
      type: 'neutral',
    });
  } else if (progress > 50) {
    lines.push({
      marker: 'MSN',
      text: `Görev %${progress.toFixed(0)} tamamlandı. Yarı yol geçildi.`,
      type: 'good',
    });
  }

  // Anomalies
  const critCount = (ai?.anomalies || []).filter(a => a.severity === 'critical').length;
  const warnCount = (ai?.anomalies || []).filter(a => a.severity === 'warning').length;
  if (critCount > 0) {
    lines.push({
      marker: 'ALR',
      text: `${critCount} kritik alarm aktif! Hemen müdahale gerekebilir.`,
      type: 'critical',
    });
  } else if (warnCount > 0) {
    lines.push({
      marker: 'ALR',
      text: `${warnCount} uyarı mevcut, ama kritik bir durum yok.`,
      type: 'warning',
    });
  } else {
    lines.push({
      marker: 'SYS',
      text: 'Tüm sistemler normal çalışıyor. Aktif alarm yok.',
      type: 'good',
    });
  }

  // Equipment
  if ((degradation?.averageHealth || 100) < 80) {
    lines.push({
      marker: 'EQP',
      text: `Ekipman sağlığı %${(degradation.averageHealth).toFixed(0)}. Bakım planlama zamanı gelebilir.`,
      type: 'warning',
    });
  }

  return lines;
}

const TYPE_COLORS = {
  good: 'text-emerald-400',
  warning: 'text-amber-400',
  critical: 'text-red-400',
  neutral: 'text-nexus-text-dim',
};

const MARKER_COLORS = {
  good: 'text-emerald-500',
  warning: 'text-amber-500',
  critical: 'text-red-500',
  neutral: 'text-nexus-text-dim',
};

export default function WhatsHappening() {
  const { state } = useGenesis();
  const [expanded, setExpanded] = useState(true);
  const narrative = useMemo(() => generateNarrative(state), [
    state.time.day, state.time.hour,
    state.resources.calories.dailyProduction,
    state.compartments.habitat?.o2Level,
    state.ai?.anomalies,
    state.power?.powerDeficit,
    state.degradation?.averageHealth,
    state.mission?.missionProgress,
  ]);

  return (
    <div className="bg-nexus-card rounded-lg border border-nexus-border overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-nexus-card-hover transition-colors"
      >
        <div className="flex items-center gap-2">
          <FiMessageCircle size={13} className="text-nexus-text-dim" />
          <span className="text-[11px] font-semibold text-nexus-text uppercase tracking-wider">Neler Oluyor?</span>
        </div>
        {expanded ? <FiChevronUp size={14} className="text-nexus-text-dim" /> : <FiChevronDown size={14} className="text-nexus-text-dim" />}
      </button>

      {/* Narrative */}
      {expanded && (
        <div className="px-3 pb-3 space-y-1 animate-fade-in">
          {narrative.map((line, i) => (
            <div
              key={i}
              className="flex items-start gap-2 px-2 py-1.5 rounded text-xs leading-relaxed"
            >
              <span className={`font-mono text-[9px] font-bold flex-shrink-0 mt-0.5 w-6 ${MARKER_COLORS[line.type]}`}>
                {line.marker}
              </span>
              <span className={TYPE_COLORS[line.type]}>{line.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
