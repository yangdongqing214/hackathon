export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

const BASE_URL = "http://localhost:4000";

// Fallback error handler to prevent UI loading state hangs on network/server errors
async function request<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      ...init,
    });
    return await res.json();
  } catch (err) {
    // Return structured API response when backend is unreachable or request is blocked
    return {
      code: -1,
      message: "Unable to connect to backend server. Make sure the backend is running on http://localhost:4000.",
      data: null as unknown as T,
    };
  }
}

// Fallback error handler for multipart/form-data requests
async function requestForm<T>(path: string, form: FormData): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${BASE_URL}${path}`, { method: "POST", credentials: "include", body: form });
    return await res.json();
  } catch (err) {
    // Return structured API response when backend is unreachable or request is blocked
    return {
      code: -1,
      message: "Unable to connect to backend server. Make sure the backend is running on http://localhost:4000.",
      data: null as unknown as T,
    };
  }
}

export const apiClient = {
  get: <T>(path: string): Promise<ApiResponse<T>> => request<T>(path),
  post: <T>(path: string, body?: unknown): Promise<ApiResponse<T>> =>
    request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: unknown): Promise<ApiResponse<T>> =>
    request<T>(path, { method: "PUT", body: body ? JSON.stringify(body) : undefined }),
  // multipart/form-data — never set Content-Type manually, the browser fills in the boundary.
  postForm: <T>(path: string, form: FormData): Promise<ApiResponse<T>> => requestForm<T>(path, form),
};
