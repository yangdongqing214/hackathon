import type { ItemDocument } from "./item.model";

export interface ItemDto {
  id: string;
  title: string;
  description: string;
  category: string;
  createdAt: string;
}

export function toItemDto(doc: ItemDocument): ItemDto {
  return {
    id: doc._id.toString(),
    title: doc.title,
    description: doc.description,
    category: doc.category,
    createdAt: doc.created_at.toISOString(),
  };
}
