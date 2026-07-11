import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { FaGoogle, FaGithub, FaLock } from "react-icons/fa";
import Button from "../../components/common/Button";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const { login } = useAuth();
  const { pushToast } = useToast();
  const navigate = useNavigate();

  // State to track if 2FA code is needed
  const [requires2FA, setRequires2FA] = useState(false);
  const [loginValues, setLoginValues] = useState(null);

  const onSubmit = async (values) => {
    try {
      // If we are in the 2FA state, send the code along with original credentials
      const payload = requires2FA 
        ? { ...loginValues, twoFactorCode: values.twoFactorCode }
        : values;

      const result = await login(payload);

      if (result?.requiresTwoFactor) {
        setRequires2FA(true);
        setLoginValues(values);
        pushToast("Please enter your 2FA verification code.", "info");
        return;
      }

      pushToast("Welcome back.", "success");
      navigate(result.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      pushToast(err.message || "Login failed. Please try again.", "error");
    }
  };

  const handleOAuthLogin = (provider) => {
    const apiUrl = import.meta.env.VITE_API_URL || "/api";
    window.location.href = `${apiUrl}/auth/${provider}`;
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-soft dark:border-slate-800 dark:bg-slate-900 transition-all">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Sign in</h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        {requires2FA ? "Enter the code from your authenticator app" : "Access your secure portfolio dashboard"}
      </p>

      {requires2FA ? (
        <div className="mt-6 grid gap-4">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <FaLock />
            </span>
            <input 
              className="focus-ring w-full rounded-lg border border-slate-300 pl-10 pr-4 py-3 dark:border-slate-700 dark:bg-slate-950 dark:text-white" 
              type="text" 
              placeholder="6-digit OTP code" 
              maxLength={6}
              {...register("twoFactorCode", { 
                required: "Verification code is required.",
                pattern: { value: /^[0-9]{6}$/, message: "Must be a 6-digit number." }
              })} 
            />
          </div>
          {errors.twoFactorCode && <p className="text-xs text-red-500">{errors.twoFactorCode.message}</p>}
          
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Verifying..." : "Verify & Sign in"}
          </Button>

          <button 
            type="button" 
            onClick={() => setRequires2FA(false)} 
            className="text-sm font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 mt-2"
          >
            Back to login
          </button>
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-4">
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
                {...register("password", { required: "Password is required." })} 
              />
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="rounded border-slate-300 text-primary focus:ring-primary mr-2" 
                  {...register("rememberMe")} 
                />
                Remember Me
              </label>
              <Link className="text-sm font-semibold text-primary hover:underline" to="/forgot-password">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          </div>

          <div className="relative my-6 flex items-center justify-center">
            <span className="absolute w-full border-t border-slate-200 dark:border-slate-800"></span>
            <span className="relative bg-white px-3 text-xs uppercase text-slate-500 dark:bg-slate-900">Or continue with</span>
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
        </>
      )}

      <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
        Don't have an account?{" "}
        <Link className="font-semibold text-primary hover:underline" to="/register">
          Create account
        </Link>
      </p>
    </form>
  );
}
