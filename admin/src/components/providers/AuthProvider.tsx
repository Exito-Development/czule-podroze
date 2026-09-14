"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ApiError,
  clearSession,
  login as apiLogin,
  logout as apiLogout,
  restoreSession,
  storedRefreshToken,
} from "@/lib/api/client";
import { me } from "@/lib/api/endpoints";
import type { AuthUserDto } from "@/lib/api/types";

const LOGIN_PATH = "/logowanie";

interface AuthValue {
  user: AuthUserDto | null;
  /** Trwa odtwarzanie sesji po odświeżeniu strony. */
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

/**
 * Sesja organizatorki.
 *
 * Token dostępowy żyje wyłącznie w pamięci, a po odświeżeniu strony
 * odtwarzamy go z tokenu odświeżającego. Dzięki temu w `localStorage` nie
 * leży nic, czym dałoby się od razu wołać API — a wygaśnięcie sesji jest
 * jednym miejscem, nie dwudziestoma.
 */
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUserDto | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;

    const restore = async () => {
      if (!storedRefreshToken()) {
        if (!cancelled) setLoading(false);
        return;
      }
      try {
        await restoreSession();
        const account = await me();
        if (!cancelled) setUser(account);
      } catch {
        clearSession();
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void restore();
    return () => {
      cancelled = true;
    };
  }, []);

  // Bez sesji wpuszczamy tylko na ekran logowania.
  useEffect(() => {
    if (loading) return;
    if (!user && pathname !== LOGIN_PATH) {
      router.replace(LOGIN_PATH);
    }
    if (user && pathname === LOGIN_PATH) {
      router.replace("/");
    }
  }, [loading, user, pathname, router]);

  const signIn = useCallback(async (email: string, password: string) => {
    const tokens = await apiLogin(email, password);
    if (tokens.user.role !== "ADMIN") {
      // Konto klientki nie ma czego szukać w panelu.
      clearSession();
      throw new ApiError(403, {
        code: "auth.notAdmin",
        message: "To konto nie ma dostępu do panelu organizatorek.",
      });
    }
    setUser(tokens.user);
  }, []);

  const signOut = useCallback(async () => {
    await apiLogout();
    setUser(null);
    router.replace(LOGIN_PATH);
  }, [router]);

  const value = useMemo<AuthValue>(
    () => ({ user, loading, signIn, signOut }),
    [user, loading, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth musi być użyte wewnątrz <AuthProvider>");
  return ctx;
}
