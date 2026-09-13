import { Link } from "react-router-dom";
import { useNonprofitList } from "./useNonprofitList";
import { CATEGORIES } from "./types";
import { mediaUrl } from "../../shared/api/media";
import { Avatar } from "../../shared/components/Avatar";
import { Pagination } from "../../shared/components/Pagination";
import { EmptyState } from "../../shared/components/EmptyState";
import { Skeleton } from "../../shared/components/Skeleton";

export function NonprofitListPage(): React.JSX.Element {
  const { result, loading, page, setPage, category, setCategory } = useNonprofitList();

  return (
    <div className="page nonprofit-list-page">
      <h1>Browse nonprofits</h1>
      <p className="page-subtitle">Find a cause to support, by category.</p>

      <div className="category-filter-pills">
        <button type="button" className={category === "" ? "pill active" : "pill"} onClick={() => setCategory("")}>
          All
        </button>
        {CATEGORIES.map((cat) => (
          <button key={cat} type="button" className={category === cat ? "pill active" : "pill"} onClick={() => setCategory(cat)}>
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="nonprofit-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} height={140} />
          ))}
        </div>
      ) : !result || result.list.length === 0 ? (
        <EmptyState>No nonprofits in this category yet.</EmptyState>
      ) : (
        <>
          <div className="nonprofit-grid">
            {result.list.map((org) => (
              <Link key={org.id} to={`/nonprofits/${org.id}`} className="nonprofit-card">
                <Avatar src={mediaUrl(org.logoUrl)} name={org.orgName} size={48} />
                <div className="nonprofit-card-body">
                  <strong>{org.orgName}</strong>
                  {org.category && <span className="nonprofit-card-category">{org.category}</span>}
                  {org.description && <p>{org.description}</p>}
                </div>
              </Link>
            ))}
          </div>
          <Pagination page={page} totalPages={result.totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
