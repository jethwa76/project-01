import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/client";
import Button from "../../components/common/Button";
import { useToast } from "../../context/ToastContext";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const { pushToast } = useToast();
  const navigate = useNavigate();
  const onSubmit = async (values) => {
    try {
      await api.patch(`/auth/reset-password/${token}`, values);
      pushToast("Password reset successfully.", "success");
      navigate("/login");
    } catch (err) {
      pushToast(err.message || "Reset failed. The link may have expired.", "error");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <h1 className="text-3xl font-bold">Reset password</h1>
      <div className="mt-6">
        <input className="focus-ring w-full rounded-lg border border-slate-300 px-4 py-3 dark:border-slate-700 dark:bg-slate-950" type="password" placeholder="New password" {...register("password", { required: "Password is required.", minLength: { value: 8, message: "Password must be at least 8 characters." } })} />
        {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
      </div>
      <Button className="mt-4 w-full" type="submit" disabled={isSubmitting}>{isSubmitting ? "Updating..." : "Update password"}</Button>
    </form>
  );
}
