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
    <div className="login-page">
      <div className="login-showcase" aria-hidden="true">
        <div className="login-showcase-glow" />
        <div className="login-showcase-icons">
          <span className="login-showcase-icon login-showcase-icon-heart">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M12 20.5s-7.5-4.6-10-9.3C.6 8 2 4.5 5.4 3.7c2-.5 4 .3 5.1 2 .3.5.9.5 1.2 0 1.1-1.7 3.1-2.5 5.1-2 3.4.8 4.8 4.3 3.4 7.5-2.5 4.7-10 9.3-10 9.3z"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
            </svg>
            <span>Local</span>
          </span>
          <span className="login-showcase-icon login-showcase-icon-globe">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.4" />
              <path d="M3 12h18M12 3c2.5 2.6 3.8 5.7 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.7-3.8-9S9.5 5.6 12 3z" stroke="currentColor" strokeWidth="1.4" />
            </svg>
            <span>National</span>
          </span>
          <span className="login-showcase-icon login-showcase-icon-sprout">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M12 21V11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              <path
                d="M12 11C12 7 9 5 5 5c0 4 3 6 7 6zM12 11c0-4 3-6 7-6 0 4-3 6-7 6z"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
            </svg>
            <span>International</span>
          </span>
        </div>
        <p className="login-showcase-copy">
          Set a giving plan once, split it across the causes you choose, and see exactly where it goes.
        </p>
      </div>

      <form className="auth-card login-form" onSubmit={handleSubmit}>
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
