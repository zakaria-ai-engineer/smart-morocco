import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { loginUser, registerUser, setAccessToken } from "../services/api";
import type { User } from "../types";

interface AuthContextValue {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName?: string) => Promise<void>;
  logout: () => void;
}

const TOKEN_KEY = "smart-morocco-token";
const USER_KEY = "smart-morocco-user";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function readUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(readToken);
  const [user, setUser] = useState<User | null>(readUser);

  // Sync the axios interceptor with whatever token is persisted on mount
  useEffect(() => {
    const stored = readToken();
    if (stored) setAccessToken(stored);
  }, []);

  const persistAuth = (nextToken: string, nextUser: User) => {
    setTokenState(nextToken);
    setUser(nextUser);
    setAccessToken(nextToken);
    localStorage.setItem(TOKEN_KEY, nextToken);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      login: async (email: string, password: string) => {
        const tokenResp = await loginUser(email, password);
        // After login we don't have full_name from /auth/login — keep whatever is cached
        const cached = readUser();
        persistAuth(tokenResp.access_token, { id: "me", email, full_name: cached?.full_name ?? null });
      },
      register: async (email: string, password: string, fullName?: string) => {
        const created = await registerUser(email, password, fullName);
        const tokenResp = await loginUser(email, password);
        persistAuth(tokenResp.access_token, {
          id: created.id,
          email: created.email,
          full_name: created.full_name ?? fullName ?? null,
        });
      },
      logout: () => {
        setTokenState(null);
        setUser(null);
        setAccessToken(null);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      },
    }),
    [token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider.");
  return ctx;
}
