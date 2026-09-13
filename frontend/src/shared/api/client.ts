export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

const BASE_URL = "http://localhost:4000";

async function request<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  return res.json();
}

async function requestForm<T>(path: string, form: FormData, method: "POST" | "PUT" = "POST"): Promise<ApiResponse<T>> {
  const res = await fetch(`${BASE_URL}${path}`, { method, credentials: "include", body: form });
  return res.json();
}

export const apiClient = {
  get: <T>(path: string): Promise<ApiResponse<T>> => request<T>(path),
  post: <T>(path: string, body?: unknown): Promise<ApiResponse<T>> =>
    request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: unknown): Promise<ApiResponse<T>> =>
    request<T>(path, { method: "PUT", body: body ? JSON.stringify(body) : undefined }),
  // multipart/form-data — never set Content-Type manually, the browser fills in the boundary.
  postForm: <T>(path: string, form: FormData): Promise<ApiResponse<T>> => requestForm<T>(path, form, "POST"),
  putForm: <T>(path: string, form: FormData): Promise<ApiResponse<T>> => requestForm<T>(path, form, "PUT"),
};
