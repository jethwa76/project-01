import { useForm } from "react-hook-form";
import api from "../../api/client";
import Button from "../../components/common/Button";
import { useToast } from "../../context/ToastContext";

export default function SettingsPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm();
  const { pushToast } = useToast();

  const onSubmit = async (values) => {
    try {
      await api.patch("/users/change-password", values);
      pushToast("Password changed successfully.", "success");
      reset();
    } catch (err) {
      console.error("Change password error:", err);
      pushToast(err.message || "Failed to change password. Double check your current password.", "error");
    }
  };

  return (
    <section>
      <h1 className="text-3xl font-bold text-slate-950 dark:text-white">Settings</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 grid max-w-lg gap-4 rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
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
          {isSubmitting ? "Changing password..." : "Change password"}
        </Button>
      </form>
    </section>
  );
}

