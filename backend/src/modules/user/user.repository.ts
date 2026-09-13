import { UserModel, type UserDocument } from "./user.model";

class UserRepository {
  findById(id: string): Promise<UserDocument | null> {
    return UserModel.findOne({ _id: id, deleted_at: null });
  }

  findByIds(ids: string[]): Promise<UserDocument[]> {
    return UserModel.find({ _id: { $in: ids } });
  }

  findByIdentifier(identifier: string): Promise<UserDocument | null> {
    return UserModel.findOne({
      deleted_at: null,
      $or: [{ username: identifier }, { email: identifier }],
    });
  }

  findByResetToken(token: string): Promise<UserDocument | null> {
    return UserModel.findOne({ reset_token: token, reset_token_expires: { $gt: new Date() } });
  }

  async existsByUsernameOrEmail(username: string, email: string): Promise<boolean> {
    const found = await UserModel.findOne({ $or: [{ username }, { email }] });
    return found !== null;
  }

  async existsByUsernameOrEmailExcluding(
    excludeId: string,
    fields: { username?: string; email?: string },
  ): Promise<boolean> {
    const or = [];
    if (fields.username) or.push({ username: fields.username });
    if (fields.email) or.push({ email: fields.email });
    if (or.length === 0) return false;
    const found = await UserModel.findOne({ _id: { $ne: excludeId }, $or: or });
    return found !== null;
  }

  create(input: {
    username: string;
    email: string;
    passwordHash: string;
    role: string;
    nickname: string;
    avatarUrl?: string;
  }): Promise<UserDocument> {
    return UserModel.create({
      username: input.username,
      email: input.email,
      password_hash: input.passwordHash,
      role: input.role,
      nickname: input.nickname,
      avatar_url: input.avatarUrl ?? null,
    });
  }

  setResetToken(id: string, token: string, expires: Date): Promise<UserDocument | null> {
    return UserModel.findByIdAndUpdate(id, { $set: { reset_token: token, reset_token_expires: expires } });
  }

  resetPassword(id: string, passwordHash: string): Promise<UserDocument | null> {
    return UserModel.findByIdAndUpdate(id, {
      $set: { password_hash: passwordHash, reset_token: null, reset_token_expires: null },
    });
  }

  updateProfile(
    id: string,
    fields: Partial<{
      nickname: string;
      gender: string;
      date_of_birth: string;
      avatar_url: string;
      username: string;
      email: string;
    }>,
  ): Promise<UserDocument | null> {
    return UserModel.findByIdAndUpdate(id, { $set: fields }, { new: true });
  }
}

export const userRepository = new UserRepository();
