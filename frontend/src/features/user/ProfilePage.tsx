import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "../auth/useAuth";
import { userApi } from "./api";
import { Avatar } from "../../shared/components/Avatar";
import { mediaUrl } from "../../shared/api/media";

export function ProfilePage(): React.JSX.Element {
  const { user, refresh } = useAuth();
  const [nickname, setNickname] = useState(user?.nickname ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
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
    const form = new FormData();
    form.append("nickname", nickname.trim());
    if (avatarFile) form.append("avatar", avatarFile);
    await userApi.updateProfileForm(form);
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
        {saved && <p className="field-hint">✓ Saved.</p>}
        <button type="submit" className="primary-button" disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </button>
      </form>
    </div>
  );
}
