import express, { type Express } from "express";
import cors from "cors";
import session from "express-session";
import MongoStore from "connect-mongo";
import { authRouter } from "./modules/auth/auth.routes";
import { userRouter } from "./modules/user/user.routes";
import { notificationRouter } from "./modules/notification/notification.routes";
import { itemRouter } from "./modules/item/item.routes";
import { commentRouter } from "./modules/comment/comment.routes";
import { authMiddleware } from "./middleware/auth.middleware";
import { sessionRenewalMiddleware } from "./middleware/session-renewal.middleware";
import { ok } from "./shared/response";
import { UPLOAD_ROOT } from "./shared/upload";

export function buildApp(): Express {
  const app = express();
  app.use(cors({ origin: process.env.FRONTEND_ORIGIN ?? "http://localhost:5173", credentials: true }));
  app.use(express.json());
  app.use(
    session({
      secret: process.env.SESSION_SECRET ?? "dev-secret",
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({ mongoUrl: process.env.MONGO_URI ?? "mongodb://localhost:27018/app_template" }),
      cookie: { maxAge: 1000 * 60 * 60 * 2 },
    }),
  );
  app.use(authMiddleware);
  app.use(sessionRenewalMiddleware);
  app.use("/uploads", express.static(UPLOAD_ROOT));

  app.get("/api/health", (_req, res) => res.json(ok({ status: "ok" })));
  app.use("/api/auth", authRouter);
  app.use("/api/users", userRouter);
  app.use("/api/notifications", notificationRouter);
  app.use("/api/items", itemRouter);
  app.use("/api/comments", commentRouter);

  return app;
}
