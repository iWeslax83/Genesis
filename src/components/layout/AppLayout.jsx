import React from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import ErrorBoundary from '../ui/ErrorBoundary';
import EventLog from '../ui/EventLog';
import KeyboardHelp from '../ui/KeyboardHelp';
import { useGenesis } from '../../context/GenesisContext';
import useSimulation from '../../hooks/useSimulation';
import useKeyboardShortcuts from '../../hooks/useKeyboardShortcuts';
import useNotificationWatcher from '../../hooks/useNotificationWatcher';

// Lazy load sayfalar
const OverviewPage = React.lazy(() => import('../overview/OverviewPage'));
const GrowthMonitorPage = React.lazy(() => import('../growth/GrowthMonitorPage'));
const DesignPage = React.lazy(() => import('../design/DesignPage'));
const DigitalTwinPage = React.lazy(() => import('../digital-twin/DigitalTwinPage'));
const AIPredictionPage = React.lazy(() => import('../ai/AIPredictionPage'));
const NutritionPage = React.lazy(() => import('../nutrition/NutritionPage'));
const PowerPage = React.lazy(() => import('../power/PowerPage'));
const MissionPage = React.lazy(() => import('../mission/MissionPage'));

function PageContent() {
  const { state } = useGenesis();

  const renderPage = () => {
    switch (state.ui.currentPage) {
      case 'overview': return <OverviewPage />;
      case 'growth': return <GrowthMonitorPage />;
      case 'power': return <PowerPage />;
      case 'mission': return <MissionPage />;
      case 'design': return <DesignPage />;
      case 'digital-twin': return <DigitalTwinPage />;
      case 'ai': return <AIPredictionPage />;
      case 'nutrition': return <NutritionPage />;
      default: return <OverviewPage />;
    }
  };

  return (
    <ErrorBoundary>
      <React.Suspense fallback={
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-nexus-accent/20 border-t-nexus-accent rounded-full animate-spin" />
            <span className="text-xs text-nexus-text-dim">Modül yükleniyor...</span>
          </div>
        </div>
      }>
        {renderPage()}
      </React.Suspense>
    </ErrorBoundary>
  );
}

export default function AppLayout() {
  useSimulation();
  useNotificationWatcher();
  const { showHelp, setShowHelp } = useKeyboardShortcuts();

  return (
    <div className="h-screen w-screen flex bg-nexus-bg overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 min-h-0 relative">
        <TopBar />
        <main className="flex-1 min-h-0 overflow-auto p-2 sm:p-4 pb-10">
          <PageContent />
        </main>
      </div>
      {showHelp && <KeyboardHelp onClose={() => setShowHelp(false)} />}
    </div>
  );
}
