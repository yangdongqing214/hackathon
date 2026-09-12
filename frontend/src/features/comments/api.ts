import { apiClient } from "../../shared/api/client";
import type { Comment, PagedResult } from "./types";

const DEMO_TARGET = { targetType: "demo", targetId: "demo-thread" };

export const commentApi = {
  summary: () => {
    const qs = new URLSearchParams(DEMO_TARGET);
    return apiClient.get<{ average: number; total: number }>(`/api/comments/summary?${qs.toString()}`);
  },
  list: (page: number, pageSize: number) => {
    const qs = new URLSearchParams({
      targetType: DEMO_TARGET.targetType,
      targetId: DEMO_TARGET.targetId,
      page: String(page),
      pageSize: String(pageSize),
    });
    return apiClient.get<PagedResult<Comment>>(`/api/comments?${qs.toString()}`);
  },
  create: (input: { parentId: string | null; rating: number | null; body: string; images: File[] }) => {
    const form = new FormData();
    form.append("targetType", DEMO_TARGET.targetType);
    form.append("targetId", DEMO_TARGET.targetId);
    if (input.parentId) form.append("parentId", input.parentId);
    if (input.rating) form.append("rating", String(input.rating));
    form.append("body", input.body);
    input.images.forEach((file) => form.append("images", file));
    return apiClient.postForm<{ id: string }>("/api/comments", form);
  },
};
