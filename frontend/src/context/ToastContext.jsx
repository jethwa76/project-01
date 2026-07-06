import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { FiCheckCircle, FiInfo, FiAlertCircle, FiX } from "react-icons/fi";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const pushToast = useCallback((message, type = "info") => {
    const id = crypto.randomUUID();
    setToasts((items) => [...items, { id, message, type }]);
    setTimeout(() => setToasts((items) => items.filter((item) => item.id !== id)), 3800);
  }, []);

  const value = useMemo(() => ({ pushToast }), [pushToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-50 space-y-3" aria-live="polite">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`glass flex min-w-72 items-center gap-3 rounded-lg px-4 py-3 shadow-soft border-l-4 ${
              toast.type === "success"
                ? "border-l-teal-500"
                : toast.type === "error"
                ? "border-l-red-500"
                : "border-l-blue-500"
            }`}
          >
            {toast.type === "success" ? (
              <FiCheckCircle className="text-teal-500 shrink-0" size={18} />
            ) : toast.type === "error" ? (
              <FiAlertCircle className="text-red-500 shrink-0" size={18} />
            ) : (
              <FiInfo className="text-blue-500 shrink-0" size={18} />
            )}
            <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{toast.message}</p>
            <button
              className="focus-ring ml-auto rounded p-1 text-slate-500"
              onClick={() => setToasts((items) => items.filter((item) => item.id !== toast.id))}
              aria-label="Dismiss notification"
            >
              <FiX />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
