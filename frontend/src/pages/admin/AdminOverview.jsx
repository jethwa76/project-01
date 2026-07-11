import { useState } from "react";
import {
  FiAward, FiFolder, FiUsers, FiStar,
  FiMessageSquare, FiMail, FiBookOpen, FiBell,
  FiDownload, FiActivity, FiList, FiRefreshCw
} from "react-icons/fi";
import { useApiResource } from "../../hooks/useApiResource";
import Loader from "../../components/common/Loader";
import StatChart from "../../components/admin/StatChart";
import ActivityFeed from "../../components/admin/ActivityFeed";

// ─── Fallback when the API hasn't responded yet ───────────────────────────────
const FALLBACK_METRICS = {
  users: 0, projects: 0, skills: 0, certificates: 0,
  testimonials: 0, messages: 0, blogs: 0, notifications: 0, downloads: 0
};

// ─── Metric card config ───────────────────────────────────────────────────────
const METRIC_CARDS = [
  { key: "users",        label: "Users",        icon: FiUsers,        color: "bg-blue-50 dark:bg-blue-950/30",    iconColor: "text-blue-500"   },
  { key: "projects",     label: "Projects",     icon: FiFolder,       color: "bg-violet-50 dark:bg-violet-950/30",iconColor: "text-violet-500" },
  { key: "skills",       label: "Skills",       icon: FiStar,         color: "bg-amber-50 dark:bg-amber-950/30",  iconColor: "text-amber-500"  },
  { key: "certificates", label: "Certificates", icon: FiAward,        color: "bg-emerald-50 dark:bg-emerald-950/30",iconColor:"text-emerald-500"},
  { key: "testimonials", label: "Testimonials", icon: FiMessageSquare,color: "bg-pink-50 dark:bg-pink-950/30",    iconColor: "text-pink-500"   },
  { key: "messages",     label: "Messages",     icon: FiMail,         color: "bg-cyan-50 dark:bg-cyan-950/30",    iconColor: "text-cyan-500"   },
  { key: "blogs",        label: "Blogs",        icon: FiBookOpen,     color: "bg-indigo-50 dark:bg-indigo-950/30",iconColor:"text-indigo-500"  },
  { key: "notifications",label: "Notifications",icon: FiBell,         color: "bg-orange-50 dark:bg-orange-950/30",iconColor:"text-orange-500"  },
  { key: "downloads",    label: "Downloads",    icon: FiDownload,     color: "bg-teal-50 dark:bg-teal-950/30",   iconColor: "text-teal-500"   },
];

