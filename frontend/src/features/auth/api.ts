import { apiClient } from "../../shared/api/client";
import type { User, LoginInput, RegisterInput } from "./types";

export const authApi = {
  me: () => apiClient.get<User | null>("/api/auth/me"),
  login: (input: LoginInput) => apiClient.post<User>("/api/auth/login", input),
  register: (input: RegisterInput) => {
    const form = new FormData();
    form.append("username", input.username);
    form.append("email", input.email);
    form.append("password", input.password);
    form.append("role", input.role);
    form.append("nickname", input.nickname);
    if (input.avatarFile) form.append("avatar", input.avatarFile);
    return apiClient.postForm<User>("/api/auth/register", form);
  },
  logout: () => apiClient.post<null>("/api/auth/logout"),
  forgotPassword: (identifier: string) => apiClient.post<{ devResetToken: string | null }>("/api/auth/forgot-password", { identifier }),
  resetPassword: (token: string, password: string) => apiClient.post<null>("/api/auth/reset-password", { token, password }),
};
