import { SHORTCUT_LIST } from '../../hooks/useKeyboardShortcuts';
import { FiX } from 'react-icons/fi';

export default function KeyboardHelp({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-fade-in" onClick={onClose}>
      <div className="bg-nexus-card border border-nexus-border rounded-2xl p-6 w-96 shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-nexus-text uppercase tracking-wider">Klavye Kısayolları</h2>
          <button onClick={onClose} className="text-nexus-text-dim hover:text-nexus-text transition-colors">
            <FiX size={16} />
          </button>
        </div>
        <div className="space-y-2">
          {SHORTCUT_LIST.map(({ key, desc }) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-xs text-nexus-text-dim">{desc}</span>
              <kbd className="px-2 py-0.5 rounded bg-nexus-bg border border-nexus-border text-[11px] font-mono text-nexus-accent min-w-[40px] text-center">
                {key}
              </kbd>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-3 border-t border-nexus-border">
          <p className="text-[10px] text-nexus-text-dim/60 text-center">
            Kapat: Esc veya ? tuşuna bas
          </p>
        </div>
      </div>
    </div>
  );
}
