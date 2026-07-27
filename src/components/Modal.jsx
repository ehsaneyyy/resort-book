export default function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-dark-900/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-dark-800 rounded-2xl border border-white/10 overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-dark-800 border-b border-white/5 px-6 py-4 flex items-center justify-between z-10">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition text-slate-400 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
