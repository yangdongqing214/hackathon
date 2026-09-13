import type { Request, Response } from "express";
import { nonprofitService, NonprofitValidationError, NonprofitNotFoundError } from "./nonprofit.service";
import { ok, fail } from "../../shared/response";
import { publicPath } from "../../shared/upload";

export async function search(req: Request, res: Response): Promise<void> {
  const page = Number(req.query.page ?? 1);
  const pageSize = Number(req.query.pageSize ?? 9);
  const category = typeof req.query.category === "string" && req.query.category ? req.query.category : undefined;
  const keyword = typeof req.query.keyword === "string" && req.query.keyword ? req.query.keyword : undefined;
  const result = await nonprofitService.search({ page, pageSize, category, keyword });
  res.json(ok(result));
}

export async function getDetail(req: Request, res: Response): Promise<void> {
  try {
    const detail = await nonprofitService.getDetail(req.params.id);
    res.json(ok(detail));
  } catch (err) {
    if (err instanceof NonprofitNotFoundError) {
      res.status(404).json(fail(404, "Nonprofit not found."));
      return;
    }
    throw err;
  }
}

export async function getMine(req: Request, res: Response): Promise<void> {
  const draft = await nonprofitService.getMyDraft(req.user!.id);
  res.json(ok(draft));
}

export async function updateMine(req: Request, res: Response): Promise<void> {
  const fields: Record<string, unknown> = {};
  if (typeof req.body.orgName === "string") fields.org_name = req.body.orgName;
  if (typeof req.body.description === "string") fields.description = req.body.description;
  if (typeof req.body.fundingNeedStatement === "string") fields.funding_need_statement = req.body.fundingNeedStatement;
  if (req.body.targetAmount !== undefined) fields.target_amount = req.body.targetAmount === "" ? null : Number(req.body.targetAmount);
  if (req.body.amountRaised !== undefined) fields.amount_raised = Number(req.body.amountRaised);
  if (typeof req.body.videoUrl === "string") fields.video_url = req.body.videoUrl || null;
  if (typeof req.body.category === "string") fields.category = req.body.category;

  const file = (req as Request & { file?: Express.Multer.File }).file;
  if (file) fields.logo_url = publicPath("nonprofit-logos", file.filename);

  try {
    const draft = await nonprofitService.updateMine(req.user!.id, fields);
    res.json(ok(draft));
  } catch (err) {
    if (err instanceof NonprofitValidationError) {
      res.status(400).json(fail(400, err.message));
      return;
    }
    throw err;
  }
}
