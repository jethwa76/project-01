import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Loader from "./Loader";

export default function ProtectedRoute({ roles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loader label="Checking session" />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (roles?.length && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}
