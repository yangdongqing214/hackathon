import { Router } from "express";
import * as commentController from "./comment.controller";
import { requireAuth } from "../../middleware/auth.middleware";
import { uploadCommentImages } from "../../shared/upload";

export const commentRouter = Router();

commentRouter.use(requireAuth);
commentRouter.get("/", commentController.list);
commentRouter.get("/summary", commentController.summary);
commentRouter.post("/", uploadCommentImages.array("images", 4), commentController.create);
