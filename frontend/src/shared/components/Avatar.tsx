export function Avatar({ src, name, size = 36 }: { src?: string | null; name: string; size?: number }): React.JSX.Element {
  const style = { width: size, height: size, fontSize: size * 0.42 };
  if (src) return <img src={src} alt="" className="avatar-circle" style={style} />;
  return (
    <span className="avatar-circle avatar-circle-fallback" style={style}>
      {(name || "?").slice(0, 1).toUpperCase()}
    </span>
  );
}
