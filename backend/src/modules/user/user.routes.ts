import { Router } from "express";
import * as userController from "./user.controller";
import { requireAuth, permissionMiddleware } from "../../middleware/auth.middleware";
import { ok } from "../../shared/response";
import { uploadAvatar } from "../../shared/upload";

export const userRouter = Router();

userRouter.use(requireAuth);
userRouter.put("/me", uploadAvatar.single("avatar"), userController.updateProfile);

// Example only — shows how to use permissionMiddleware; a non-"admin"
// role gets a 403 here. Not a real business endpoint.
userRouter.get("/admin-only", permissionMiddleware("admin"), (_req, res) => res.json(ok(null)));
