import { createContext, useContext, useState, useEffect, useCallback } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
const TOKEN_KEY = "budgetsetu_token";
const USER_KEY  = "budgetsetu_user";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(() => {
    try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; }
  });
  const [token,   setToken]   = useState(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  useEffect(() => {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else       localStorage.removeItem(TOKEN_KEY);
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else      localStorage.removeItem(USER_KEY);
  }, [user]);

  useEffect(() => {
    if (!token) return;
    try {
      const payload   = JSON.parse(atob(token.split(".")[1]));
      const expiresIn = payload.exp * 1000 - Date.now();
      if (expiresIn <= 0) { logout(); return; }
      const timer = setTimeout(() => {
        logout();
        window.location.href = "/login?expired=1";
      }, expiresIn);
      return () => clearTimeout(timer);
    } catch {
      logout();
    }
  }, [token]);

  const register = async ({ fullName, officerId, email, password, department, state }) => {
    setLoading(true); setError("");
    try {
      const res  = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, officerId, email, password, department, state }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Registration failed");
      setToken(json.data.token);
      setUser(json.data.user);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  const login = async ({ identifier, password }) => {
    setLoading(true); setError("");
    try {
      const res  = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Login failed");
      setToken(json.data.token);
      setUser(json.data.user);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setError("");
  }, []);

  const authHeader = useCallback(() => ({
    "Content-Type":  "application/json",
    "Authorization": `Bearer ${token}`,
  }), [token]);

  return (
    <AuthContext.Provider value={{
      user, token, loading, error,
      isAuthenticated: !!token && !!user,
      isAdmin: user?.role === "admin",
      register, login, logout, authHeader,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};