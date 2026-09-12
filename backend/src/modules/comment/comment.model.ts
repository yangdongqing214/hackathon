import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";

const commentSchema = new Schema(
  {
    target_type: { type: String, required: true },
    target_id: { type: String, required: true, index: true },
    parent_id: { type: String, default: null, index: true },
    author_id: { type: String, required: true },
    rating: { type: Number, default: null },
    body: { type: String, required: true },
    image_urls: { type: [String], default: [] },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" }, collection: "comments" },
);

export type CommentDocument = HydratedDocument<InferSchemaType<typeof commentSchema>>;
export const CommentModel = model("Comment", commentSchema);
