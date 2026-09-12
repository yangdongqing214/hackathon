import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";

const notificationSchema = new Schema(
  {
    user_id: { type: String, required: true, index: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    link_path: { type: String, default: null },
    read: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" }, collection: "notifications" },
);

export type NotificationDocument = HydratedDocument<InferSchemaType<typeof notificationSchema>>;
export const NotificationModel = model("Notification", notificationSchema);
