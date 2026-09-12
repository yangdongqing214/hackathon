export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  nickname: string;
  avatarUrl: string | null;
  gender: string | null;
  dateOfBirth: string | null;
}

export interface LoginInput {
  identifier: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
  role: string;
  nickname: string;
  avatarFile: File | null;
}
