import { useState, type FormEvent } from "react";
import { useAuth } from "../auth/useAuth";
import { userApi } from "./api";

export function ProfilePage(): React.JSX.Element {
  const { user, refresh } = useAuth();
  const [nickname, setNickname] = useState(user?.nickname ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!user) return <></>;

  async function handleSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    await userApi.updateProfile({ nickname: nickname.trim() });
    await refresh();
    setSaving(false);
    setSaved(true);
  }

  return (
    <div className="page">
      <h1>Profile settings</h1>
      <form className="auth-card" onSubmit={handleSubmit}>
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
