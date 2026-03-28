import { useState, useCallback } from 'react';
import { GenesisProvider } from './context/GenesisContext';
import { ToastProvider } from './components/ui/ToastNotification';
import AppLayout from './components/layout/AppLayout';
import SplashScreen from './components/ui/SplashScreen';
import OnboardingTour from './components/ui/OnboardingTour';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [showTour, setShowTour] = useState(false);
  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
    setShowTour(true);
  }, []);

  return (
    <GenesisProvider>
      <ToastProvider>
        {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
        {showTour && <OnboardingTour onComplete={() => setShowTour(false)} />}
        <AppLayout />
      </ToastProvider>
    </GenesisProvider>
  );
}
