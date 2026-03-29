import { useEffect, useState, useCallback } from 'react';
import { useGenesis } from '../context/GenesisContext';

const PAGE_KEYS = {
  '1': 'overview',
  '2': 'growth',
  '3': 'nutrition',
  '4': 'power',
  '5': 'mission',
  '6': 'design',
  '7': 'digital-twin',
  '8': 'ai',
};

export default function useKeyboardShortcuts() {
  const { state, dispatch } = useGenesis();
  const [showHelp, setShowHelp] = useState(false);

  const handleKeyDown = useCallback((e) => {
    // Don't handle shortcuts when typing in inputs
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    // Page navigation: 1-8
    if (PAGE_KEYS[e.key]) {
      e.preventDefault();
      dispatch({ type: 'SET_PAGE', payload: PAGE_KEYS[e.key] });
      return;
    }

    switch (e.key) {
      // Space: toggle simulation
      case ' ':
        e.preventDefault();
        dispatch({ type: 'TOGGLE_SIMULATION' });
        break;

      // +/= : speed up
      case '+':
      case '=':
        e.preventDefault();
        {
          const speeds = [1, 5, 10, 50];
          const idx = speeds.indexOf(state.time.speed);
          if (idx < speeds.length - 1) {
            dispatch({ type: 'SET_SPEED', payload: speeds[idx + 1] });
          }
        }
        break;

      // - : slow down
      case '-':
        e.preventDefault();
        {
          const speeds = [1, 5, 10, 50];
          const idx = speeds.indexOf(state.time.speed);
          if (idx > 0) {
            dispatch({ type: 'SET_SPEED', payload: speeds[idx - 1] });
          }
        }
        break;

      // B: toggle sidebar
      case 'b':
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          dispatch({ type: 'TOGGLE_SIDEBAR' });
        }
        break;

      // F11 or F: fullscreen
      case 'f':
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else {
            document.documentElement.requestFullscreen();
          }
        }
        break;

      // ?: help
      case '?':
        e.preventDefault();
        setShowHelp(prev => !prev);
        break;

      // Escape: close help
      case 'Escape':
        setShowHelp(false);
        break;
    }
  }, [dispatch, state.time.speed]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return { showHelp, setShowHelp };
}

export const SHORTCUT_LIST = [
  { key: '1-8', desc: 'Sayfa navigasyonu' },
  { key: 'Space', desc: 'Simülasyonu durdur/başlat' },
  { key: '+/-', desc: 'Hızı artır/azalt' },
  { key: 'B', desc: 'Kenar çubuğunu daralt/genişlet' },
  { key: 'F', desc: 'Tam ekran' },
  { key: '?', desc: 'Kısayol yardımı' },
  { key: 'Esc', desc: 'Kapat' },
];
