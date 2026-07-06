export default function Loader({ label = "Loading" }) {
  return (
    <div className="flex min-h-52 items-center justify-center" role="status" aria-label={label}>
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-primary dark:border-slate-700" />
    </div>
  );
}
