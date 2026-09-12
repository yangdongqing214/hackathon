import { Router } from "express";
import * as notificationController from "./notification.controller";
import { requireAuth } from "../../middleware/auth.middleware";

export const notificationRouter = Router();

notificationRouter.use(requireAuth);
notificationRouter.get("/", notificationController.list);
notificationRouter.post("/:id/read", notificationController.markRead);
