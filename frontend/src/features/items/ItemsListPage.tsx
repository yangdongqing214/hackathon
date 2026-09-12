import { useItems } from "./useItems";
import { SearchInput } from "../../shared/components/SearchInput";
import { Pagination } from "../../shared/components/Pagination";
import { EmptyState } from "../../shared/components/EmptyState";
import { Skeleton } from "../../shared/components/Skeleton";
import { Badge } from "../../shared/components/Badge";

export function ItemsListPage(): React.JSX.Element {
  const { result, loading, page, setPage, keyword, setKeyword } = useItems();

  return (
    <div className="page">
      <h1>Items</h1>
      <p className="page-subtitle">Generic paginated + searchable list — swap the data source for real records.</p>

      <SearchInput value={keyword} onChange={setKeyword} placeholder="Search by title or description…" />

      {loading ? (
        <div className="item-list">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="item-row">
              <Skeleton height={18} width="40%" />
              <Skeleton height={14} width="80%" />
            </div>
          ))}
        </div>
      ) : !result || result.list.length === 0 ? (
        <EmptyState>No items match your search.</EmptyState>
      ) : (
        <>
          <div className="item-list">
            {result.list.map((item) => (
              <div key={item.id} className="item-row">
                <div className="item-row-heading">
                  <strong>{item.title}</strong>
                  <Badge>{item.category}</Badge>
                </div>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
          <Pagination page={page} totalPages={result.totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
