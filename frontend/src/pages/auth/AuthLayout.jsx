import { Link, Outlet } from "react-router-dom";
import { FiBriefcase } from "react-icons/fi";

export default function AuthLayout() {
  return (
    <main className="grid min-h-screen lg:grid-cols-[0.95fr_1.05fr]">
      <section className="hidden bg-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <Link to="/" className="flex items-center gap-3 text-lg font-bold">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary">
            <FiBriefcase />
          </span>
          ShowcasePro
        </Link>
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-secondary">Secure access</p>
          <h1 className="mt-4 text-5xl font-bold leading-tight">Manage portfolio content with role-based dashboards.</h1>
        </div>
      </section>
      <section className="flex items-center justify-center px-4 py-12">
        <Outlet />
      </section>
    </main>
  );
}
