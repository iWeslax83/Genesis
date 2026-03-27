import { useEffect, useRef } from 'react';
import { useGenesis } from '../context/GenesisContext';
import { useToast } from '../components/ui/ToastNotification';

export default function useNotificationWatcher() {
  const { state } = useGenesis();
  const { addToast } = useToast();
  const prevAnomalyCount = useRef(0);
  const prevHarvestCount = useRef(0);
  const prevScenario = useRef(null);
  const prevPowerDeficit = useRef(false);

  useEffect(() => {
    // New critical anomalies
    const anomalies = state.ai?.anomalies || [];
    const criticals = anomalies.filter(a => a.severity === 'critical');
    if (criticals.length > 0 && anomalies.length > prevAnomalyCount.current) {
      const newest = criticals[criticals.length - 1];
      addToast({
        type: 'error',
        title: 'Kritik Alarm',
        message: newest.message,
        duration: 6000,
      });
    } else if (anomalies.length > prevAnomalyCount.current) {
      const newest = anomalies[anomalies.length - 1];
      addToast({
        type: 'warning',
        title: 'Uyari',
        message: newest.message,
        duration: 4000,
      });
    }
    prevAnomalyCount.current = anomalies.length;
  }, [state.ai?.anomalies]);

  useEffect(() => {
    // New harvests
    const harvestLog = state.compartments?.growth?.harvestLog || [];
    if (harvestLog.length > prevHarvestCount.current && prevHarvestCount.current > 0) {
      const newest = harvestLog[harvestLog.length - 1];
      addToast({
        type: 'success',
        title: 'Hasat Tamamlandi',
        message: `${newest.type} x${newest.count} — ${newest.yieldKg} kg`,
        duration: 5000,
      });
    }
    prevHarvestCount.current = harvestLog.length;
  }, [state.compartments?.growth?.harvestLog]);

  useEffect(() => {
    // Scenario changes
    if (state.scenario.active && state.scenario.active !== prevScenario.current) {
      addToast({
        type: 'warning',
        title: 'Senaryo Aktif',
        message: `What-if senaryosu baslatildi: ${state.scenario.active}`,
        duration: 5000,
      });
    } else if (!state.scenario.active && prevScenario.current) {
      addToast({
        type: 'info',
        title: 'Senaryo Bitti',
        message: 'Normal operasyona donuldu',
        duration: 4000,
      });
    }
    prevScenario.current = state.scenario.active;
  }, [state.scenario.active]);

  useEffect(() => {
    // Power deficit
    if (state.power?.powerDeficit && !prevPowerDeficit.current) {
      addToast({
        type: 'error',
        title: 'Guc Yetersizligi',
        message: 'Guc uretimi tuketimi karsilamiyor — yuk azaltma aktif',
        duration: 6000,
      });
    }
    prevPowerDeficit.current = state.power?.powerDeficit || false;
  }, [state.power?.powerDeficit]);
}
