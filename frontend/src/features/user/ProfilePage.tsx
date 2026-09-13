import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { userApi } from "./api";
import { Avatar } from "../../shared/components/Avatar";
import { mediaUrl } from "../../shared/api/media";

export function ProfilePage(): React.JSX.Element {
  const { user, refresh } = useAuth();
  const [nickname, setNickname] = useState(user?.nickname ?? "");
  const [username, setUsername] = useState(user?.username ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatarUrl ? mediaUrl(user.avatarUrl) : null);

  useEffect(() => {
    if (!avatarFile) return;
    const url = URL.createObjectURL(avatarFile);
    setAvatarPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);

  if (!user) return <></>;

  async function handleSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError("");
    const form = new FormData();
    form.append("nickname", nickname.trim());
    form.append("username", username.trim());
    form.append("email", email.trim());
    if (avatarFile) form.append("avatar", avatarFile);
    const res = await userApi.updateProfileForm(form);
    if (res.code !== 0) {
      setError(res.message);
      setSaving(false);
      return;
    }
    await refresh();
    setAvatarFile(null);
    setSaving(false);
    setSaved(true);
  }

  return (
    <div className="page">
      <h1>Profile settings</h1>
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="avatar-upload-row">
          <Avatar src={avatarPreview} name={nickname} size={64} />
          <label className="ghost-button avatar-upload-field">
            {avatarFile ? "Change picture" : "Upload picture"}
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>
        <label className="field">
          <span>Nickname</span>
          <input value={nickname} onChange={(e) => setNickname(e.target.value)} />
        </label>
        <label className="field">
          <span>Username</span>
          <input value={username} onChange={(e) => setUsername(e.target.value)} />
        </label>
        <label className="field">
          <span>Email</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        {error && <p className="field-error content-reveal">{error}</p>}
        {saved && !error && <p className="field-hint content-reveal">✓ Saved.</p>}
        <button type="submit" className="primary-button" disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </button>
      </form>

      {user.role === "nonprofit" && (
        <section className="auth-card content-reveal" style={{ marginTop: 24 }}>
          <h2>About your organization</h2>
          <p className="page-subtitle">
            Add your organization&apos;s story, category, funding goals, logo, and other information donors see.
          </p>
          <Link to="/nonprofits/me/edit" className="primary-button">
            Edit nonprofit information
          </Link>
        </section>
      )}
    </div>
  );
}
