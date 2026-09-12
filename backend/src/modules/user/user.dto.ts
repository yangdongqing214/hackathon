import type { UserDocument } from "./user.model";

export interface UserDto {
  id: string;
  username: string;
  email: string;
  role: string;
  nickname: string;
  avatarUrl: string | null;
  gender: string | null;
  dateOfBirth: string | null;
}

export function toUserDto(doc: UserDocument): UserDto {
  return {
    id: doc._id.toString(),
    username: doc.username,
    email: doc.email,
    role: doc.role,
    nickname: doc.nickname,
    avatarUrl: doc.avatar_url ?? null,
    gender: doc.gender ?? null,
    dateOfBirth: doc.date_of_birth ?? null,
  };
}
