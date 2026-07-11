import { useForm } from "react-hook-form";
import api from "../../api/client";
import Button from "../../components/common/Button";
import { useToast } from "../../context/ToastContext";

export default function ChangePasswordPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm();
  const { pushToast } = useToast();

  const onSubmit = async (values) => {
    try {
      await api.patch("/auth/change-password", values);
      pushToast("Password changed successfully. Other sessions have been logged out.", "success");
      reset();
    } catch (err) {
      console.error("Change password error:", err);
      pushToast(err.message || "Failed to change password. Please verify current password.", "error");
    }
  };

  return (
    <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Change Password</h2>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
        Update your password to keep your account secure.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Current Password</label>
          <input
            className="mt-1 focus-ring w-full rounded-lg border border-slate-300 px-4 py-3 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm"
            type="password"
            placeholder="Current password"
            {...register("currentPassword", { required: "Current password is required." })}
          />
          {errors.currentPassword && <p className="mt-1 text-xs text-red-500">{errors.currentPassword.message}</p>}
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">New Password</label>
          <input
            className="mt-1 focus-ring w-full rounded-lg border border-slate-300 px-4 py-3 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-sm"
            type="password"
            placeholder="New password"
            {...register("newPassword", {
              required: "New password is required.",
              minLength: { value: 8, message: "Password must be at least 8 characters." }
            })}
          />
          {errors.newPassword && <p className="mt-1 text-xs text-red-500">{errors.newPassword.message}</p>}
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Updating..." : "Update Password"}
        </Button>
      </form>
    </div>
  );
}
