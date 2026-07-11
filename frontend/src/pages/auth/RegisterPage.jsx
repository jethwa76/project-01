import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { FaGoogle, FaGithub } from "react-icons/fa";
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
      pushToast("Registration successful! A verification email has been sent to your address.", "success");
      navigate("/dashboard");
    } catch (err) {
      console.error("Registration error:", err);
      pushToast(err.message || "Registration failed. Please try again.", "error");
    }
  };

  const handleOAuthLogin = (provider) => {
    const apiUrl = import.meta.env.VITE_API_URL || "/api";
    window.location.href = `${apiUrl}/auth/${provider}`;
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Create account</h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Join the secure ShowcasePro platform</p>
      
      <div className="mt-6 grid gap-4">
        <div>
          <input 
            className="focus-ring w-full rounded-lg border border-slate-300 px-4 py-3 dark:border-slate-700 dark:bg-slate-950 dark:text-white" 
            placeholder="Name" 
            {...register("name", { 
              required: "Name is required.", 
              minLength: { value: 2, message: "Name must be at least 2 characters." } 
            })} 
          />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
        </div>
        <div>
          <input 
            className="focus-ring w-full rounded-lg border border-slate-300 px-4 py-3 dark:border-slate-700 dark:bg-slate-950 dark:text-white" 
            type="email" 
            placeholder="Email" 
            {...register("email", { required: "Email is required." })} 
          />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
        </div>
        <div>
          <input 
            className="focus-ring w-full rounded-lg border border-slate-300 px-4 py-3 dark:border-slate-700 dark:bg-slate-950 dark:text-white" 
            type="password" 
            placeholder="Password" 
            {...register("password", { 
              required: "Password is required.", 
              minLength: { value: 8, message: "Password must be at least 8 characters." } 
            })} 
          />
          {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Register"}
        </Button>
      </div>

      <div className="relative my-6 flex items-center justify-center">
        <span className="absolute w-full border-t border-slate-200 dark:border-slate-800"></span>
        <span className="relative bg-white px-3 text-xs uppercase text-slate-500 dark:bg-slate-900">Or sign up with</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button 
          type="button"
          onClick={() => handleOAuthLogin("google")}
          className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900"
        >
          <FaGoogle className="text-red-500" /> Google
        </button>
        <button 
          type="button"
          onClick={() => handleOAuthLogin("github")}
          className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900"
        >
          <FaGithub /> GitHub
        </button>
      </div>

      <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
        Already have an account?{" "}
        <Link className="font-semibold text-primary hover:underline" to="/login">
          Login
        </Link>
      </p>
    </form>
  );
}
