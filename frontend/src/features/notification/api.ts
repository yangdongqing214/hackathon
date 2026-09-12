import { apiClient } from "../../shared/api/client";
import type { Notification } from "./types";

export const notificationApi = {
  list: () => apiClient.get<{ items: Notification[]; unread: number }>("/api/notifications"),
  markRead: (id: string) => apiClient.post<null>(`/api/notifications/${id}/read`),
};
