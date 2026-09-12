import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth, getRememberedIdentifier } from "./useAuth";
import { PasswordToggleButton } from "../../shared/PasswordToggleButton";

export function LoginPage(): React.JSX.Element {
  const { user, loading: authLoading, login } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState(getRememberedIdentifier());
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(Boolean(getRememberedIdentifier()));
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (authLoading) return <div className="page-loading">Loading…</div>;
  if (user) return <Navigate to="/dashboard" replace />;

  async function handleSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    setError(null);
    if (!identifier.trim() || !password) {
      setError("Enter your username/email and password.");
      return;
    }
    setSubmitting(true);
    const result = await login({ identifier: identifier.trim(), password, rememberMe });
    setSubmitting(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    navigate("/dashboard");
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Sign in</h1>

        <label className="field">
          <span>Username or email</span>
          <input value={identifier} onChange={(e) => setIdentifier(e.target.value)} autoComplete="username" />
        </label>

        <label className="field">
          <span>Password</span>
          <div className="password-row">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            <PasswordToggleButton visible={showPassword} onToggle={() => setShowPassword((v) => !v)} />
          </div>
        </label>

        <div className="login-options-row">
          <label className="remember-me">
            <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
            <span>Remember me</span>
          </label>
          <Link to="/forgot-password" className="forgot-password-link">
            Forgot password?
          </Link>
        </div>

        {error && (
          <p className="field-error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="primary-button" disabled={submitting}>
          {submitting && <span className="button-spinner" aria-hidden="true" />}
          {submitting ? "Signing in…" : "Sign in"}
        </button>

        <p className="auth-switch">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </form>
    </div>
  );
}
