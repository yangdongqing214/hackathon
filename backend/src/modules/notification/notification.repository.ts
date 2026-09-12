import { NotificationModel } from "./notification.model";

class NotificationRepository {
  listRecent(userId: string, limit: number) {
    return NotificationModel.find({ user_id: userId }).sort({ created_at: -1 }).limit(limit);
  }

  countUnread(userId: string): Promise<number> {
    return NotificationModel.countDocuments({ user_id: userId, read: false });
  }

  markRead(id: string, userId: string) {
    return NotificationModel.findOneAndUpdate({ _id: id, user_id: userId }, { $set: { read: true } });
  }
}

export const notificationRepository = new NotificationRepository();
