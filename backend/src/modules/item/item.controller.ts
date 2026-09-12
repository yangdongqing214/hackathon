import type { Request, Response } from "express";
import { itemService } from "./item.service";
import { ok } from "../../shared/response";

export async function search(req: Request, res: Response): Promise<void> {
  const page = Number(req.query.page ?? 1);
  const pageSize = Number(req.query.pageSize ?? 12);
  const sortBy = req.query.sortBy === "createdAt" ? "createdAt" : "title";
  const sortOrder = req.query.sortOrder === "desc" ? "desc" : "asc";
  const keyword = typeof req.query.keyword === "string" ? req.query.keyword : undefined;

  const result = await itemService.search({ page, pageSize, keyword, sortBy, sortOrder });
  res.json(ok(result));
}
