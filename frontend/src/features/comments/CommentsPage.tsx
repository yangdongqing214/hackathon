import { useCallback, useEffect, useState } from "react";
import { commentApi } from "./api";
import { CommentComposer } from "./CommentComposer";
import { CommentItem } from "./CommentItem";
import { Pagination } from "../../shared/components/Pagination";
import { EmptyState } from "../../shared/components/EmptyState";
import { Skeleton } from "../../shared/components/Skeleton";
import { StarRating } from "../../shared/components/StarRating";
import type { PagedResult, Comment } from "./types";

const PAGE_SIZE = 5;

export function CommentsPage(): React.JSX.Element {
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<PagedResult<Comment> | null>(null);
  const [summary, setSummary] = useState<{ average: number; total: number } | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    setLoading(true);
    Promise.all([commentApi.list(page, PAGE_SIZE), commentApi.summary()]).then(([listRes, summaryRes]) => {
      if (listRes.code === 0) setResult(listRes.data);
      if (summaryRes.code === 0) setSummary(summaryRes.data);
      setLoading(false);
    });
  }, [page]);

  useEffect(() => reload(), [reload]);

  return (
    <div className="page reviews-page">
      <div className="reviews-header">
        <div>
          <h1>Reviews</h1>
          <p className="page-subtitle">What people are saying — ratings, photos, and replies.</p>
        </div>
        {summary && summary.total > 0 && (
          <div className="reviews-summary">
            <strong className="reviews-summary-number">{summary.average.toFixed(1)}</strong>
            <div>
              <StarRating value={Math.round(summary.average)} size={16} />
              <span className="reviews-summary-count">
                {summary.total} review{summary.total === 1 ? "" : "s"}
              </span>
            </div>
          </div>
        )}
      </div>

      <CommentComposer parentId={null} onPosted={() => (page === 1 ? reload() : setPage(1))} />

      {loading ? (
        <div className="review-list">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="review-card review-card-skeleton">
              <Skeleton height={44} width={44} />
              <div className="review-card-body">
                <Skeleton height={14} width={140} />
                <div style={{ height: 8 }} />
                <Skeleton height={13} width="90%" />
              </div>
            </div>
          ))}
        </div>
      ) : !result || result.list.length === 0 ? (
        <EmptyState>No reviews yet — be the first to leave one.</EmptyState>
      ) : (
        <>
          <div className="review-list">
            {result.list.map((comment) => (
              <CommentItem key={comment.id} comment={comment} onPosted={reload} />
            ))}
          </div>
          <Pagination page={page} totalPages={result.totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
