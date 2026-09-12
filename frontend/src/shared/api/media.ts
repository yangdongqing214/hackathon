const BASE_URL = "http://localhost:4000";

export function mediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  return `${BASE_URL}${path}`;
}
