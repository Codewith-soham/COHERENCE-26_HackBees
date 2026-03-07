import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { LogIn, Eye, EyeOff, Loader2, AlertTriangle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "./AuthPages.css";

export default function Login() {
  const { login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/dashboard";
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (new URLSearchParams(location.search).get("expired") === "1") {
      setError("Session expired. Please log in again.");
    }
  }, [location.search]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = async (event) => {
    event?.preventDefault();

    if (!form.identifier.trim() || !form.password) {
      setError("Please enter your email/Officer ID and password.");
      return;
    }

    setError("");
    const result = await login({ identifier: form.identifier.trim(), password: form.password });

    if (result.success) {
      navigate(from, { replace: true });
      return;
    }

    setError(result.message || "Login failed. Please try again.");
  };

  return (
    <div className="auth-page">
      <div className="auth-card animate-fade-in">
        <div className="auth-header">
          <div className="auth-logo">
            <LogIn size={28} />
          </div>
          <h1 className="auth-title">BudgetSetu</h1>
          <p className="auth-subtitle">Government Budget Intelligence Portal</p>
        </div>

        <h3 className="auth-form-heading">Officer Login</h3>

        {error && (
          <div className="auth-error-banner">
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label className="auth-label" htmlFor="identifier">
              Email or Officer ID
            </label>
            <input
              id="identifier"
              type="text"
              className="auth-input"
              placeholder="officer@gov.in or OFC001"
              value={form.identifier}
              onChange={(event) => setForm((prev) => ({ ...prev, identifier: event.target.value }))}
            />
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="password">
              Password
            </label>
            <div className="auth-input-wrap">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="auth-input with-right-icon"
                placeholder="••••••••"
                value={form.password}
                onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              />
              <button
                type="button"
                className="auth-input-icon-btn"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={16} className="auth-spin" />
                <span>Logging in...</span>
              </>
            ) : (
              <>
                <LogIn size={16} />
                <span>Login</span>
              </>
            )}
          </button>
        </form>

        <p className="auth-footer">
          Don&apos;t have an account?{" "}
          <Link className="auth-footer-link" to="/signup">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
