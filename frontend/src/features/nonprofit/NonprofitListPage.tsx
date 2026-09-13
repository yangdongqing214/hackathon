import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useNonprofitList } from "./useNonprofitList";
import { CATEGORIES } from "./types";
import { mediaUrl } from "../../shared/api/media";
import { Avatar } from "../../shared/components/Avatar";
import { Pagination } from "../../shared/components/Pagination";
import { EmptyState } from "../../shared/components/EmptyState";
import { Skeleton } from "../../shared/components/Skeleton";
import { SearchInput } from "../../shared/components/SearchInput";
import { useAuth } from "../auth/useAuth";
import { useToast } from "../../shared/components/ToastProvider";
import { addNonprofitToPlan } from "./planStorage";

export function NonprofitListPage(): React.JSX.Element {
  const { user } = useAuth();
  const showToast = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get("category") ?? "";
  const { result, loading, page, setPage, category, setCategory, keyword, setKeyword } = useNonprofitList(categoryParam);
  const canAddToPlan = user?.role === "user";

  function changeCategory(next: string): void {
    setCategory(next);
    if (next) setSearchParams({ category: next });
    else setSearchParams({});
  }

  function addOrg(org: { id: string; orgName: string; category: string | null }): void {
    const result = addNonprofitToPlan({ id: org.id, category: org.category });
    showToast(result.message, result.ok ? "success" : "error");
    if (result.ok) navigate("/dashboard?step=2");
  }

  return (
    <div className="page nonprofit-list-page">
      <h1>Browse nonprofits</h1>
      <p className="page-subtitle">Find a cause to support, by category.</p>

      <form className="search-bar" onSubmit={(e) => e.preventDefault()}>
        <SearchInput value={keyword} onChange={setKeyword} placeholder="Search by name or description…" />
        <button type="submit" className="primary-button">
          Search
        </button>
      </form>

      <div className="category-filter-pills">
        <button type="button" className={category === "" ? "pill active" : "pill"} onClick={() => changeCategory("")}>
          All
        </button>
        {CATEGORIES.map((cat) => (
          <button key={cat} type="button" className={category === cat ? "pill active" : "pill"} onClick={() => changeCategory(cat)}>
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
        <EmptyState>{keyword ? "No nonprofits match your search." : "No nonprofits in this category yet."}</EmptyState>
      ) : (
        <div className="content-reveal" key={`${category}-${keyword}-${page}`}>
          <div className="nonprofit-grid">
            {result.list.map((org) => (
              <div key={org.id} className="nonprofit-card">
                <Link to={`/nonprofits/${org.id}`} className="nonprofit-card-main">
                  <Avatar src={mediaUrl(org.logoUrl)} name={org.orgName} size={48} />
                  <div className="nonprofit-card-body">
                    <strong>{org.orgName}</strong>
                    {org.category && <span className="nonprofit-card-category">{org.category}</span>}
                    {org.description && <p>{org.description}</p>}
                  </div>
                </Link>
                {canAddToPlan && (
                  <button type="button" className="ghost-button" onClick={() => addOrg(org)}>
                    Add to plan
                  </button>
                )}
              </div>
            ))}
          </div>
          <Pagination page={page} totalPages={result.totalPages} onChange={setPage} />
        </div>
      )}
    </div>
  );
}
