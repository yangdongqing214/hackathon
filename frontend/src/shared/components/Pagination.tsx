export function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}): React.JSX.Element {
  return (
    <div className="pagination-controls">
      <button type="button" className="ghost-button" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        ← Previous
      </button>
      <span>
        Page {page} of {Math.max(1, totalPages)}
      </span>
      <button type="button" className="ghost-button" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
        Next →
      </button>
    </div>
  );
}
