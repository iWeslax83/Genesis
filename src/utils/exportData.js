import { formatNumber } from './formatters';

export function exportSimulationJSON(state) {
  const data = {
    exportDate: new Date().toISOString(),
    simulationDay: state.time.day,
    simulationTime: `${String(state.time.hour).padStart(2, '0')}:${String(state.time.minute).padStart(2, '0')}`,
    systemHealth: state.resources.healthScore,
    resources: {
      oxygen: state.resources.oxygen,
      co2: state.resources.co2,
      water: {
        total: state.resources.water.total,
        recycleRate: state.resources.water.recycleRate,
        dailyLoss: state.resources.water.dailyLoss,
      },
      calories: state.resources.calories,
      nutrients: state.resources.nutrients,
    },
    compartments: {
      waste: { status: state.compartments.waste.status, temperature: state.compartments.waste.temperature, pH: state.compartments.waste.pH },
      nutrient: { status: state.compartments.nutrient.status, pH: state.compartments.nutrient.pH, ec: state.compartments.nutrient.ec },
      growth: {
        status: state.compartments.growth.status,
        modules: Object.fromEntries(
          Object.entries(state.compartments.growth.modules).map(([key, mod]) => [
            key,
            { temperature: mod.temperature, humidity: mod.humidity, pH: mod.pH, ec: mod.ec, status: mod.status },
          ])
        ),
      },
      habitat: {
        o2Level: state.compartments.habitat.o2Level,
        co2Level: state.compartments.habitat.co2Level,
        temperature: state.compartments.habitat.temperature,
        humidity: state.compartments.habitat.humidity,
      },
    },
    power: { generation: state.power.generation, consumption: state.power.totalConsumption, utilization: state.power.utilizationPercent },
    thermal: { currentTemp: state.thermal.currentTemp, status: state.thermal.thermalStatus },
    mission: { day: state.mission.missionDay, progress: state.mission.missionProgress, totalDays: state.mission.totalMissionDays },
    morale: { score: state.morale.score, status: state.morale.status },
    anomalies: state.ai.anomalies,
    harvestLog: state.compartments.growth.harvestLog,
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  downloadBlob(blob, `genesis-export-day${state.time.day}.json`);
}

export function exportSensorHistoryCSV(state) {
  const history = state.sensorHistory;
  const headers = ['tick'];
  const columns = [];

  // Build columns from all sensor history
  for (const [module, sensors] of Object.entries(history)) {
    for (const [sensor, values] of Object.entries(sensors)) {
      if (Array.isArray(values) && values.length > 0) {
        headers.push(`${module}_${sensor}`);
        columns.push(values);
      }
    }
  }

  const maxLen = Math.max(...columns.map(c => c.length), 0);
  const rows = [headers.join(',')];
  for (let i = 0; i < maxLen; i++) {
    const row = [i];
    for (const col of columns) {
      row.push(col[i] !== undefined ? col[i].toFixed(3) : '');
    }
    rows.push(row.join(','));
  }

  const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
  downloadBlob(blob, `genesis-sensors-day${state.time.day}.csv`);
}

export function generateReport(state) {
  const { resources, compartments, power, thermal, mission, morale, ai } = state;
  const cal = resources.calories;

  const lines = [
    '╔══════════════════════════════════════════════════════╗',
    '║           GENESIS — Simulasyon Raporu                ║',
    '╚══════════════════════════════════════════════════════╝',
    '',
    `Tarih: ${new Date().toLocaleDateString('tr-TR')}`,
    `Simulasyon Gunu: ${state.time.day} / ${mission.totalMissionDays}`,
    `Gorev Ilerlemesi: %${mission.missionProgress.toFixed(1)}`,
    `Sistem Saglik Skoru: ${resources.healthScore}/100`,
    '',
    '─── KAYNAK DURUMU ───',
    `O2 Uretimi: ${formatNumber(resources.oxygen.production)} L/gun`,
    `O2 Tuketimi: ${formatNumber(resources.oxygen.consumption)} L/gun`,
    `O2 Dengesi: ${resources.oxygen.balance > 0 ? '+' : ''}${formatNumber(resources.oxygen.balance)} L/gun`,
    `CO2 Emilim Orani: %${((resources.co2.absorption / resources.co2.production) * 100).toFixed(1)}`,
    `Su Geri Kazanim: %${(resources.water.recycleRate * 100).toFixed(1)}`,
    `Su Gunluk Kayip: ${resources.water.dailyLoss} L/gun`,
    '',
    '─── BESLENME ───',
    `Gunluk Kalori: ${formatNumber(cal.dailyProduction)} / ${formatNumber(cal.dailyTarget)} kcal`,
    `Protein: ${formatNumber(cal.protein)} g | Karbonhidrat: ${formatNumber(cal.carbs)} g | Yag: ${formatNumber(cal.fat)} g`,
    '',
    '─── KOMPARTMAN DURUMLARI ───',
    `Atik Isleme: ${compartments.waste.status} (${compartments.waste.temperature}°C)`,
    `Besin Cozeltisi: ${compartments.nutrient.status} (pH ${compartments.nutrient.pH})`,
    `Bitki Yetistirme: ${compartments.growth.status}`,
    `Habitat: ${compartments.habitat.status} (O2: %${compartments.habitat.o2Level.toFixed(1)}, CO2: %${compartments.habitat.co2Level.toFixed(3)})`,
    '',
    '─── GUC & ISIL ───',
    `Guc Uretimi: ${power.generation.toFixed(1)} kW | Tuketim: ${power.totalConsumption.toFixed(1)} kW`,
    `Guc Kullanimi: %${power.utilizationPercent.toFixed(0)}`,
    `Kabin Sicakligi: ${thermal.currentTemp.toFixed(1)}°C`,
    '',
    '─── MURETTEBAT ───',
    `Moral Skoru: ${morale.score?.toFixed(0)}/100 (${morale.status})`,
    `Murettebat: ${compartments.habitat.crewCount} kisi`,
    '',
    '─── AI ANOMALILERI ───',
    ...(ai.anomalies.length > 0
      ? ai.anomalies.map(a => `[${a.severity.toUpperCase()}] ${a.message}`)
      : ['Aktif anomali yok — Tum sistemler nominal']),
    '',
    '─── HASAT GUNLUGU (Son 10) ───',
    ...(compartments.growth.harvestLog.slice(-10).map(h =>
      `Gun ${h.day}: ${h.type} x${h.count} — ${h.yieldKg} kg`
    )),
    '',
    `Rapor olusturma: ${new Date().toLocaleTimeString('tr-TR')}`,
    'GENESIS v2.0.0 — Kapali Dongu Uzay Tarimi Yasam Destek Sistemi',
  ];

  const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
  downloadBlob(blob, `genesis-rapor-gun${state.time.day}.txt`);
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
