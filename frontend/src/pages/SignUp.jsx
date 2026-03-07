import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { UserPlus, Eye, EyeOff, Loader2, AlertTriangle, CheckCircle } from "lucide-react";

const DEPARTMENTS = [
  "All", "Health", "Education", "Infrastructure", "Agriculture",
  "Water Resources", "Finance", "Transport", "Housing", "Energy", "Defence",
];

const STATES = [
  "All", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
  "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh",
  "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
  "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
];

const EMPTY = {
  fullName: "", officerId: "", email: "",
  password: "", confirmPassword: "",
  department: "", state: "",
};

export default function SignUp() {
  const { register, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  const [form,     setForm]     = useState(EMPTY);
  const [showPwd,  setShowPwd]  = useState(false);
  const [errors,   setErrors]   = useState({});
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard", { replace: true });
  }, [isAuthenticated]);

  const validate = () => {
    const e = {};
    if (!form.fullName.trim())  e.fullName  = "Required";
    if (!form.officerId.trim()) e.officerId = "Required";
    if (!form.email.trim())     e.email     = "Required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Invalid email";
    if (!form.password)         e.password  = "Required";
    else if (form.password.length < 6) e.password = "Min 6 characters";
    if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
    if (!form.department)       e.department = "Required";
    if (!form.state)            e.state      = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setApiError("");
    const result = await register({
      fullName:   form.fullName,
      officerId:  form.officerId,
      email:      form.email,
      password:   form.password,
      department: form.department,
      state:      form.state,
    });
    if (result.success) {
      navigate("/dashboard", { replace: true });
    } else {
      setApiError(result.message || "Registration failed.");
    }
  };

  const set = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: undefined }));
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 mb-4">
            <UserPlus size={26} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">BudgetSetu</h1>
          <p className="text-gray-400 text-sm mt-1">Register as a Government Officer</p>
        </div>

        <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-8 space-y-5">
          <h2 className="text-lg font-semibold text-white">Create Account</h2>

          {apiError && (
            <div className="flex items-start gap-2 rounded-xl bg-red-900/30 border border-red-700/50 p-3 text-sm text-red-300">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              {apiError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full Name" error={errors.fullName}>
              <input type="text" placeholder="Rajesh Kumar"
                value={form.fullName} onChange={e => set("fullName", e.target.value)}
                className={inputCls(errors.fullName)} />
            </Field>
            <Field label="Officer ID" error={errors.officerId}>
              <input type="text" placeholder="OFC001"
                value={form.officerId} onChange={e => set("officerId", e.target.value)}
                className={inputCls(errors.officerId)} />
            </Field>
          </div>

          <Field label="Email" error={errors.email}>
            <input type="email" placeholder="officer@gov.in"
              value={form.email} onChange={e => set("email", e.target.value)}
              className={inputCls(errors.email)} />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Password" error={errors.password}>
              <div className="relative">
                <input type={showPwd ? "text" : "password"} placeholder="••••••••"
                  value={form.password} onChange={e => set("password", e.target.value)}
                  className={`${inputCls(errors.password)} pr-10`} />
                <button type="button" onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200">
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </Field>
            <Field label="Confirm Password" error={errors.confirmPassword}>
              <div className="relative">
                <input type={showPwd ? "text" : "password"} placeholder="••••••••"
                  value={form.confirmPassword} onChange={e => set("confirmPassword", e.target.value)}
                  className={`${inputCls(errors.confirmPassword)} pr-10`} />
                {form.confirmPassword && form.password === form.confirmPassword && (
                  <CheckCircle size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400" />
                )}
              </div>
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Department" error={errors.department}>
              <select value={form.department} onChange={e => set("department", e.target.value)}
                className={selectCls(errors.department)}>
                <option value="">Select department</option>
                {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </Field>
            <Field label="State" error={errors.state}>
              <select value={form.state} onChange={e => set("state", e.target.value)}
                className={selectCls(errors.state)}>
                <option value="">Select state</option>
                {STATES.map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
          </div>

          <button onClick={handleSubmit} disabled={loading}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500
                       disabled:opacity-50 disabled:cursor-not-allowed
                       font-semibold text-sm text-white transition-colors
                       flex items-center justify-center gap-2">
            {loading
              ? <><Loader2 size={16} className="animate-spin" /> Registering...</>
              : <><UserPlus size={16} /> Create Account</>
            }
          </button>

          <p className="text-center text-sm text-gray-400">
            Already have an account?{" "}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-gray-300 uppercase tracking-wide">{label}</label>
      {children}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

const base      = "w-full rounded-lg bg-gray-800 border text-sm text-gray-100 px-3 py-2.5 outline-none transition-colors focus:ring-2 focus:ring-indigo-500/20";
const inputCls  = e => `${base} ${e ? "border-red-500" : "border-gray-700 hover:border-gray-500 focus:border-indigo-500"}`;
const selectCls = e => `${base} ${e ? "border-red-500" : "border-gray-700 hover:border-gray-500 focus:border-indigo-500"}`;