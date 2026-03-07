import { createContext, useContext, useState, useEffect, useCallback } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
const TOKEN_KEY = "budgetsetu_token";
const USER_KEY = "budgetsetu_user";

const AuthContext = createContext(null);

const parseStoredUser = () => {
  try {
    const storedUser = localStorage.getItem(USER_KEY);
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
};

const getTokenExpiry = (jwtToken) => {
  try {
    const payload = JSON.parse(atob(jwtToken.split(".")[1]));
    return payload?.exp ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
};

const parseApiErrorMessage = (payload, fallback) => payload?.message || payload?.error || fallback;

const safeJson = async (response) => {
  try {
    return await response.json();
  } catch {
    return {};
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => parseStoredUser());
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setError("");
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }, []);

  useEffect(() => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  }, [user]);

  useEffect(() => {
    if (!token) return undefined;

    const expiryTime = getTokenExpiry(token);
    if (!expiryTime) {
      logout();
      window.location.href = "/login?expired=1";
      return undefined;
    }

    const timeoutMs = expiryTime - Date.now();
    if (timeoutMs <= 0) {
      logout();
      window.location.href = "/login?expired=1";
      return undefined;
    }

    const timerId = setTimeout(() => {
      logout();
      window.location.href = "/login?expired=1";
    }, timeoutMs);

    return () => clearTimeout(timerId);
  }, [token, logout]);

  const register = async ({ fullName, officerId, email, password, department, state }) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, officerId, email, password, department, state }),
      });

      const result = await safeJson(response);
      if (!response.ok) {
        throw new Error(parseApiErrorMessage(result, "Registration failed"));
      }

      return { success: true };
    } catch (err) {
      const message = err.message || "Registration failed";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const login = async ({ identifier, password }) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const result = await safeJson(response);
      if (!response.ok) {
        throw new Error(parseApiErrorMessage(result, "Login failed"));
      }

      setToken(result?.data?.token || null);
      setUser(result?.data?.user || null);
      return { success: true };
    } catch (err) {
      const message = err.message || "Login failed";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const authHeader = useCallback(
    () => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }),
    [token]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        isAuthenticated: Boolean(token && user),
        isAdmin: user?.role === "admin",
        register,
        login,
        logout,
        authHeader,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};
