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

  const target = Number(targetAmount) || 0;
  const raised = Number(amountRaised) || 0;
  const previewRatio = target > 0 ? Math.min(1, raised / target) : 0;

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

      <form className="nonprofit-edit-layout content-reveal" onSubmit={handleSubmit}>
        <aside className="nonprofit-edit-preview">
          <span className="nonprofit-edit-preview-label">Donor preview</span>
          <div className="nonprofit-edit-preview-identity">
            <Avatar src={logoPreview} name={orgName || "Org"} size={56} />
            <div>
              <h2>{orgName || "Your organization"}</h2>
              {category && <span className="nonprofit-card-category">{category}</span>}
            </div>
          </div>
          <p className="nonprofit-edit-preview-description">
            {description || "Your description will show up here as you type it."}
          </p>
          <div className="nonprofit-edit-preview-progress">
            <div className="nonprofit-progress-bar">
              <span
                className="nonprofit-progress-bar-fill nonprofit-edit-preview-fill"
                style={{ "--fill": previewRatio } as React.CSSProperties}
              />
            </div>
            <div className="nonprofit-edit-preview-progress-label">
              <span>${raised.toLocaleString()} raised</span>
              <span>${target.toLocaleString()} goal</span>
            </div>
          </div>
          <label className="ghost-button nonprofit-edit-logo-button">
            {logoFile ? "Change logo" : "Upload logo"}
            <input type="file" accept="image/*" hidden onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)} />
          </label>
        </aside>

        <div className="nonprofit-edit-sections">
          <section className="nonprofit-edit-section">
            <div className="nonprofit-edit-section-heading">
              <h2>Identity</h2>
              <p>How your organization is named and categorized.</p>
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
          </section>

          <section className="nonprofit-edit-section">
            <div className="nonprofit-edit-section-heading">
              <h2>Story</h2>
              <p>What you do, and why you need funding right now.</p>
            </div>

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
          </section>

          <section className="nonprofit-edit-section">
            <div className="nonprofit-edit-section-heading">
              <h2>Funding</h2>
              <p>Kept up to date, this drives the progress bar donors see.</p>
            </div>

            <div className="nonprofit-edit-field-row">
              <label className="field">
                <span>Target amount</span>
                <div className="amount-input-wrap">
                  <span>$</span>
                  <input type="number" min="0" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} />
                </div>
              </label>

              <label className="field">
                <span>Amount raised</span>
                <div className="amount-input-wrap">
                  <span>$</span>
                  <input type="number" min="0" value={amountRaised} onChange={(e) => setAmountRaised(e.target.value)} />
                </div>
              </label>
            </div>
          </section>

          <section className="nonprofit-edit-section">
            <div className="nonprofit-edit-section-heading">
              <h2>Video</h2>
              <p>Direct video upload isn't supported — link a YouTube video instead.</p>
            </div>

            <label className="field">
              <span>Video link (YouTube only)</span>
              <input
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
              />
            </label>
          </section>

          {error && <p className="field-error content-reveal">{error}</p>}
          {saved && !error && <p className="field-hint content-reveal">✓ Saved.</p>}

          <div className="nonprofit-edit-actions">
            <button type="submit" className="primary-button" disabled={saving}>
              {saving && <span className="button-spinner" aria-hidden="true" />}
              {saving ? "Saving…" : "Save"}
            </button>
            <Link to="/nonprofits" className="ghost-button">
              Back to list
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
