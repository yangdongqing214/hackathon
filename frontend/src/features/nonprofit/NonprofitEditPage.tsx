import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useMyNonprofit } from "./useMyNonprofit";
import { CATEGORIES } from "./types";
import { mediaUrl } from "../../shared/api/media";
import { Avatar } from "../../shared/components/Avatar";

export function NonprofitEditPage(): React.JSX.Element {
  const { draft, loading, saving, save } = useMyNonprofit();
  const [orgName, setOrgName] = useState("");
  const [description, setDescription] = useState("");
  const [fundingNeedStatement, setFundingNeedStatement] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [amountRaised, setAmountRaised] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [category, setCategory] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!draft) return;
    setOrgName(draft.orgName ?? "");
    setDescription(draft.description ?? "");
    setFundingNeedStatement(draft.fundingNeedStatement ?? "");
    setTargetAmount(draft.targetAmount != null ? String(draft.targetAmount) : "");
    setAmountRaised(String(draft.amountRaised ?? 0));
    setVideoUrl(draft.videoUrl ?? "");
    setCategory(draft.category ?? "");
    setLogoPreview(draft.logoUrl ? mediaUrl(draft.logoUrl) : null);
  }, [draft]);

  useEffect(() => {
    if (!logoFile) return;
    const url = URL.createObjectURL(logoFile);
    setLogoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [logoFile]);

  if (loading) return <div className="page-loading">Loading…</div>;

  async function handleSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    setError("");
    setSaved(false);

    const form = new FormData();
    form.append("orgName", orgName.trim());
    form.append("description", description.trim());
    form.append("fundingNeedStatement", fundingNeedStatement.trim());
    form.append("targetAmount", targetAmount.trim());
    form.append("amountRaised", amountRaised.trim());
    form.append("videoUrl", videoUrl.trim());
    form.append("category", category);
    if (logoFile) form.append("logo", logoFile);

    const result = await save(form);
    if (!result.ok) setError(result.message);
    else setSaved(true);
  }

  return (
    <div className="page nonprofit-edit-page">
      <h1>Org backend</h1>
      <p className="page-subtitle">Manage how your organization appears to donors.</p>

      <form className="auth-card nonprofit-edit-form" onSubmit={handleSubmit}>
        <div className="nonprofit-edit-logo-row">
          <Avatar src={logoPreview} name={orgName || "Org"} size={64} />
          <label className="ghost-button">
            {logoFile ? "Change logo" : "Upload logo"}
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>

        <label className="field">
          <span>Organization name</span>
          <input value={orgName} onChange={(e) => setOrgName(e.target.value)} required />
        </label>

        <label className="field">
          <span>Category</span>
          <select value={category} onChange={(e) => setCategory(e.target.value)} required>
            <option value="" disabled>
              Select a category
            </option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Description</span>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
        </label>

        <label className="field">
          <span>Funding need statement</span>
          <textarea
            value={fundingNeedStatement}
            onChange={(e) => setFundingNeedStatement(e.target.value)}
            rows={3}
          />
        </label>

        <label className="field">
          <span>Target amount ($)</span>
          <input type="number" min="0" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} />
        </label>

        <label className="field">
          <span>Amount raised ($)</span>
          <input type="number" min="0" value={amountRaised} onChange={(e) => setAmountRaised(e.target.value)} />
        </label>

        <label className="field">
          <span>Video link (YouTube only)</span>
          <input
            type="url"
            placeholder="https://www.youtube.com/watch?v=..."
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
          />
          <span className="field-hint">Direct video upload isn't supported — link a YouTube video instead.</span>
        </label>

        {error && <p className="field-error">{error}</p>}
        {saved && !error && <p className="field-hint">✓ Saved.</p>}

        <div className="nonprofit-edit-actions">
          <button type="submit" className="primary-button" disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </button>
          <Link to="/nonprofits" className="ghost-button">
            Back to list
          </Link>
        </div>
      </form>
    </div>
  );
}
