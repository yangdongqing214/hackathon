import { NonprofitModel, type NonprofitDocument } from "./nonprofit.model";

export interface SearchNonprofitsParams {
  page: number;
  pageSize: number;
  category?: string;
}

class NonprofitRepository {
  findByOwnerId(ownerUserId: string): Promise<NonprofitDocument | null> {
    return NonprofitModel.findOne({ owner_user_id: ownerUserId });
  }

  findById(id: string): Promise<NonprofitDocument | null> {
    return NonprofitModel.findById(id);
  }

  upsertByOwnerId(ownerUserId: string, fields: Record<string, unknown>): Promise<NonprofitDocument> {
    return NonprofitModel.findOneAndUpdate(
      { owner_user_id: ownerUserId },
      { $set: fields },
      { new: true, upsert: true },
    );
  }

  // Only orgs with a name are "published" — a freshly-registered nonprofit
  // account with no profile filled in yet shouldn't show up in Browse.
  async search(params: SearchNonprofitsParams): Promise<{ rows: NonprofitDocument[]; total: number }> {
    const filter: Record<string, unknown> = { org_name: { $ne: null } };
    if (params.category) filter.category = params.category;
    const [rows, total] = await Promise.all([
      NonprofitModel.find(filter)
        .sort({ org_name: 1 })
        .skip((params.page - 1) * params.pageSize)
        .limit(params.pageSize),
      NonprofitModel.countDocuments(filter),
    ]);
    return { rows, total };
  }
}

export const nonprofitRepository = new NonprofitRepository();
