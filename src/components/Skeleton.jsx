export function SkeletonLine({ className = '' }) {
  return <div className={`bg-white/5 rounded-lg animate-pulse ${className}`} />;
}

export function SkeletonCard() {
  return (
    <div className="bg-dark-800/50 rounded-2xl border border-white/5 p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-white/5 rounded-xl animate-pulse" />
        <div className="space-y-2 flex-1">
          <SkeletonLine className="h-4 w-1/3" />
          <SkeletonLine className="h-3 w-1/5" />
        </div>
      </div>
      <SkeletonLine className="h-3 w-full" />
      <SkeletonLine className="h-3 w-2/3" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-3 bg-dark-800/50 rounded-xl border border-white/5">
          <SkeletonLine className="h-8 w-8 rounded-lg flex-shrink-0" />
          <SkeletonLine className="h-4 flex-1" />
          <SkeletonLine className="h-4 w-20" />
          <SkeletonLine className="h-4 w-16" />
          <SkeletonLine className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}
