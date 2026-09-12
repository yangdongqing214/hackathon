import { Router } from "express";
import * as itemController from "./item.controller";
import { requireAuth } from "../../middleware/auth.middleware";

export const itemRouter = Router();

itemRouter.use(requireAuth);
itemRouter.get("/", itemController.search);
