// Empty means the API runs on the same origin as this user-side demo.
// When the teams deploy separate front-end and back-end services, set this to
// their shared API origin, for example: 'https://api.example.org'.
export const API_BASE_URL = '';

export function apiUrl(path) {
  return `${API_BASE_URL.replace(/\/$/, '')}${path}`;
}
