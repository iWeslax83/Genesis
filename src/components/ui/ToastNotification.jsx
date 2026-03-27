import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { FiCheckCircle, FiAlertTriangle, FiInfo, FiX, FiAlertOctagon } from 'react-icons/fi';

const ToastContext = createContext(null);

const TOAST_ICONS = {
  success: FiCheckCircle,
  warning: FiAlertTriangle,
  error: FiAlertOctagon,
  info: FiInfo,
};

const TOAST_COLORS = {
  success: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', icon: 'text-emerald-400' },
  warning: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', icon: 'text-amber-400' },
  error: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', icon: 'text-red-400' },
  info: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400', icon: 'text-cyan-400' },
};

let toastId = 0;

function Toast({ toast, onDismiss }) {
  const [exiting, setExiting] = useState(false);
  const colors = TOAST_COLORS[toast.type] || TOAST_COLORS.info;
  const Icon = TOAST_ICONS[toast.type] || FiInfo;

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onDismiss(toast.id), 300);
    }, toast.duration || 4000);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  return (
    <div className={`flex items-start gap-2.5 px-3 py-2.5 rounded-lg border backdrop-blur-sm transition-all duration-300 ${
      colors.bg} ${colors.border} ${exiting ? 'opacity-0 translate-x-8' : 'opacity-100 translate-x-0 animate-slide-in'
    }`}>
      <Icon size={14} className={`${colors.icon} mt-0.5 flex-shrink-0`} />
      <div className="flex-1 min-w-0">
        {toast.title && (
          <div className={`text-xs font-semibold ${colors.text} mb-0.5`}>{toast.title}</div>
        )}
        <div className="text-[11px] text-nexus-text-dim leading-relaxed">{toast.message}</div>
      </div>
      <button
        onClick={() => { setExiting(true); setTimeout(() => onDismiss(toast.id), 300); }}
        className="text-nexus-text-dim hover:text-nexus-text transition-colors flex-shrink-0"
      >
        <FiX size={12} />
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = ++toastId;
    setToasts(prev => [...prev.slice(-4), { ...toast, id }]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed top-14 right-4 z-50 flex flex-col gap-2 w-80 pointer-events-none">
        {toasts.map(toast => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast toast={toast} onDismiss={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}
