export function SkeletonLine({ className = '' }) {
  return <div className={`bg-white/[0.03] rounded animate-pulse ${className}`} />;
}

export function SkeletonCard() {
  return (
    <div className="bg-dark-800/50 rounded-lg border border-white/[0.02] p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-white/[0.03] rounded-full animate-pulse" />
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
    <div className="space-y-1">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 bg-dark-800/50 border-b border-white/[0.02]">
          <SkeletonLine className="h-5 w-5 rounded flex-shrink-0" />
          <SkeletonLine className="h-4 flex-1" />
          <SkeletonLine className="h-4 w-20" />
          <SkeletonLine className="h-4 w-16" />
          <SkeletonLine className="h-5 w-14 rounded" />
        </div>
      ))}
    </div>
  );
}
