import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { authApi } from "./api";
import type { User, LoginInput, RegisterInput } from "./types";

const REMEMBERED_IDENTIFIER_KEY = "app:rememberedIdentifier";

export function getRememberedIdentifier(): string {
  return localStorage.getItem(REMEMBERED_IDENTIFIER_KEY) ?? "";
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (input: LoginInput) => Promise<{ ok: true } | { ok: false; message: string }>;
  register: (input: RegisterInput) => Promise<{ ok: true } | { ok: false; message: string }>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function refresh(): Promise<void> {
    const res = await authApi.me();
    setUser(res.code === 0 ? res.data : null);
  }

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, []);

  async function login(input: LoginInput): ReturnType<AuthContextValue["login"]> {
    const res = await authApi.login(input);
    if (res.code !== 0) return { ok: false, message: res.message };
    if (input.rememberMe) localStorage.setItem(REMEMBERED_IDENTIFIER_KEY, input.identifier);
    else localStorage.removeItem(REMEMBERED_IDENTIFIER_KEY);
    setUser(res.data);
    return { ok: true };
  }

  async function register(input: RegisterInput): ReturnType<AuthContextValue["register"]> {
    const res = await authApi.register(input);
    if (res.code !== 0) return { ok: false, message: res.message };
    setUser(res.data);
    return { ok: true };
  }

  async function logout(): Promise<void> {
    await authApi.logout();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
