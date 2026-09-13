import { useEffect, useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth";
import { PasswordToggleButton } from "../../shared/PasswordToggleButton";
import { Avatar } from "../../shared/components/Avatar";

const ROLES = [
  { value: "user", label: "User" },
  { value: "charity", label: "Charity" },
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
  if (user) return <Navigate to={user.role === "charity" ? "/charity-dashboard" : "/dashboard"} replace />;

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
    // Charity, users redirected to respective dashboards
    if (role === "charity") {
      navigate("/charity-dashboard");
      return;
    }
    navigate("/dashboard");
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
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
