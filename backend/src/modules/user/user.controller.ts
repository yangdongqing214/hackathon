import type { Request, Response } from "express";
import { userRepository } from "./user.repository";
import { toUserDto } from "./user.dto";
import { ok, fail } from "../../shared/response";
import { publicPath } from "../../shared/upload";

export async function updateProfile(req: Request, res: Response): Promise<void> {
  const { nickname, gender, dateOfBirth } = req.body;
  if (typeof nickname !== "string" || !nickname.trim()) {
    res.status(400).json(fail(400, "Nickname is required."));
    return;
  }
  const doc = await userRepository.updateProfile(req.user!.id, {
    nickname: nickname.trim(),
    ...(gender !== undefined ? { gender } : {}),
    ...(dateOfBirth !== undefined ? { date_of_birth: dateOfBirth } : {}),
    ...(req.file ? { avatar_url: publicPath("avatars", req.file.filename) } : {}),
  });
  res.json(ok(doc ? toUserDto(doc) : null));
}
