export default function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-dark-800/95 rounded-lg border border-white/[0.02] overflow-y-auto mx-2 sm:mx-4">
        <div className="sticky top-0 bg-dark-800/95 border-b border-white/[0.02] px-4 sm:px-5 py-3.5 flex items-center justify-between z-10">
          <h3 className="text-sm font-medium text-white">{title}</h3>
          <button onClick={onClose} className="p-1.5 text-slate-600 hover:text-amber-400 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-4 sm:p-5">{children}</div>
      </div>
    </div>
  );
}
