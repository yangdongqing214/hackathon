import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { authApi } from "./api";

export function ForgotPasswordPage(): React.JSX.Element {
  const [identifier, setIdentifier] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [devToken, setDevToken] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    setSubmitting(true);
    const res = await authApi.forgotPassword(identifier.trim());
    setSubmitting(false);
    setDone(true);
    if (res.code === 0) setDevToken(res.data.devResetToken);
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Reset your password</h1>
        <p className="auth-subtitle">Enter your username or email and we'll send you a reset link.</p>

        {done ? (
          <>
            <p className="field-hint">
              If an account matches, a reset link has been sent. This template has no email service wired up, so
              here's the link directly instead:
            </p>
            {devToken && (
              <Link className="primary-button" to={`/reset-password?token=${devToken}`}>
                Open reset link (dev only)
              </Link>
            )}
          </>
        ) : (
          <>
            <label className="field">
              <span>Username or email</span>
              <input value={identifier} onChange={(e) => setIdentifier(e.target.value)} />
            </label>
            <button type="submit" className="primary-button" disabled={submitting || !identifier.trim()}>
              {submitting && <span className="button-spinner" aria-hidden="true" />}
              {submitting ? "Sending…" : "Send reset link"}
            </button>
          </>
        )}

        <p className="auth-switch">
          <Link to="/login">← Back to sign in</Link>
        </p>
      </form>
    </div>
  );
}
