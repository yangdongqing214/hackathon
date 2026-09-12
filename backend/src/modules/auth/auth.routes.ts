import { Router } from "express";
import * as authController from "./auth.controller";
import { uploadAvatar } from "../../shared/upload";

export const authRouter = Router();

authRouter.post("/register", uploadAvatar.single("avatar"), authController.register);
authRouter.post("/login", authController.login);
authRouter.post("/logout", authController.logout);
authRouter.get("/me", authController.me);
authRouter.post("/forgot-password", authController.forgotPassword);
authRouter.post("/reset-password", authController.resetPassword);
