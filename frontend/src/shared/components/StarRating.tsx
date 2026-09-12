import { useState } from "react";

export function StarRating({
  value,
  onChange,
  size = 18,
}: {
  value: number;
  onChange?: (value: number) => void;
  size?: number;
}): React.JSX.Element {
  const interactive = Boolean(onChange);
  const [hovered, setHovered] = useState<number | null>(null);
  const display = hovered ?? value;

  return (
    <div
      className="star-rating"
      role={interactive ? "radiogroup" : "img"}
      aria-label={`${value} out of 5 stars`}
      onMouseLeave={() => setHovered(null)}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={n <= display ? "star star-filled" : "star"}
          style={{ fontSize: size, cursor: interactive ? "pointer" : "default" }}
          disabled={!interactive}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          onMouseEnter={() => interactive && setHovered(n)}
          onClick={() => onChange?.(n)}
        >
          ★
        </button>
      ))}
    </div>
  );
}
