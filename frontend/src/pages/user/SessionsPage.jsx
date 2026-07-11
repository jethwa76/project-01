import { useEffect, useState } from "react";
import { FaLaptop, FaMobileAlt, FaTrash, FaSignOutAlt, FaShieldAlt } from "react-icons/fa";
import api from "../../api/client";
import { useToast } from "../../context/ToastContext";
import Loader from "../../components/common/Loader";

export default function SessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { pushToast } = useToast();

  const fetchSessions = async () => {
    try {
      const { data } = await api.get("/auth/sessions");
      setSessions(data.sessions || []);
    } catch (err) {
      console.error("Failed to load sessions:", err);
      pushToast(err.message || "Failed to load active sessions.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleRevoke = async (sessionId) => {
    try {
      await api.delete(`/auth/sessions/${sessionId}`);
      setSessions(sessions.filter((s) => s._id !== sessionId));
      pushToast("Session revoked successfully.", "success");
    } catch (err) {
      pushToast(err.message || "Failed to revoke session.", "error");
    }
  };

  const handleRevokeAllOther = async () => {
    try {
      await api.delete("/auth/sessions/revoke-all");
      setSessions(sessions.filter((s) => s.isCurrent));
      pushToast("All other active sessions revoked.", "success");
    } catch (err) {
      pushToast(err.message || "Failed to revoke other sessions.", "error");
    }
  };

  const formatRelativeTime = (dateStr) => {
    const d = new Date(dateStr);
    const diffMs = Date.now() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Active Sessions</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage other devices currently signed in to your account.
          </p>
        </div>
        {sessions.length > 1 && (
          <button
            onClick={handleRevokeAllOther}
            className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 dark:border-red-950 dark:bg-red-950/30 dark:text-red-400 transition-colors"
          >
            <FaSignOutAlt /> Revoke Other Devices
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><Loader /></div>
      ) : sessions.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400 py-4 text-center">No active sessions found.</p>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {sessions.map((session) => (
            <div key={session._id} className="flex items-start justify-between py-4 first:pt-0 last:pb-0 gap-4">
              <div className="flex gap-4">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 flex-shrink-0 mt-0.5">
                  {session.device === "Mobile" ? <FaMobileAlt className="text-lg" /> : <FaLaptop className="text-lg" />}
                </span>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-slate-950 dark:text-white">
                      {session.os} ({session.browser})
                    </span>
                    {session.isCurrent && (
                      <span className="rounded bg-blue-100 px-2 py-0.5 text-2xs font-bold uppercase tracking-wider text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                        Current Session
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex flex-col gap-0.5 text-xs text-slate-500 dark:text-slate-400">
                    <span>IP Address: <span className="font-mono text-slate-700 dark:text-slate-350">{session.ip || "Unknown"}</span></span>
                    <span>Last Active: {formatRelativeTime(session.lastActive)}</span>
                  </div>
                </div>
              </div>

              {!session.isCurrent && (
                <button
                  onClick={() => handleRevoke(session._id)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 dark:hover:text-rose-450 transition-colors"
                  title="Revoke session"
                >
                  <FaTrash className="text-sm" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
