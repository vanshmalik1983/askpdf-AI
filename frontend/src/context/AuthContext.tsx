import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  ReactNode,
} from "react";
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
  register: (
    name: string,
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const USER_STORAGE_KEY = "askpdf_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const persistUser = (user: User) => {
    localStorage.setItem(
      USER_STORAGE_KEY,
      JSON.stringify(user)
    );
    setUser(user);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error(
          "Failed to parse stored user data:",
          error
        );
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    }

    setIsLoading(false);
  }, []);

  async function login(email: string, password: string) {
    const result = await api.login({ email, password });

    setTokens(result.accessToken, result.refreshToken);
    persistUser(result.user);
  }

  async function register(
    name: string,
    email: string,
    password: string
  ) {
    const result = await api.register({
      name,
      email,
      password,
    });

    setTokens(result.accessToken, result.refreshToken);
    persistUser(result.user);
  }

  async function logout() {
    try {
      await api.logout();
    } catch (error) {
      // Clear client-side session even if logout request fails.
      if (!(error instanceof ApiError)) throw error;
    } finally {
      clearTokens();
      localStorage.removeItem(USER_STORAGE_KEY);
      setUser(null);
    }
  }

  const value = useMemo(
    () => ({
      user,
      isLoading,
      login,
      register,
      logout,
    }),
    [user, isLoading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within an AuthProvider"
    );
  }

  return context;
}