import type { Request, Response } from "express";
import { userRepository } from "./user.repository";
import { toUserDto } from "./user.dto";
import { ok, fail } from "../../shared/response";
import { publicPath } from "../../shared/upload";

export async function updateProfile(req: Request, res: Response): Promise<void> {
  const { nickname, gender, dateOfBirth, username, email } = req.body;
  if (typeof nickname !== "string" || !nickname.trim()) {
    res.status(400).json(fail(400, "Nickname is required."));
    return;
  }

  const fields: Record<string, unknown> = {
    nickname: nickname.trim(),
    ...(gender !== undefined ? { gender } : {}),
    ...(dateOfBirth !== undefined ? { date_of_birth: dateOfBirth } : {}),
    ...(req.file ? { avatar_url: publicPath("avatars", req.file.filename) } : {}),
  };

  if (typeof username === "string" && username.trim()) {
    const trimmed = username.trim();
    if (await userRepository.existsByUsernameOrEmailExcluding(req.user!.id, { username: trimmed })) {
      res.status(400).json(fail(400, "That username is already taken."));
      return;
    }
    fields.username = trimmed;
  }

  if (typeof email === "string" && email.trim()) {
    const trimmed = email.trim().toLowerCase();
    if (await userRepository.existsByUsernameOrEmailExcluding(req.user!.id, { email: trimmed })) {
      res.status(400).json(fail(400, "That email is already in use."));
      return;
    }
    fields.email = trimmed;
  }

  const doc = await userRepository.updateProfile(req.user!.id, fields);
  res.json(ok(doc ? toUserDto(doc) : null));
}
