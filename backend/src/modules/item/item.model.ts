import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";

const itemSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" }, collection: "items" },
);

export type ItemDocument = HydratedDocument<InferSchemaType<typeof itemSchema>>;
export const ItemModel = model("Item", itemSchema);
