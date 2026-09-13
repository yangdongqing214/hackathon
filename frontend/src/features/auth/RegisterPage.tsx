import { useEffect, useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth";
import { PasswordToggleButton } from "../../shared/PasswordToggleButton";
import { Avatar } from "../../shared/components/Avatar";

const ROLES = [
  { value: "user", label: "User" },
  { value: "nonprofit", label: "Nonprofit" },
];

export function RegisterPage(): React.JSX.Element {
  const { user, loading: authLoading, register } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState(ROLES[0].value);
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview(null);
      return;
    }
    const url = URL.createObjectURL(avatarFile);
    setAvatarPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);

  if (authLoading) return <div className="page-loading">Loading…</div>;
  if (user) return <Navigate to={user.role === "nonprofit" ? "/nonprofits" : "/dashboard"} replace />;

  async function handleSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    setError(null);
    if (!nickname.trim() || !email.trim() || !username.trim() || !password) {
      setError("Fill in every field to continue.");
      return;
    }
    if (password.length < 8) {
      setError("Password needs at least 8 characters.");
      return;
    }
    setSubmitting(true);
    const result = await register({
      username: username.trim(),
      email: email.trim(),
      password,
      role,
      nickname: nickname.trim(),
      avatarFile,
    });
    setSubmitting(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    if (role === "nonprofit") {
      navigate("/nonprofits");
      return;
    }
    navigate("/dashboard");
  }

  return (
    <div className="login-page register-page">
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
          Create your account and build a giving plan around the causes that matter to you.
        </p>
      </div>

      <form className="auth-card login-form" onSubmit={handleSubmit}>
        <h1>Create your account</h1>

        <div className="role-toggle">
          {ROLES.map((r) => (
            <button
              key={r.value}
              type="button"
              className={role === r.value ? "pill active" : "pill"}
              onClick={() => setRole(r.value)}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div className="avatar-upload-row">
          <Avatar src={avatarPreview} name={nickname} size={56} />
          <label className="ghost-button avatar-upload-field">
            {avatarFile ? "Change avatar" : "Upload avatar"}
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>

        <label className="field">
          <span>Display name</span>
          <input value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="Nickname is fine" />
        </label>

        <label className="field">
          <span>Email</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>

        <label className="field">
          <span>Username</span>
          <input value={username} onChange={(e) => setUsername(e.target.value)} />
        </label>

        <label className="field">
          <span>Password</span>
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
          {submitting ? "Creating…" : "Create account"}
        </button>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
