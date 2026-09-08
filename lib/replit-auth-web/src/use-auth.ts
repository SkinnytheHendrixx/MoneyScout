import { useCallback, useEffect, useState } from "react";
import type { AuthUser } from "@workspace/api-client-react";

export type { AuthUser };

interface AuthState {
  user: AuthUser | null;
  authorized: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

function getBasePath() {
  return window.location.pathname || "/";
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authorized, setAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/user", { credentials: "include" })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json() as Promise<{ user: AuthUser | null; authorized: boolean }>;
      })
      .then((data) => {
        if (!cancelled) {
          setUser(data.user ?? null);
          setAuthorized(data.authorized === true);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setUser(null);
          setAuthorized(false);
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(() => {
    const base = getBasePath();
    window.location.href = `/api/login?returnTo=${encodeURIComponent(base)}`;
  }, []);

  const logout = useCallback(() => {
    const base = getBasePath();
    window.location.href = `/api/logout?returnTo=${encodeURIComponent(base)}`;
  }, []);

  return {
    user,
    authorized,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
  };
}