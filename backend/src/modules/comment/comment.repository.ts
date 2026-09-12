import { CommentModel, type CommentDocument } from "./comment.model";

class CommentRepository {
  async listTopLevel(
    targetType: string,
    targetId: string,
    page: number,
    pageSize: number,
  ): Promise<{ rows: CommentDocument[]; total: number }> {
    const filter = { target_type: targetType, target_id: targetId, parent_id: null };
    const [rows, total] = await Promise.all([
      CommentModel.find(filter)
        .sort({ created_at: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize),
      CommentModel.countDocuments(filter),
    ]);
    return { rows, total };
  }

  listReplies(parentIds: string[]): Promise<CommentDocument[]> {
    return CommentModel.find({ parent_id: { $in: parentIds } }).sort({ created_at: 1 });
  }

  async ratingSummary(targetType: string, targetId: string): Promise<{ average: number; total: number }> {
    const [row] = await CommentModel.aggregate([
      { $match: { target_type: targetType, target_id: targetId, parent_id: null, rating: { $ne: null } } },
      { $group: { _id: null, average: { $avg: "$rating" }, total: { $sum: 1 } } },
    ]);
    return { average: row?.average ?? 0, total: row?.total ?? 0 };
  }

  create(input: {
    targetType: string;
    targetId: string;
    parentId: string | null;
    authorId: string;
    rating: number | null;
    body: string;
    imageUrls: string[];
  }): Promise<CommentDocument> {
    return CommentModel.create({
      target_type: input.targetType,
      target_id: input.targetId,
      parent_id: input.parentId,
      author_id: input.authorId,
      rating: input.rating,
      body: input.body,
      image_urls: input.imageUrls,
    });
  }
}

export const commentRepository = new CommentRepository();
