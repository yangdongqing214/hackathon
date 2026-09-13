import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";

const nonprofitSchema = new Schema(
  {
    owner_user_id: { type: String, required: true, unique: true },
    org_name: { type: String, default: null },
    logo_url: { type: String, default: null },
    description: { type: String, default: null },
    funding_need_statement: { type: String, default: null },
    target_amount: { type: Number, default: null },
    amount_raised: { type: Number, default: 0 },
    video_url: { type: String, default: null },
    category: { type: String, default: null },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" }, collection: "nonprofits" },
);

export type NonprofitDocument = HydratedDocument<InferSchemaType<typeof nonprofitSchema>>;
export const NonprofitModel = model("Nonprofit", nonprofitSchema);
