export function LoadingScreen({ message }) {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-dark-900/90 backdrop-blur-xl">
      <div className="relative mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-amber-500/90 to-amber-600/90 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/10 animate-pulse">
          <span className="text-white text-xl font-bold tracking-tight">RA</span>
        </div>
        <div className="absolute -inset-2 rounded-2xl bg-amber-500/10 blur-xl animate-pulse" style={{ animationDelay: '0.3s' }} />
      </div>
      <div className="flex gap-1.5 mb-4">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-amber-400/60 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
      <p className="text-sm text-slate-400/80 font-medium tracking-wide">{message || 'Loading...'}</p>
    </div>
  );
}
