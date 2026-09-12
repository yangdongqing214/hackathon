export interface Item {
  id: string;
  title: string;
  description: string;
  category: string;
  createdAt: string;
}

export interface PagedResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
