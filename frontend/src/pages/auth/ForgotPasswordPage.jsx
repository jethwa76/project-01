import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import api from "../../api/client";
import Button from "../../components/common/Button";
import { useToast } from "../../context/ToastContext";

export default function ForgotPasswordPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const { pushToast } = useToast();
  const [devResetUrl, setDevResetUrl] = useState(null);

  const onSubmit = async (values) => {
    try {
      const { data } = await api.post("/auth/forgot-password", values);
      pushToast("Reset instructions sent. Check your email.", "success");
      if (data.resetUrl) {
        setDevResetUrl(data.resetUrl);
      }
    } catch (err) {
      pushToast(err.message || "Failed to send reset email. Please try again.", "error");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <h1 className="text-3xl font-bold">Forgot password</h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Enter your email to receive reset instructions.</p>
      <div className="mt-6">
        <input className="focus-ring w-full rounded-lg border border-slate-300 px-4 py-3 dark:border-slate-700 dark:bg-slate-950" type="email" placeholder="Email" {...register("email", { required: "Email is required." })} />
        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
      </div>
      <Button className="mt-4 w-full" type="submit" disabled={isSubmitting}>{isSubmitting ? "Sending..." : "Send reset link"}</Button>

      {devResetUrl && (
        <div className="mt-5 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/40">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">🔧 Dev Mode — Reset Link</p>
          <Link to={devResetUrl.replace(/^https?:\/\/[^/]+/, "")} className="mt-2 block break-all text-sm font-medium text-primary underline">
            {devResetUrl}
          </Link>
        </div>
      )}
    </form>
  );
}
