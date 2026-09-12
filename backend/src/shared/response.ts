export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export function ok<T>(data: T, message = "ok"): ApiResponse<T> {
  return { code: 0, message, data };
}

export function fail(code: number, message: string): ApiResponse<null> {
  return { code, message, data: null };
}

export interface PagedResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function paged<T>(list: T[], total: number, page: number, pageSize: number): PagedResult<T> {
  return { list, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}
