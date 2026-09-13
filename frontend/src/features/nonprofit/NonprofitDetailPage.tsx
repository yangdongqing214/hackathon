import { useParams, Link } from "react-router-dom";
import { useNonprofitDetail } from "./useNonprofitDetail";
import { Avatar } from "../../shared/components/Avatar";
import { mediaUrl } from "../../shared/api/media";

const currency = (n: number) => `$${n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

function youtubeEmbedUrl(url: string): string | null {
  const watch = url.match(/[?&]v=([\w-]+)/);
  const short = url.match(/youtu\.be\/([\w-]+)/);
  const id = watch?.[1] ?? short?.[1];
  return id ? `https://www.youtube.com/embed/${id}` : null;
}

export function NonprofitDetailPage(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();
  const { detail, loading, notFound } = useNonprofitDetail(id);

  if (loading) return <div className="page-loading">Loading…</div>;

  if (notFound || !detail) {
    return (
      <div className="page">
        <h1>Nonprofit not found</h1>
        <Link to="/nonprofits" className="ghost-button">
          ← Back to list
        </Link>
      </div>
    );
  }

  const embedUrl = detail.videoUrl ? youtubeEmbedUrl(detail.videoUrl) : null;
  const raisedRatio = detail.targetAmount ? Math.min(1, detail.amountRaised / detail.targetAmount) : 0;

  return (
    <div className="page nonprofit-detail-page content-reveal">
      <Link to="/nonprofits" className="ghost-button">
        ← Back to list
      </Link>

      <div className="nonprofit-detail-layout">
        <div className="nonprofit-detail-main">
          {detail.description && <p>{detail.description}</p>}

          {detail.fundingNeedStatement && (
            <div className="nonprofit-detail-section">
              <h2 className="section-heading">Funding need</h2>
              <p>{detail.fundingNeedStatement}</p>
            </div>
          )}

          {embedUrl && (
            <div className="nonprofit-detail-section">
              <h2 className="section-heading">Video</h2>
              <div className="nonprofit-video-frame">
                <iframe src={embedUrl} title={`${detail.orgName} video`} allowFullScreen />
              </div>
            </div>
          )}
        </div>

        <aside className="nonprofit-detail-aside">
          <div className="nonprofit-detail-header">
            <Avatar src={mediaUrl(detail.logoUrl)} name={detail.orgName} size={64} />
            <div>
              <h1 style={{ margin: 0, fontSize: "1.25rem" }}>{detail.orgName}</h1>
              {detail.category && <span className="nonprofit-card-category">{detail.category}</span>}
            </div>
          </div>

          {detail.targetAmount != null && (
            <div className="nonprofit-detail-section">
              <h2 className="section-heading">Progress</h2>
              <div className="nonprofit-progress-bar">
                <span className="nonprofit-progress-bar-fill" style={{ "--fill": raisedRatio } as React.CSSProperties} />
              </div>
              <p className="field-hint">
                {currency(detail.amountRaised)} raised of {currency(detail.targetAmount)} goal
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
