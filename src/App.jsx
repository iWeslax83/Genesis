import { GenesisProvider } from './context/GenesisContext';
import AppLayout from './components/layout/AppLayout';

export default function App() {
  return (
    <GenesisProvider>
      <AppLayout />
    </GenesisProvider>
  );
}
