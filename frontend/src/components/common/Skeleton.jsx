export function SkeletonCard() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-5 h-36 animate-pulse rounded-md bg-slate-200 dark:bg-slate-800" />
      <div className="mb-3 h-4 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
      <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
    </div>
  );
}
