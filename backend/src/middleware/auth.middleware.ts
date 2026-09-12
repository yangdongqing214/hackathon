import type { Request, Response, NextFunction } from "express";
import { userRepository } from "../modules/user/user.repository";
import { toUserDto } from "../modules/user/user.dto";
import { fail } from "../shared/response";

export async function authMiddleware(req: Request, _res: Response, next: NextFunction): Promise<void> {
  if (!req.session.userId) {
    next();
    return;
  }
  const doc = await userRepository.findById(req.session.userId);
  if (doc) req.user = toUserDto(doc);
  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json(fail(401, "Not signed in."));
    return;
  }
  next();
}

export function permissionMiddleware(requiredRole: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || req.user.role !== requiredRole) {
      res.status(403).json(fail(403, "No permission to perform this action"));
      return;
    }
    next();
  };
}
