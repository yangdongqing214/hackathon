import type { Request, Response, NextFunction } from "express";

// Renew the session once it's past half its lifetime, piggybacking on
// whatever request happens to come in — no separate polling needed on
// the frontend.
export function sessionRenewalMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const maxAgeMs = req.session.maxAgeMs;
  const remaining = req.session.cookie.maxAge;
  if (req.session.userId && maxAgeMs && remaining != null && remaining < maxAgeMs / 2) {
    req.session.cookie.maxAge = maxAgeMs;
    req.session.touch();
  }
  next();
}
