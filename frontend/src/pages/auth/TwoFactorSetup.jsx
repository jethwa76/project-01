import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaShieldAlt, FaQrcode, FaCheck, FaExclamationTriangle } from "react-icons/fa";
import api from "../../api/client";
import Button from "../../components/common/Button";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import Loader from "../../components/common/Loader";

export default function TwoFactorSetup() {
  const { user, setUser } = useAuth();
  const { pushToast } = useToast();
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const [loading, setLoading] = useState(false);
  const [setupData, setSetupData] = useState(null); // { secret, qrCode }
  const [isSetupActive, setIsSetupActive] = useState(false);

  const startSetup = async () => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/2fa/enable");
      setSetupData({
        secret: data.secret,
        qrCode: data.qrCode
      });
      setIsSetupActive(true);
    } catch (err) {
      pushToast(err.message || "Failed to initialize 2FA setup.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (values) => {
    setLoading(true);
    try {
      const endpoint = user.twoFactorEnabled ? "/auth/2fa/disable" : "/auth/2fa/verify";
      const { data } = await api.post(endpoint, { code: values.code });
      
      setUser({ ...user, twoFactorEnabled: !user.twoFactorEnabled });
      pushToast(data.message || "2FA status updated.", "success");
      
      // Clear setup state
      setIsSetupActive(false);
      setSetupData(null);
      reset();
    } catch (err) {
      pushToast(err.message || "Verification failed. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const cancelSetup = () => {
    setIsSetupActive(false);
    setSetupData(null);
    reset();
  };

  return (
    <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-3 mb-4">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
          <FaShieldAlt className="text-xl" />
        </span>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Two-Factor Authentication (2FA)</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Add an extra layer of protection to your account.</p>
        </div>
      </div>

      {user.twoFactorEnabled ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-4 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            <FaCheck className="flex-shrink-0 text-lg" />
            <p className="text-sm font-medium">Two-factor authentication is currently enabled.</p>
          </div>

          {!isSetupActive ? (
            <button
              onClick={() => setIsSetupActive(true)}
              className="w-full rounded-lg border border-red-200 bg-red-50 py-3 font-semibold text-red-600 hover:bg-red-100 transition-colors dark:border-red-900 dark:bg-red-950 dark:text-red-400"
            >
              Disable Two-Factor Authentication
            </button>
          ) : (
            <form onSubmit={handleSubmit(handleVerify)} className="space-y-4 border-t border-slate-100 pt-4 dark:border-slate-800">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                To disable 2FA, please enter a code from your authenticator app.
              </p>
              <div>
                <input
                  className="focus-ring w-full rounded-lg border border-slate-300 px-4 py-3 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm"
                  placeholder="6-digit OTP code"
                  maxLength={6}
                  {...register("code", { required: "OTP code is required." })}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? "Disabling..." : "Confirm Disable"}
                </Button>
                <button
                  type="button"
                  onClick={cancelSetup}
                  className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-900"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {!isSetupActive ? (
            <>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                When signing in, you will be prompted to enter a temporary verification code generated by mobile apps like Google Authenticator or Authy.
              </p>
              <button
                onClick={startSetup}
                disabled={loading}
                className="w-full rounded-lg bg-indigo-650 py-3 font-semibold text-white hover:bg-indigo-700 transition-colors"
              >
                {loading ? "Initializing..." : "Enable Two-Factor Authentication"}
              </button>
            </>
          ) : (
            <div className="space-y-4 border-t border-slate-100 pt-4 dark:border-slate-800">
              {loading ? (
                <div className="flex justify-center py-6"><Loader /></div>
              ) : (
                setupData && (
                  <div className="space-y-4">
                    <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 rounded-lg">
                      <img src={setupData.qrCode} alt="2FA QR Code" className="w-48 h-48 border rounded bg-white p-2" />
                      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 font-mono">
                        Key: <span className="font-semibold text-slate-700 dark:text-slate-300">{setupData.secret}</span>
                      </p>
                    </div>

                    <div className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
                      <p className="font-semibold text-slate-900 dark:text-white">To complete setup:</p>
                      <ol className="list-decimal pl-5 space-y-1">
                        <li>Scan the QR code with your authenticator app.</li>
                        <li>Enter the 6-digit code shown in the app below.</li>
                      </ol>
                    </div>

                    <form onSubmit={handleSubmit(handleVerify)} className="space-y-4">
                      <div>
                        <input
                          className="focus-ring w-full rounded-lg border border-slate-300 px-4 py-3 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm"
                          placeholder="6-digit OTP code"
                          maxLength={6}
                          {...register("code", { required: "OTP code is required." })}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" disabled={loading}>
                          Verify & Activate
                        </Button>
                        <button
                          type="button"
                          onClick={cancelSetup}
                          className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-900"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
