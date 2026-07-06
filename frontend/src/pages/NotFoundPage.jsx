import Button from "../components/common/Button";
import PageShell from "../components/layout/PageShell";

export default function NotFoundPage() {
  return (
    <PageShell>
      <main className="container-page flex min-h-[70vh] flex-col items-center justify-center text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-primary">404</p>
        <h1 className="mt-4 text-5xl font-extrabold text-slate-950 dark:text-white">Page not found</h1>
        <p className="mt-4 max-w-lg text-slate-600 dark:text-slate-300">
          The route may have moved, or the project you are looking for has not been published.
        </p>
        <Button className="mt-7" to="/">
          Return home
        </Button>
      </main>
    </PageShell>
  );
}
