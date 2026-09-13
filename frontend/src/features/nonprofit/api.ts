import { apiClient } from "../../shared/api/client";
import type { NonprofitCard, NonprofitDetail, NonprofitDraft, PagedResult } from "./types";

export const nonprofitApi = {
  search: (page: number, pageSize: number, category: string) => {
    const query = new URLSearchParams({ page: String(page), pageSize: String(pageSize), ...(category ? { category } : {}) });
    return apiClient.get<PagedResult<NonprofitCard>>(`/api/nonprofits?${query.toString()}`);
  },
  getDetail: (id: string) => apiClient.get<NonprofitDetail>(`/api/nonprofits/${id}`),
  getMine: () => apiClient.get<NonprofitDraft>("/api/nonprofits/me"),
  updateMine: (form: FormData) => apiClient.putForm<NonprofitDraft>("/api/nonprofits/me", form),
};
