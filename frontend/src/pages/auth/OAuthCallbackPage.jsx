import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import Loader from "../../components/common/Loader";

export default function OAuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const { oauthLogin } = useAuth();
  const { pushToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      pushToast("Authentication failed. No token received.", "error");
      navigate("/login");
      return;
    }

    async function handleCallback() {
      try {
        const user = await oauthLogin(token);
        pushToast(`Welcome back, ${user.name}!`, "success");
        navigate(user.role === "admin" ? "/admin" : "/dashboard");
      } catch (err) {
        console.error("OAuth registration error:", err);
        pushToast(err.message || "Failed to complete login.", "error");
        navigate("/login");
      }
    }

    handleCallback();
  }, [searchParams, oauthLogin, pushToast, navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
      <Loader />
      <p className="mt-4 text-sm text-slate-600 dark:text-slate-400 font-medium">
        Completing your login...
      </p>
    </div>
  );
}
