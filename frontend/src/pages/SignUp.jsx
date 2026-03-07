import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserPlus, Eye, EyeOff, Loader2, AlertTriangle, CheckCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "./AuthPages.css";

const DEPARTMENTS = [
  "Health",
  "Education",
  "Infrastructure",
  "Agriculture",
  "Water Resources",
  "Finance",
  "Transport",
  "Housing",
  "Energy",
  "Defence",
];

const STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

const INITIAL_FORM = {
  fullName: "",
  officerId: "",
  email: "",
  password: "",
  confirmPassword: "",
  department: "",
  state: "",
};

export default function SignUp() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(INITIAL_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const validationErrors = {};

    if (!form.fullName.trim()) validationErrors.fullName = "Full Name is required";
    if (!form.officerId.trim()) validationErrors.officerId = "Officer ID is required";

    if (!form.email.trim()) {
      validationErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      validationErrors.email = "Please enter a valid email";
    }

    if (!form.password) {
      validationErrors.password = "Password is required";
    } else if (form.password.length < 6) {
      validationErrors.password = "Password must be at least 6 characters";
    }

    if (!form.confirmPassword) {
      validationErrors.confirmPassword = "Confirm Password is required";
    } else if (form.password !== form.confirmPassword) {
      validationErrors.confirmPassword = "Passwords do not match";
    }

    if (!form.department) validationErrors.department = "Department is required";
    if (!form.state) validationErrors.state = "State is required";

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) return;

    setApiError("");
    setSuccessMessage("");

    const result = await register({
      fullName: form.fullName.trim(),
      officerId: form.officerId.trim(),
      email: form.email.trim(),
      password: form.password,
      department: form.department,
      state: form.state,
    });

    if (!result.success) {
      setApiError(result.message || "Registration failed. Please try again.");
      return;
    }

    setSuccessMessage("Registration successful! Please login.");
    setForm(INITIAL_FORM);

    setTimeout(() => {
      navigate("/login", { replace: true });
    }, 2000);
  };

  const passwordsMatch = form.confirmPassword && form.password === form.confirmPassword;

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-signup animate-fade-in">
        <div className="auth-header">
          <div className="auth-logo">
            <UserPlus size={28} />
          </div>
          <h1 className="auth-title">BudgetSetu</h1>
          <p className="auth-subtitle">Register as a Government Officer</p>
        </div>

        <h3 className="auth-form-heading">Create Account</h3>

        {apiError && (
          <div className="auth-error-banner">
            <AlertTriangle size={16} />
            <span>{apiError}</span>
          </div>
        )}

        {successMessage && <div className="auth-success-banner">{successMessage}</div>}

        <form onSubmit={handleSubmit}>
          <div className="auth-grid-2">
            <Field label="Full Name" error={errors.fullName}>
              <input
                type="text"
                className="auth-input"
                placeholder="Rajesh Kumar"
                value={form.fullName}
                onChange={(event) => setField("fullName", event.target.value)}
              />
            </Field>
            <Field label="Officer ID" error={errors.officerId}>
              <input
                type="text"
                className="auth-input"
                placeholder="OFC001"
                value={form.officerId}
                onChange={(event) => setField("officerId", event.target.value)}
              />
            </Field>
          </div>

          <Field label="Email" error={errors.email}>
            <input
              type="email"
              className="auth-input"
              placeholder="officer@gov.in"
              value={form.email}
              onChange={(event) => setField("email", event.target.value)}
            />
          </Field>

          <div className="auth-grid-2">
            <Field label="Password" error={errors.password}>
              <div className="auth-input-wrap">
                <input
                  type={showPassword ? "text" : "password"}
                  className="auth-input with-right-icon"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(event) => setField("password", event.target.value)}
                />
                <button
                  type="button"
                  className="auth-input-icon-btn"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Field>

            <Field label="Confirm Password" error={errors.confirmPassword}>
              <div className="auth-input-wrap">
                <input
                  type={showPassword ? "text" : "password"}
                  className="auth-input with-right-icon"
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={(event) => setField("confirmPassword", event.target.value)}
                />
                {passwordsMatch && (
                  <CheckCircle size={16} className="auth-input-status-icon auth-match-icon" />
                )}
              </div>
            </Field>
          </div>

          <div className="auth-grid-2">
            <Field label="Department" error={errors.department}>
              <select
                className="auth-select"
                value={form.department}
                onChange={(event) => setField("department", event.target.value)}
              >
                <option value="">Select department</option>
                {DEPARTMENTS.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="State" error={errors.state}>
              <select
                className="auth-select"
                value={form.state}
                onChange={(event) => setField("state", event.target.value)}
              >
                <option value="">Select state</option>
                {STATES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={16} className="auth-spin" />
                <span>Registering...</span>
              </>
            ) : (
              <>
                <UserPlus size={16} />
                <span>Create Account</span>
              </>
            )}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{" "}
          <Link className="auth-footer-link" to="/login">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div className="auth-field">
      <label className="auth-label">{label}</label>
      {children}
      {error ? <p className="auth-field-error">{error}</p> : null}
    </div>
  );
}
