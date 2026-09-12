import { apiClient } from "../../shared/api/client";
import type { Item, PagedResult } from "./types";

export const itemApi = {
  search: (params: { page: number; pageSize: number; keyword: string }) => {
    const qs = new URLSearchParams({
      page: String(params.page),
      pageSize: String(params.pageSize),
      ...(params.keyword ? { keyword: params.keyword } : {}),
    });
    return apiClient.get<PagedResult<Item>>(`/api/items?${qs.toString()}`);
  },
};
