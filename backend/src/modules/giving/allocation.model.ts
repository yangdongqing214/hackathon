import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";

const allocationSchema = new Schema(
  {
    client_id: { type: String, required: true, unique: true },
    snapshot: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" }, collection: "allocations" },
);

export type AllocationDocument = HydratedDocument<InferSchemaType<typeof allocationSchema>>;
export const AllocationModel = model("Allocation", allocationSchema);
