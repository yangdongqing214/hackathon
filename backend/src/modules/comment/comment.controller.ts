import type { Request, Response } from "express";
import { commentService } from "./comment.service";
import { ok, fail } from "../../shared/response";
import { publicPath } from "../../shared/upload";

export async function list(req: Request, res: Response): Promise<void> {
  const targetType = String(req.query.targetType ?? "demo");
  const targetId = String(req.query.targetId ?? "demo");
  const page = Number(req.query.page ?? 1);
  const pageSize = Number(req.query.pageSize ?? 10);
  const result = await commentService.list(targetType, targetId, page, pageSize);
  res.json(ok(result));
}

export async function summary(req: Request, res: Response): Promise<void> {
  const targetType = String(req.query.targetType ?? "demo");
  const targetId = String(req.query.targetId ?? "demo");
  const result = await commentService.ratingSummary(targetType, targetId);
  res.json(ok(result));
}

export async function create(req: Request, res: Response): Promise<void> {
  const { targetType, targetId, parentId, rating, body } = req.body;
  if (!targetType || !targetId || !body?.trim()) {
    res.status(400).json(fail(400, "Comment text is required."));
    return;
  }
  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  const imageUrls = files.map((f) => publicPath("comment-images", f.filename));
  const doc = await commentService.create({
    targetType,
    targetId,
    parentId: parentId || null,
    authorId: req.user!.id,
    rating: rating ? Number(rating) : null,
    body: body.trim(),
    imageUrls,
  });
  res.json(ok({ id: doc._id.toString() }));
}
