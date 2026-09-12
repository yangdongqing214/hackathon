import "express-session";
import type { UserDto } from "../modules/user/user.dto";

declare module "express-session" {
  interface SessionData {
    userId?: string;
    maxAgeMs?: number;
  }
}

declare global {
  namespace Express {
    interface Request {
      user?: UserDto;
    }
  }
}
