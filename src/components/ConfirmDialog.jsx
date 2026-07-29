import { useEffect, useRef } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';

export default function ConfirmDialog({ title, message, onConfirm, onCancel, variant = 'danger', confirmText = 'Confirm' }) {
  const btnRef = useRef(null);

  useEffect(() => {
    btnRef.current?.focus();
    const handler = (e) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onCancel]);

  const styles = {
    danger: { icon: 'bg-red-500/10', iconColor: 'text-red-400/80', btn: 'bg-red-500/10 hover:bg-red-500/20 text-red-400' },
    warning: { icon: 'bg-amber-500/10', iconColor: 'text-amber-400/80', btn: 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400' },
    info: { icon: 'bg-blue-500/10', iconColor: 'text-blue-400/80', btn: 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-400' },
  };
  const s = styles[variant] || styles.danger;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-dark-800/95 border border-white/[0.02] rounded-lg p-5 max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`w-10 h-10 ${s.icon} rounded-lg flex items-center justify-center mb-4`}>
          <AlertTriangle className={`w-5 h-5 ${s.iconColor}`} />
        </div>
        <h3 className="text-sm font-medium text-white mb-1.5">{title}</h3>
        <p className="text-[13px] text-slate-500 mb-5">{message}</p>
        <div className="flex gap-2">
          <button
            ref={btnRef}
            onClick={onConfirm}
            className={`flex-1 py-2.5 ${s.btn} font-medium rounded text-[12px] transition-colors`}
          >
            {confirmText}
          </button>
          <button
            onClick={onCancel}
            className="px-5 py-2.5 bg-dark-700 hover:bg-dark-600 text-slate-400 text-[12px] font-medium rounded transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
