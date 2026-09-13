import type { Request, Response } from "express";
import { authService, AuthError } from "./auth.service";
import { userRepository } from "../user/user.repository";
import { toUserDto } from "../user/user.dto";
import { ok, fail } from "../../shared/response";
import { publicPath } from "../../shared/upload";

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { username, email, password, role, nickname } = req.body;
    if (!username || !email || !password || !role || !nickname) {
      res.status(400).json(fail(400, "All fields are required."));
      return;
    }
    if (role !== "user" && role !== "nonprofit") {
      res.status(400).json(fail(400, "Invalid role."));
      return;
    }
    if (password.length < 8) {
      res.status(400).json(fail(400, "Password needs at least 8 characters."));
      return;
    }
    const avatarUrl = req.file ? publicPath("avatars", req.file.filename) : undefined;
    const user = await authService.register({ username, email, password, role, nickname, avatarUrl });
    req.session.userId = user.id;
    req.session.maxAgeMs = req.session.cookie.maxAge ?? undefined;
    res.json(ok(user));
  } catch (err) {
    if (err instanceof AuthError) {
      res.status(400).json(fail(400, err.message));
      return;
    }
    throw err;
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { identifier, password, rememberMe } = req.body;
    if (!identifier || !password) {
      res.status(400).json(fail(400, "Enter your username/email and password."));
      return;
    }
    const user = await authService.login({ identifier, password });
    const maxAge = authService.sessionMaxAge(Boolean(rememberMe));
    req.session.cookie.maxAge = maxAge;
    req.session.maxAgeMs = maxAge;
    req.session.userId = user.id;
    res.json(ok(user));
  } catch (err) {
    if (err instanceof AuthError) {
      res.status(401).json(fail(401, err.message));
      return;
    }
    throw err;
  }
}

export function logout(req: Request, res: Response): void {
  req.session.destroy(() => {
    res.json(ok(null));
  });
}

export async function me(req: Request, res: Response): Promise<void> {
  if (!req.session.userId) {
    res.json(ok(null));
    return;
  }
  const doc = await userRepository.findById(req.session.userId);
  res.json(ok(doc ? toUserDto(doc) : null));
}

// Mock flow — dev-only, returns the reset token directly instead of emailing it
// (no email service wired up in this template). Always returns ok() regardless of
// whether the identifier matched, so the endpoint can't be used to enumerate accounts.
export async function forgotPassword(req: Request, res: Response): Promise<void> {
  const { identifier } = req.body;
  if (!identifier) {
    res.status(400).json(fail(400, "Enter your username or email."));
    return;
  }
  const token = await authService.requestPasswordReset(identifier);
  res.json(ok({ devResetToken: token }));
}

export async function resetPassword(req: Request, res: Response): Promise<void> {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      res.status(400).json(fail(400, "Missing reset token or new password."));
      return;
    }
    if (password.length < 8) {
      res.status(400).json(fail(400, "Password needs at least 8 characters."));
      return;
    }
    await authService.resetPassword(token, password);
    res.json(ok(null));
  } catch (err) {
    if (err instanceof AuthError) {
      res.status(400).json(fail(400, err.message));
      return;
    }
    throw err;
  }
}
