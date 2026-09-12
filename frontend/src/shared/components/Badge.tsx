export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger";
}): React.JSX.Element {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}
