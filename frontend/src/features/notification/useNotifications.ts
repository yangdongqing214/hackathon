import { useEffect, useState, useCallback } from "react";
import { notificationApi } from "./api";
import type { Notification } from "./types";

const POLL_INTERVAL_MS = 15000;

export function useNotifications(enabled: boolean): {
  items: Notification[];
  unread: number;
  markRead: (id: string) => void;
} {
  const [items, setItems] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);

  const load = useCallback(() => {
    notificationApi.list().then((res) => {
      if (res.code !== 0) return;
      setItems(res.data.items);
      setUnread(res.data.unread);
    });
  }, []);

  useEffect(() => {
    if (!enabled) return;
    load();
    const timer = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [enabled, load]);

  function markRead(id: string): void {
    notificationApi.markRead(id).then(load);
  }

  return { items, unread, markRead };
}
