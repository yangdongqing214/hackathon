export function Skeleton({ height = 16, width = "100%" }: { height?: number; width?: number | string }): React.JSX.Element {
  return <span className="skeleton-block" style={{ height, width }} aria-hidden="true" />;
}
