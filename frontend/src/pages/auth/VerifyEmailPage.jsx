import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import api from "../../api/client";
import Loader from "../../components/common/Loader";

export default function VerifyEmailPage() {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function verify() {
      try {
        const { data } = await api.get(`/auth/verify-email/${token}`);
        setSuccess(true);
        setMessage(data.message || "Email verified successfully!");
      } catch (err) {
        setSuccess(false);
        setMessage(err.message || "Invalid or expired verification token.");
      } finally {
        setLoading(false);
      }
    }
    verify();
  }, [token]);

  return (
    <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-soft dark:border-slate-800 dark:bg-slate-900">
      {loading ? (
        <div className="flex flex-col items-center justify-center py-6">
          <Loader />
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-400 font-medium">
            Verifying your email address...
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-4">
          {success ? (
            <>
              <FaCheckCircle className="text-6xl text-emerald-500" />
              <h1 className="mt-6 text-2xl font-bold text-slate-900 dark:text-white">Email Verified!</h1>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{message}</p>
              <Link 
                to="/login" 
                className="mt-8 w-full rounded-lg bg-primary py-3 font-semibold text-white shadow-md hover:bg-blue-600 transition-colors"
              >
                Go to Sign In
              </Link>
            </>
          ) : (
            <>
              <FaTimesCircle className="text-6xl text-rose-500" />
              <h1 className="mt-6 text-2xl font-bold text-slate-900 dark:text-white">Verification Failed</h1>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{message}</p>
              <Link 
                to="/login" 
                className="mt-8 w-full rounded-lg bg-slate-200 py-3 font-semibold text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-750 transition-colors"
              >
                Back to Sign In
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
