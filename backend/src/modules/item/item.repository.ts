import { ItemModel } from "./item.model";

export interface SearchItemsParams {
  page: number;
  pageSize: number;
  keyword?: string;
  sortBy?: "title" | "createdAt";
  sortOrder?: "asc" | "desc";
}

class ItemRepository {
  async count(): Promise<number> {
    return ItemModel.countDocuments();
  }

  async createMany(rows: { title: string; description: string; category: string }[]): Promise<void> {
    await ItemModel.insertMany(rows);
  }

  async search(params: SearchItemsParams) {
    const filter = params.keyword
      ? { $or: [{ title: new RegExp(params.keyword, "i") }, { description: new RegExp(params.keyword, "i") }] }
      : {};
    const sortField = params.sortBy === "createdAt" ? "created_at" : "title";
    const sortOrder = params.sortOrder === "desc" ? -1 : 1;

    const [rows, total] = await Promise.all([
      ItemModel.find(filter)
        .sort({ [sortField]: sortOrder })
        .skip((params.page - 1) * params.pageSize)
        .limit(params.pageSize),
      ItemModel.countDocuments(filter),
    ]);
    return { rows, total };
  }
}

export const itemRepository = new ItemRepository();
