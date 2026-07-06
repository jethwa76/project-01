import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

export default function RegisterPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const { register: createAccount } = useAuth();
  const { pushToast } = useToast();
  const navigate = useNavigate();

  const onSubmit = async (values) => {
    try {
      await createAccount(values);
      pushToast("Account created.", "success");
      navigate("/dashboard");
    } catch (err) {
      console.error("Registration error:", err);
      pushToast(err.message || "Registration failed. Please try again.", "error");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <h1 className="text-3xl font-bold">Create account</h1>
      <div className="mt-6 grid gap-4">
        <div>
          <input className="focus-ring w-full rounded-lg border border-slate-300 px-4 py-3 dark:border-slate-700 dark:bg-slate-950" placeholder="Name" {...register("name", { required: "Name is required.", minLength: { value: 2, message: "Name must be at least 2 characters." } })} />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
        </div>
        <div>
          <input className="focus-ring w-full rounded-lg border border-slate-300 px-4 py-3 dark:border-slate-700 dark:bg-slate-950" type="email" placeholder="Email" {...register("email", { required: "Email is required." })} />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
        </div>
        <div>
          <input className="focus-ring w-full rounded-lg border border-slate-300 px-4 py-3 dark:border-slate-700 dark:bg-slate-950" type="password" placeholder="Password" {...register("password", { required: "Password is required.", minLength: { value: 8, message: "Password must be at least 8 characters." } })} />
          {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
        </div>
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Creating account..." : "Register"}</Button>
      </div>
      <p className="mt-5 text-sm text-slate-600 dark:text-slate-300">Already have an account? <Link className="font-semibold text-primary" to="/login">Login</Link></p>
    </form>
  );
}

