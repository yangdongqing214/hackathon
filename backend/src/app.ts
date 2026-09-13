import "express-async-errors";
import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import session from "express-session";
import MongoStore from "connect-mongo";
import { authRouter } from "./modules/auth/auth.routes";
import { userRouter } from "./modules/user/user.routes";
import { notificationRouter } from "./modules/notification/notification.routes";
import { itemRouter } from "./modules/item/item.routes";
import { commentRouter } from "./modules/comment/comment.routes";
import { nonprofitRouter } from "./modules/nonprofit/nonprofit.routes";
import { givingRouter } from "./modules/giving/giving.routes";
import { authMiddleware } from "./middleware/auth.middleware";
import { sessionRenewalMiddleware } from "./middleware/session-renewal.middleware";
import { ok, fail } from "./shared/response";
import { UPLOAD_ROOT } from "./shared/upload";

export function buildApp(): Express {
  const app = express();
  app.use(cors({ origin: process.env.FRONTEND_ORIGIN ?? "http://localhost:5175", credentials: true }));
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
  app.use("/api/nonprofits", nonprofitRouter);
  app.use("/api", givingRouter);

  // A malformed id in a route param isn't a real ObjectId — treat it as
  // "not found" like any other, not a 500. Without express-async-errors
  // above, an async controller's rejection would silently drop the
  // request instead of reaching this handler at all (Express 4 doesn't
  // auto-catch async rejections), which can take the whole process down.
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    if (err.name === "CastError") {
      res.status(404).json(fail(404, "Not found."));
      return;
    }
    console.error(err);
    res.status(500).json(fail(500, "Something went wrong."));
  });

  return app;
}
