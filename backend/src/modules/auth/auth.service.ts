import crypto from "crypto";
import bcrypt from "bcryptjs";
import { userRepository } from "../user/user.repository";
import { toUserDto, type UserDto } from "../user/user.dto";

export class AuthError extends Error {}

const SESSION_MAX_AGE_DEFAULT = 1000 * 60 * 60 * 2; // 2h — plain session
const SESSION_MAX_AGE_REMEMBERED = 1000 * 60 * 60 * 24 * 30; // 30d — remember me
const RESET_TOKEN_TTL_MS = 1000 * 60 * 60; // 1h

export interface LoginInput {
  identifier: string;
  password: string;
}

export class AuthService {
  async register(input: {
    username: string;
    email: string;
    password: string;
    role: string;
    nickname: string;
    avatarUrl?: string;
  }): Promise<UserDto> {
    if (await userRepository.existsByUsernameOrEmail(input.username, input.email)) {
      throw new AuthError("Username or email is already taken.");
    }
    const passwordHash = await bcrypt.hash(input.password, 10);
    const doc = await userRepository.create({ ...input, passwordHash });
    return toUserDto(doc);
  }

  async login(input: LoginInput): Promise<UserDto> {
    const doc = await userRepository.findByIdentifier(input.identifier);
    if (!doc || !(await bcrypt.compare(input.password, doc.password_hash))) {
      throw new AuthError("Incorrect username/email or password.");
    }
    return toUserDto(doc);
  }

  sessionMaxAge(rememberMe: boolean): number {
    return rememberMe ? SESSION_MAX_AGE_REMEMBERED : SESSION_MAX_AGE_DEFAULT;
  }

  // Mock flow — no email service wired up. In production this would email the link
  // instead of returning the token straight to the caller.
  async requestPasswordReset(identifier: string): Promise<string | null> {
    const doc = await userRepository.findByIdentifier(identifier);
    if (!doc) return null;
    const token = crypto.randomBytes(24).toString("hex");
    await userRepository.setResetToken(doc._id.toString(), token, new Date(Date.now() + RESET_TOKEN_TTL_MS));
    return token;
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const doc = await userRepository.findByResetToken(token);
    if (!doc) throw new AuthError("This reset link is invalid or has expired.");
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await userRepository.resetPassword(doc._id.toString(), passwordHash);
  }
}

export const authService = new AuthService();
