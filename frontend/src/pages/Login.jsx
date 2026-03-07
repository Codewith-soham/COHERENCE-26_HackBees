import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogIn, Eye, EyeOff, Loader2, AlertTriangle } from "lucide-react";

export default function Login() {
  const { login, isAuthenticated, loading } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = location.state?.from?.pathname || "/dashboard";
  const expired   = new URLSearchParams(location.search).get("expired");

  const [form,    setForm]    = useState({ identifier: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [error,   setError]   = useState(expired ? "Session expired. Please log in again." : "");

  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true });
  }, [isAuthenticated]);

  const handleSubmit = async () => {
    if (!form.identifier || !form.password) {
      setError("Please enter your email/Officer ID and password.");
      return;
    }
    setError("");
    const result = await login({ identifier: form.identifier, password: form.password });
    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.message || "Login failed. Please try again.");
    }
  };

  const handleKey = (e) => { if (e.key === "Enter") handleSubmit(); };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 mb-4">
            <LogIn size={26} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">BudgetSetu</h1>
          <p className="text-gray-400 text-sm mt-1">Government Budget Intelligence Portal</p>
        </div>

        <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-8 space-y-5">
          <h2 className="text-lg font-semibold text-white">Officer Login</h2>

          {error && (
            <div className="flex items-start gap-2 rounded-xl bg-red-900/30 border border-red-700/50 p-3 text-sm text-red-300">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-300 uppercase tracking-wide">
              Email or Officer ID
            </label>
            <input
              type="text"
              placeholder="officer@gov.in or OFC001"
              value={form.identifier}
              onChange={(e) => setForm(f => ({ ...f, identifier: e.target.value }))}
              onKeyDown={handleKey}
              className="w-full rounded-lg bg-gray-800 border border-gray-700 hover:border-gray-500
                         focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20
                         text-sm text-gray-100 px-3 py-2.5 outline-none transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-300 uppercase tracking-wide">
              Password
            </label>
            <div className="relative">
              <input
                type={showPwd ? "text" : "password"}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                onKeyDown={handleKey}
                className="w-full rounded-lg bg-gray-800 border border-gray-700 hover:border-gray-500
                           focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20
                           text-sm text-gray-100 px-3 py-2.5 pr-10 outline-none transition-colors"
              />
              <button type="button" onClick={() => setShowPwd(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200">
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button onClick={handleSubmit} disabled={loading}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500
                       disabled:opacity-50 disabled:cursor-not-allowed
                       font-semibold text-sm text-white transition-colors
                       flex items-center justify-center gap-2">
            {loading
              ? <><Loader2 size={16} className="animate-spin" /> Logging in...</>
              : <><LogIn size={16} /> Login</>
            }
          </button>

          <p className="text-center text-sm text-gray-400">
            Don't have an account?{" "}
            <Link to="/signup" className="text-indigo-400 hover:text-indigo-300 font-medium">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}