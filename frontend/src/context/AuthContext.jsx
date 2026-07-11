import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const hydrate = useCallback(async () => {
    const token = localStorage.getItem("showcase_token");
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get("/auth/me");
      setUser(data.user);
    } catch {
      localStorage.removeItem("showcase_token");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    hydrate();

    const handleUnauthorized = () => {
      setUser(null);
    };
    window.addEventListener("unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("unauthorized", handleUnauthorized);
    };
  }, [hydrate]);

  const login = useCallback(async (payload) => {
    const { data } = await api.post("/auth/login", payload);
    if (data.requiresTwoFactor) {
      return { requiresTwoFactor: true };
    }
    localStorage.setItem("showcase_token", data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const oauthLogin = useCallback(async (token) => {
    localStorage.setItem("showcase_token", token);
    try {
      const { data } = await api.get("/auth/me");
      setUser(data.user);
      return data.user;
    } catch (err) {
      localStorage.removeItem("showcase_token");
      throw err;
    }
  }, []);

  const register = useCallback(async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    localStorage.setItem("showcase_token", data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    await api.post("/auth/logout").catch(() => null);
    localStorage.removeItem("showcase_token");
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      setUser,
      loading,
      login,
      oauthLogin,
      register,
      logout,
      isAdmin: user?.role === "admin",
      isEditor: user?.role === "editor" || user?.role === "admin"
    }),
    [user, loading, login, oauthLogin, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

