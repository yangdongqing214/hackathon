import type { NotificationDocument } from "./notification.model";

export interface NotificationDto {
  id: string;
  title: string;
  body: string;
  linkPath: string | null;
  read: boolean;
  createdAt: string;
}

export function toNotificationDto(doc: NotificationDocument): NotificationDto {
  return {
    id: doc._id.toString(),
    title: doc.title,
    body: doc.body,
    linkPath: doc.link_path ?? null,
    read: doc.read,
    createdAt: doc.created_at.toISOString(),
  };
}
