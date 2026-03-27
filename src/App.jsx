import { useState, useCallback } from 'react';
import { GenesisProvider } from './context/GenesisContext';
import { ToastProvider } from './components/ui/ToastNotification';
import AppLayout from './components/layout/AppLayout';
import SplashScreen from './components/ui/SplashScreen';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const handleSplashComplete = useCallback(() => setShowSplash(false), []);

  return (
    <GenesisProvider>
      <ToastProvider>
        {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
        <AppLayout />
      </ToastProvider>
    </GenesisProvider>
  );
}
