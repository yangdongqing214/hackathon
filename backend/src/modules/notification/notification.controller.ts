import type { Request, Response } from "express";
import { notificationRepository } from "./notification.repository";
import { toNotificationDto } from "./notification.dto";
import { ok } from "../../shared/response";

const RECENT_LIMIT = 10;

export async function list(req: Request, res: Response): Promise<void> {
  const docs = await notificationRepository.listRecent(req.user!.id, RECENT_LIMIT);
  const unread = await notificationRepository.countUnread(req.user!.id);
  res.json(ok({ items: docs.map(toNotificationDto), unread }));
}

export async function markRead(req: Request, res: Response): Promise<void> {
  await notificationRepository.markRead(req.params.id, req.user!.id);
  res.json(ok(null));
}
