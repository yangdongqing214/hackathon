import { Router } from "express";
import * as nonprofitController from "./nonprofit.controller";
import { requireAuth } from "../../middleware/auth.middleware";
import { uploadNonprofitLogo } from "../../shared/upload";

export const nonprofitRouter = Router();

nonprofitRouter.get("/", nonprofitController.search);
nonprofitRouter.get("/me", requireAuth, nonprofitController.getMine);
nonprofitRouter.put("/me", requireAuth, uploadNonprofitLogo.single("logo"), nonprofitController.updateMine);
nonprofitRouter.get("/:id", nonprofitController.getDetail);
