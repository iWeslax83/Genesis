import { useGenesis } from '../../context/GenesisContext';
import { formatNumber, formatPercent } from '../../utils/formatters';
import InfoTooltip from '../ui/InfoTooltip';
import { FiZap, FiSun, FiThermometer, FiAlertTriangle, FiActivity, FiCpu } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#5b8def', '#d4903a', '#4ead5b', '#8b7fc7', '#d45555', '#4a9caa', '#a3865c'];

const TOOLTIP_STYLE = { backgroundColor: '#1a1c23', border: '1px solid #2a2c35', borderRadius: '6px', fontSize: '12px', color: '#c5c6cc' };

export default function PowerPage() {
  const { state } = useGenesis();
  const power = state.power || {};
  const thermal = state.thermal || {};
  const degradation = state.degradation || {};

  const subsystems = power.subsystems || {};
  const subsystemData = Object.entries(subsystems).map(([key, val]) => ({
    name: val.label || key,
    value: Math.round((val.consumption || 0) * 100) / 100,
    curtailed: val.curtailed || 0,
    factor: val.factor ?? 100, // yük yüzdesi (baz kapasiteye göre)
  }));

  const generation = power.generation || 0;
  const totalConsumption = power.totalConsumption || 0;
  const balance = power.balance || 0;

  const components = degradation.components || {};
  const componentList = Object.entries(components).map(([key, comp]) => ({
    id: key,
    ...comp,
  }));

  return (
    <div className="h-full flex flex-col gap-3 animate-fade-in">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-nexus-accent/10 flex items-center justify-center">
            <FiZap className="text-nexus-accent" size={16} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-nexus-text">Güç ve Enerji Yönetimi</h2>
            <p className="text-[10px] text-nexus-text-dim">Alt sistem güç tüketimi, üretim dengesi ve ısıl kontrol</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium ${
            balance >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
          }`}>
            {balance >= 0 ? '+' : ''}{balance.toFixed(1)} kW
          </div>
          <div className="px-3 py-1.5 rounded-md text-xs font-medium bg-nexus-bg text-nexus-text-dim">
            {power.sourceType === 'nuclear' ? 'Nükleer' : 'Güneş'}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatBox icon={<FiZap />} label="Toplam Üretim" value={`${generation.toFixed(1)} kW`} color="text-nexus-accent" metricKey="powerGeneration" />
        <StatBox icon={<FiActivity />} label="Toplam Tüketim" value={`${totalConsumption.toFixed(1)} kW`} color="text-amber-400" metricKey="powerConsumption" />
        <StatBox icon={<FiSun />} label="Aydınlatma Oranı" value={formatPercent((power.lightingFactor || 0) * 100)} color="text-nexus-green" metricKey="lightingFactor" />
        <StatBox icon={<FiThermometer />} label="Kabin Sıcaklığı" value={`${(thermal.currentTemp || 22).toFixed(1)}°C`} color={thermal.thermalStatus === 'nominal' ? 'text-nexus-green' : 'text-red-400'} metricKey="thermalBalance" />
      </div>

      {/* Main grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">
        {/* Power distribution pie */}
        <div className="col-span-12 lg:col-span-4 bg-nexus-card border border-nexus-border rounded-lg p-4 flex flex-col">
          <h3 className="text-[11px] text-nexus-text-dim uppercase tracking-wider mb-3 flex items-center gap-1">Güç Dağılımı <InfoTooltip metricKey="powerDistribution" size={11} /></h3>
          <div className="space-y-1 mt-2">
            {subsystemData.map((s, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-nexus-text-dim truncate">{s.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-mono ${s.factor > 100 ? 'text-amber-400' : s.factor < 50 ? 'text-nexus-accent' : 'text-nexus-text-dim'}`}>
                    {s.factor}%
                  </span>
                  <span className="text-nexus-text font-mono w-14 text-right">{s.value} kW</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Subsystem bar chart */}
        <div className="col-span-12 lg:col-span-4 bg-nexus-card border border-nexus-border rounded-lg p-4 flex flex-col">
          <h3 className="text-[11px] text-nexus-text-dim uppercase tracking-wider mb-3 flex items-center gap-1">Alt Sistem Tüketimi <InfoTooltip metricKey="powerConsumption" size={11} /></h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subsystemData} layout="vertical">
                <XAxis type="number" stroke="#6c6e78" fontSize={10} />
                <YAxis type="category" dataKey="name" stroke="#6c6e78" fontSize={9} width={100} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="value" fill="#5b8def" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Thermal balance */}
        <div className="col-span-12 lg:col-span-4 bg-nexus-card border border-nexus-border rounded-lg p-4 overflow-y-auto">
          <h3 className="text-[11px] text-nexus-text-dim uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <FiThermometer className="text-amber-400" size={12} /> Isıl Denge <InfoTooltip metricKey="thermalBalance" size={11} />
          </h3>
          <div className="space-y-3">
            <div>
              <div className="text-[10px] text-nexus-text-dim mb-1 uppercase">Isı Üretimi</div>
              {thermal.heatSources && Object.entries(thermal.heatSources).filter(([k]) => k !== 'total').map(([key, val]) => (
                <div key={key} className="flex justify-between text-xs py-0.5">
                  <span className="text-nexus-text-dim capitalize">{key === 'crew' ? 'Mürettebat' : key === 'avionics' ? 'Aviyonik' : 'Elektrik'}</span>
                  <span className="text-amber-400 font-mono">{val.toFixed(1)} kW</span>
                </div>
              ))}
              <div className="flex justify-between text-xs py-1 border-t border-nexus-border mt-1 font-medium">
                <span className="text-nexus-text">Toplam</span>
                <span className="text-amber-400 font-mono">{(thermal.heatSources?.total || 0).toFixed(1)} kW</span>
              </div>
            </div>

            <div>
              <div className="text-[10px] text-nexus-text-dim mb-1 uppercase flex items-center gap-1">Isı Atımı (Radyatör) <InfoTooltip metricKey="heatRejection" size={9} /></div>
              <div className="flex justify-between text-xs">
                <span className="text-nexus-text-dim">Kapasite</span>
                <span className="text-nexus-accent font-mono">{(thermal.heatRejection?.radiatorCapacity || 0).toFixed(1)} kW</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-nexus-text-dim">Aktuel</span>
                <span className="text-nexus-accent font-mono">{(thermal.heatRejection?.actualRejection || 0).toFixed(1)} kW</span>
              </div>
              <div className="w-full h-1.5 bg-nexus-bg rounded-full mt-2">
                <div className="h-full bg-nexus-accent rounded-full transition-all" style={{ width: `${thermal.heatRejection?.utilizationPercent || 0}%` }} />
              </div>
              <div className="text-[10px] text-nexus-text-dim text-right mt-0.5 font-mono">
                {formatPercent(thermal.heatRejection?.utilizationPercent || 0)}
              </div>
            </div>

            <div className="flex items-center justify-between p-2 rounded-md bg-nexus-bg">
              <span className="text-xs text-nexus-text-dim">Net Isı Akışı</span>
              <span className={`text-sm font-semibold font-mono ${(thermal.netHeatFlux || 0) > 0 ? 'text-amber-400' : 'text-nexus-accent'}`}>
                {(thermal.netHeatFlux || 0) > 0 ? '+' : ''}{(thermal.netHeatFlux || 0).toFixed(2)} kW
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: Component degradation */}
      <div className="bg-nexus-card border border-nexus-border rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[11px] text-nexus-text-dim uppercase tracking-wider flex items-center gap-1.5">
            <FiCpu className="text-amber-400" size={12} /> Bileşen Bozulma Durumu <InfoTooltip metricKey="componentDegradation" size={11} />
          </h3>
          <span className="text-xs font-mono text-nexus-text-dim">
            Ortalama: <span className="text-nexus-text font-semibold">{formatPercent(degradation.averageHealth || 100)}</span>
          </span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
          {componentList.map((comp) => (
            <div key={comp.id} className={`p-2.5 rounded-md border ${
              comp.status === 'critical' ? 'border-red-500/30 bg-red-500/5' :
              comp.status === 'warning' ? 'border-amber-500/30 bg-amber-500/5' :
              'border-nexus-border bg-nexus-bg'
            }`}>
              <div className="text-[10px] text-nexus-text-dim truncate">{comp.label}</div>
              <div className={`text-base font-semibold font-mono ${
                comp.status === 'critical' ? 'text-red-400' :
                comp.status === 'warning' ? 'text-amber-400' :
                'text-emerald-400'
              }`}>
                {formatPercent(comp.health)}
              </div>
              <div className="w-full h-1 bg-nexus-bg rounded-full mt-1">
                <div className={`h-full rounded-full transition-all ${
                  comp.health > 60 ? 'bg-emerald-400' : comp.health > 30 ? 'bg-amber-400' : 'bg-red-400'
                }`} style={{ width: `${comp.health}%` }} />
              </div>
              {comp.daysRemaining !== undefined && (
                <div className="text-[9px] text-nexus-text-dim mt-1 font-mono">{comp.daysRemaining} gün</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Power deficit warning */}
      {power.powerDeficit && (
        <div className="bg-red-500/8 border border-red-500/20 rounded-lg p-3 flex items-center gap-3">
          <FiAlertTriangle className="text-red-400 flex-shrink-0" size={16} />
          <div>
            <div className="text-sm font-medium text-red-400">Güç Yetersizliği</div>
            <div className="text-xs text-nexus-text-dim">
              Kısılan sistemler: {(power.curtailedSystems || []).join(', ')}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatBox({ icon, label, value, color, metricKey }) {
  return (
    <div className="bg-nexus-card border border-nexus-border rounded-lg p-3">
      <div className="flex items-center gap-1.5 mb-1">
        <span className={`${color}`}>{icon}</span>
        <span className="text-[10px] text-nexus-text-dim uppercase">{label}</span>
        {metricKey && <InfoTooltip metricKey={metricKey} size={10} />}
      </div>
      <div className={`text-base font-semibold font-mono ${color}`}>{value}</div>
    </div>
  );
}
