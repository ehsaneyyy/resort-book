import { useEffect, useRef } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';

export default function ConfirmDialog({ title, message, onConfirm, onCancel, variant = 'danger' }) {
  const btnRef = useRef(null);

  useEffect(() => {
    btnRef.current?.focus();
    const handler = (e) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onCancel]);

  const styles = {
    danger: { icon: 'bg-red-500/10', iconColor: 'text-red-400', btn: 'bg-red-500 hover:bg-red-600 text-white' },
    warning: { icon: 'bg-yellow-500/10', iconColor: 'text-yellow-400', btn: 'bg-yellow-500 hover:bg-yellow-600 text-white' },
    info: { icon: 'bg-blue-500/10', iconColor: 'text-blue-400', btn: 'bg-blue-500 hover:bg-blue-600 text-white' },
  };
  const s = styles[variant] || styles.danger;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-dark-800 border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`w-12 h-12 ${s.icon} rounded-xl flex items-center justify-center mb-4`}>
          <AlertTriangle className={`w-6 h-6 ${s.iconColor}`} />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-sm text-slate-400 mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            ref={btnRef}
            onClick={onConfirm}
            className={`flex-1 py-2.5 ${s.btn} font-semibold rounded-xl transition text-sm`}
          >
            Confirm
          </button>
          <button
            onClick={onCancel}
            className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl transition text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
