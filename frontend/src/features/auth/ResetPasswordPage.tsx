import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { authApi } from "./api";
import { PasswordToggleButton } from "../../shared/PasswordToggleButton";

export function ResetPasswordPage(): React.JSX.Element {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password needs at least 8 characters.");
      return;
    }
    setSubmitting(true);
    const res = await authApi.resetPassword(token, password);
    setSubmitting(false);
    if (res.code !== 0) {
      setError(res.message);
      return;
    }
    navigate("/login");
  }

  if (!token) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1>Reset your password</h1>
          <p className="field-error" role="alert">
            This reset link is missing its token. Request a new one.
          </p>
          <p className="auth-switch">
            <Link to="/forgot-password">Request a new reset link</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Choose a new password</h1>

        <label className="field">
          <span>New password</span>
          <div className="password-row">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <PasswordToggleButton visible={showPassword} onToggle={() => setShowPassword((v) => !v)} />
          </div>
          <span className="field-hint">At least 8 characters ({password.length}/8).</span>
        </label>

        {error && (
          <p className="field-error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="primary-button" disabled={submitting}>
          {submitting && <span className="button-spinner" aria-hidden="true" />}
          {submitting ? "Saving…" : "Save new password"}
        </button>
      </form>
    </div>
  );
}
