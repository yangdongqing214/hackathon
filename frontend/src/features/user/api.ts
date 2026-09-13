import { apiClient } from "../../shared/api/client";
import type { User } from "../auth/types";

export const userApi = {
  updateProfile: (input: { nickname: string; gender?: string; dateOfBirth?: string }) =>
    apiClient.put<User>("/api/users/me", input),
  updateProfileForm: (form: FormData) => apiClient.putForm<User>("/api/users/me", form),
};
