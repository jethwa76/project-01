/**
 * ActivityFeed — renders the recent admin activity feed.
 * Each entry maps to an action icon + human-readable label + metadata.
 */
import {
  FiLogIn, FiLogOut, FiUserPlus, FiAlertCircle,
  FiShield, FiTrash2, FiEdit2, FiFolder,
  FiBookOpen, FiKey, FiUserX, FiCheck
} from "react-icons/fi";

// ─── Inline time-ago utility (no date-fns required) ─────────────────────────
function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// ─── Action metadata map ──────────────────────────────────────────────────────
const ACTION_META = {
  login_success:           { label: "Logged in",               icon: FiLogIn,      color: "text-emerald-500" },
  logout:                  { label: "Logged out",              icon: FiLogOut,     color: "text-slate-400"   },
  register:                { label: "Registered",              icon: FiUserPlus,   color: "text-blue-500"    },
  login_failed:            { label: "Failed login attempt",    icon: FiAlertCircle,color: "text-rose-500"    },
  "2fa_enabled":           { label: "Enabled 2FA",            icon: FiShield,     color: "text-emerald-500" },
  "2fa_disabled":          { label: "Disabled 2FA",           icon: FiShield,     color: "text-amber-500"   },
  admin_create_user:       { label: "Admin created user",      icon: FiUserPlus,   color: "text-blue-500"    },
  admin_update_user_role:  { label: "Updated user role",       icon: FiEdit2,      color: "text-violet-500"  },
  admin_delete_user:       { label: "Deleted user",            icon: FiUserX,      color: "text-rose-500"    },
  project_created:         { label: "Created project",         icon: FiFolder,     color: "text-blue-500"    },
  project_updated:         { label: "Updated project",         icon: FiEdit2,      color: "text-violet-500"  },
  project_deleted:         { label: "Deleted project",         icon: FiTrash2,     color: "text-rose-500"    },
  blog_created:            { label: "Published blog",          icon: FiBookOpen,   color: "text-blue-500"    },
  blog_updated:            { label: "Updated blog",            icon: FiEdit2,      color: "text-violet-500"  },
  blog_deleted:            { label: "Deleted blog",            icon: FiTrash2,     color: "text-rose-500"    },
  password_changed:        { label: "Changed password",        icon: FiKey,        color: "text-amber-500"   },
  password_reset:          { label: "Reset password",          icon: FiKey,        color: "text-amber-500"   },
};

const FALLBACK = { label: "System event", icon: FiCheck, color: "text-slate-400" };

// ─── Single feed row ─────────────────────────────────────────────────────────
function FeedRow({ entry }) {
  const meta = ACTION_META[entry.action] || FALLBACK;
  const Icon = meta.icon;
  const actor = entry.user?.name || entry.email || "Unknown";
  const time  = timeAgo(entry.timestamp);

  return (
    <li className="flex items-start gap-3 py-2.5">
      {/* Icon bubble */}
      <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 ${meta.color}`}>
        <Icon size={14} aria-hidden="true" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
          {meta.label}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
          {actor}
          {entry.ip ? ` · ${entry.ip}` : ""}
          {entry.status === "failed" ? (
            <span className="ml-1 text-rose-400">· failed</span>
          ) : null}
        </p>
      </div>

      <time
        dateTime={entry.timestamp}
        className="shrink-0 text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap"
      >
        {time}
      </time>
    </li>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ActivityFeed({ data = [], loading = false }) {
  if (loading) {
    return (
      <ul className="grid gap-1" aria-busy="true">
        {Array.from({ length: 6 }).map((_, i) => (
          <li key={i} className="flex items-center gap-3 py-2.5 animate-pulse">
            <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-40 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-2.5 w-28 rounded bg-slate-100 dark:bg-slate-800" />
            </div>
            <div className="h-2.5 w-10 rounded bg-slate-100 dark:bg-slate-800" />
          </li>
        ))}
      </ul>
    );
  }

  if (!data.length) {
    return (
      <p className="py-6 text-center text-sm text-slate-400 dark:text-slate-500">
        No recent activity to display.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-slate-100 dark:divide-slate-800">
      {data.map((entry) => (
        <FeedRow key={entry._id} entry={entry} />
      ))}
    </ul>
  );
}
