import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const { login } = useAuth();
  const { pushToast } = useToast();
  const navigate = useNavigate();

  const onSubmit = async (values) => {
    try {
      const user = await login(values);
      pushToast("Welcome back.", "success");
      navigate(user.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      pushToast(err.message || "Login failed. Please try again.", "error");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <h1 className="text-3xl font-bold">Login</h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Use your portfolio account credentials.</p>
      <div className="mt-6 grid gap-4">
        <div>
          <input className="focus-ring w-full rounded-lg border border-slate-300 px-4 py-3 dark:border-slate-700 dark:bg-slate-950" type="email" placeholder="Email" {...register("email", { required: "Email is required." })} />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
        </div>
        <div>
          <input className="focus-ring w-full rounded-lg border border-slate-300 px-4 py-3 dark:border-slate-700 dark:bg-slate-950" type="password" placeholder="Password" {...register("password", { required: "Password is required." })} />
          {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
        </div>
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Signing in..." : "Sign in"}</Button>
      </div>
      <div className="mt-5 flex justify-between text-sm">
        <Link className="font-semibold text-primary" to="/forgot-password">Forgot password?</Link>
        <Link className="font-semibold text-primary" to="/register">Create account</Link>
      </div>
    </form>
  );
}

