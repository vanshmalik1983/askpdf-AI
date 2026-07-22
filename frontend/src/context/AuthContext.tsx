import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api, setTokens, clearTokens, ApiError } from "@/lib/api";

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const USER_STORAGE_KEY = "askpdf_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  async function login(email: string, password: string) {
    const result = await api.login({ email, password });
    setTokens(result.accessToken, result.refreshToken);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(result.user));
    setUser(result.user);
  }

  async function register(name: string, email: string, password: string) {
    const result = await api.register({ name, email, password });
    setTokens(result.accessToken, result.refreshToken);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(result.user));
    setUser(result.user);
  }

  async function logout() {
    try {
      await api.logout();
    } catch (err) {
      // Even if the server call fails (e.g. token already expired),
      // the client-side session should still end cleanly.
      if (!(err instanceof ApiError)) throw err;
    } finally {
      clearTokens();
      localStorage.removeItem(USER_STORAGE_KEY);
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
