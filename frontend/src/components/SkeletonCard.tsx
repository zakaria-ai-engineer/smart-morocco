export function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl bg-slate-900 shadow-card">
      <div className="h-52 bg-slate-800" />
      <div className="space-y-3 p-4">
        <div className="h-5 w-3/4 rounded bg-slate-800" />
        <div className="h-4 w-1/2 rounded bg-slate-800" />
        <div className="h-4 w-full rounded bg-slate-800" />
        <div className="h-4 w-2/3 rounded bg-slate-800" />
      </div>
    </div>
  );
}
