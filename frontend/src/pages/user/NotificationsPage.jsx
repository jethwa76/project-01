import { useEffect, useState } from "react";
import { FiBell, FiMail, FiShield, FiFolder, FiCheckCircle } from "react-icons/fi";
import api from "../../api/client";
import Loader from "../../components/common/Loader";
import { useToast } from "../../context/ToastContext";

const iconMap = {
  system: FiBell,
  message: FiMail,
  security: FiShield,
  project: FiFolder
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { pushToast } = useToast();

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get("/notifications/me");
      setNotifications(data.data || []);
    } catch (err) {
      pushToast("Failed to load notifications.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      pushToast("Notification marked as read.", "success");
    } catch (err) {
      pushToast(err.message || "Failed to mark as read.", "error");
    }
  };

  if (loading) return <Loader label="Loading notifications" />;

  return (
    <section>
      <h1 className="text-3xl font-bold text-slate-950 dark:text-white">Notifications</h1>
      {notifications.length === 0 ? (
        <div className="mt-6 rounded-lg border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
          <p className="text-slate-500">You have no notifications.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {notifications.map((n) => {
            const Icon = iconMap[n.type] || FiBell;
            return (
              <div
                key={n._id}
                className={`glass flex gap-4 rounded-lg p-5 transition ${
                  n.read
                    ? "opacity-75 border-slate-100 dark:border-slate-850 bg-slate-50/50"
                    : "border-primary/30 dark:border-primary/20 bg-primary/5 dark:bg-primary/5"
                }`}
              >
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${
                  n.read ? "bg-slate-150 text-slate-500" : "bg-primary text-white"
                }`}>
                  <Icon size={18} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <p className={`font-semibold ${n.read ? "text-slate-700 dark:text-slate-300" : "text-slate-950 dark:text-white"}`}>
                      {n.title}
                    </p>
                    {!n.read && (
                      <button
                        onClick={() => handleMarkRead(n._id)}
                        className="focus-ring flex items-center gap-1 text-xs font-semibold text-primary hover:underline shrink-0"
                        title="Mark as read"
                      >
                        <FiCheckCircle size={14} />
                        Mark read
                      </button>
                    )}
                  </div>
                  <p className="mt-1.5 text-sm leading-6 text-slate-605 dark:text-slate-350">
                    {n.body}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

