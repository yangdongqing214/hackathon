import { commentRepository } from "./comment.repository";
import { userRepository } from "../user/user.repository";
import type { CommentDocument } from "./comment.model";
import type { CommentDto, CommentAuthorDto } from "./comment.dto";
import { paged, type PagedResult } from "../../shared/response";

class CommentService {
  async list(targetType: string, targetId: string, page: number, pageSize: number): Promise<PagedResult<CommentDto>> {
    const { rows: topLevel, total } = await commentRepository.listTopLevel(targetType, targetId, page, pageSize);
    const replies = await commentRepository.listReplies(topLevel.map((c) => c._id.toString()));

    const authorIds = [...new Set([...topLevel, ...replies].map((c) => c.author_id))];
    const authors = await userRepository.findByIds(authorIds);
    const authorById = new Map(authors.map((a) => [a._id.toString(), a]));
    const authorDto = (id: string): CommentAuthorDto => {
      const author = authorById.get(id);
      return { id, nickname: author?.nickname ?? "Deleted user", avatarUrl: author?.avatar_url ?? null };
    };

    const toDto = (doc: CommentDocument, docReplies: CommentDocument[]): CommentDto => ({
      id: doc._id.toString(),
      author: authorDto(doc.author_id),
      rating: doc.rating ?? null,
      body: doc.body,
      imageUrls: doc.image_urls,
      createdAt: doc.created_at.toISOString(),
      replies: docReplies.map((r) => toDto(r, [])),
    });

    const repliesByParent = new Map<string, CommentDocument[]>();
    for (const reply of replies) {
      const key = reply.parent_id!;
      repliesByParent.set(key, [...(repliesByParent.get(key) ?? []), reply]);
    }

    const list = topLevel.map((c) => toDto(c, repliesByParent.get(c._id.toString()) ?? []));
    return paged(list, total, page, pageSize);
  }

  ratingSummary(targetType: string, targetId: string) {
    return commentRepository.ratingSummary(targetType, targetId);
  }

  create(input: {
    targetType: string;
    targetId: string;
    parentId: string | null;
    authorId: string;
    rating: number | null;
    body: string;
    imageUrls: string[];
  }) {
    return commentRepository.create(input);
  }
}

export const commentService = new CommentService();