// ─── Pagination state for System Logs ────────────────────────────────────────
function useLogsPaging() {
  const [page, setPage] = useState(1);
  const { data, loading } = useApiResource(
    `/admin/logs?page=${page}&limit=10`,
    { data: [], total: 0, pages: 1 }
  );
  return { logs: data?.data ?? [], total: data?.total ?? 0, pages: data?.pages ?? 1, page, setPage, loading };
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminOverview() {
  const { data, loading: overviewLoading } = useApiResource("/admin/overview", {
    metrics: FALLBACK_METRICS,
    recentMessages: [],
    popularProjects: [],
    trends: { downloads: [], users: [] }
  });

  const { data: activityData, loading: activityLoading } = useApiResource(
    "/admin/activity",
    { data: [] }
  );

  const { logs, total, pages, page, setPage, loading: logsLoading } = useLogsPaging();

  if (overviewLoading) return <Loader />;

  const metrics = data.metrics ?? FALLBACK_METRICS;
  const trends  = data.trends  ?? { downloads: [], users: [] };

  return (
    <section className="grid gap-6">
      {/* ── Page header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950 dark:text-white">Dashboard Overview</h1>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            Platform metrics and recent activity
          </p>
        </div>
      </div>

      {/* ── Metric cards ── */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {METRIC_CARDS.map(({ key, label, icon: Icon, color, iconColor }) => (
          <article
            key={key}
            className={`rounded-xl border border-slate-200 dark:border-slate-800 ${color} p-4 shadow-sm transition-shadow hover:shadow-md`}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {label}
              </p>
              <span className={`flex h-8 w-8 items-center justify-center rounded-lg bg-white/80 dark:bg-slate-900/50 ${iconColor}`}>
                <Icon size={16} aria-hidden="true" />
              </span>
            </div>
            <p className="mt-3 text-3xl font-bold text-slate-950 dark:text-white">
              {(metrics[key] ?? 0).toLocaleString()}
            </p>
          </article>
        ))}
      </div>

      {/* ── Trend Charts ── */}
      <div className="grid gap-4 lg:grid-cols-2">
        <StatChart
          title="Downloads — last 7 days"
          data={trends.downloads}
          color="#0d9488"
        />
        <StatChart
          title="New users — last 7 days"
          data={trends.users}
          color="#6366f1"
        />
      </div>

      {/* ── Activity feed + Recent messages ── */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Activity feed */}
        <Panel
          title="Recent Activity"
          icon={<FiActivity className="text-violet-500" />}
        >
          <ActivityFeed
            data={activityData?.data ?? []}
            loading={activityLoading}
          />
        </Panel>

        {/* Popular projects */}
        <Panel
          title="Popular Projects"
          icon={<FiFolder className="text-blue-500" />}
        >
          {(data.popularProjects ?? []).length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400 dark:text-slate-500">
              No projects yet.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {data.popularProjects.map((p) => (
                <li key={p._id} className="flex items-center justify-between py-2.5">
                  <span className="truncate text-sm text-slate-700 dark:text-slate-300">{p.title}</span>
                  <span className="ml-3 shrink-0 rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {(p.views ?? 0).toLocaleString()} views
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      {/* ── System Logs table ── */}
      <section className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-5 py-3">
          <h2 className="flex items-center gap-2 font-semibold text-slate-800 dark:text-white">
            <FiList className="text-slate-400" aria-hidden="true" />
            System Logs
            <span className="ml-1 rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs text-slate-500">
              {total.toLocaleString()} total
            </span>
          </h2>
          {logsLoading && <FiRefreshCw className="animate-spin text-slate-400" size={14} />}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                <th className="px-5 py-3 text-left">Action</th>
                <th className="px-5 py-3 text-left">User / Email</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-left">IP</th>
                <th className="px-5 py-3 text-left">Device</th>
                <th className="px-5 py-3 text-left">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60">
              {logsLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {Array.from({ length: 6 }).map((__, j) => (
                        <td key={j} className="px-5 py-3">
                          <div className="h-3 rounded bg-slate-100 dark:bg-slate-800" />
                        </td>
                      ))}
                    </tr>
                  ))
                : logs.map((log) => (
                    <LogRow key={log._id} log={log} />
                  ))
              }
              {!logsLoading && logs.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-sm text-slate-400">
                    No log entries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800 px-5 py-3">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Previous
            </button>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {page} / {pages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page === pages}
              className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Next
            </button>
          </div>
        )}
      </section>
    </section>
  );
}

// ─── Shared panel wrapper ─────────────────────────────────────────────────────
function Panel({ title, icon, children }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 px-5 py-3">
        {icon}
        <h2 className="font-semibold text-slate-800 dark:text-white">{title}</h2>
      </div>
      <div className="px-5 py-1">{children}</div>
    </article>
  );
}

// ─── Log table row ────────────────────────────────────────────────────────────
function LogRow({ log }) {
  const actor = log.user?.name || log.email || "—";
  const time  = new Date(log.timestamp).toLocaleString("en", {
    month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit"
  });

  return (
    <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
      <td className="px-5 py-3 font-mono text-xs text-slate-700 dark:text-slate-300 whitespace-nowrap">
        {log.action}
      </td>
      <td className="px-5 py-3 text-xs text-slate-600 dark:text-slate-400 truncate max-w-[160px]">
        {actor}
      </td>
      <td className="px-5 py-3">
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
            log.status === "success"
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
              : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
          }`}
        >
          {log.status}
        </span>
      </td>
      <td className="px-5 py-3 font-mono text-xs text-slate-500 dark:text-slate-500 whitespace-nowrap">
        {log.ip || "—"}
      </td>
      <td className="px-5 py-3 text-xs text-slate-500 dark:text-slate-500">
        {log.device || "—"}
      </td>
      <td className="px-5 py-3 text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">
        {time}
      </td>
    </tr>
  );
}
