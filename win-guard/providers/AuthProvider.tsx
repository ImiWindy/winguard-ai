"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Session, SupabaseClient, User } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/utils/supabaseClient";
import { usePathname, useRouter } from "next/navigation";

export type AuthContextValue = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  supabase: SupabaseClient;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children, protectedRoutes = ["/dashboard"], publicRoutes = ["/auth/login", "/auth/signup"] }: {
  children: React.ReactNode;
  protectedRoutes?: string[];
  publicRoutes?: string[];
}) {
  const supabase = useMemo(() => getSupabaseClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const mountedRef = useRef(true);

  const checkAndRedirect = useCallback((currentPath: string, currentUser: User | null) => {
    if (shouldProtectRoute(currentPath, protectedRoutes) && !currentUser) {
      const loginPath = publicRoutes[0] ?? "/auth/login";
      router.replace(`${loginPath}?redirectTo=${encodeURIComponent(currentPath)}`);
      return;
    }
    if (currentUser && isPublicAuthRoute(currentPath, publicRoutes)) {
      router.replace("/");
    }
  }, [protectedRoutes, publicRoutes, router]);

  useEffect(() => {
    mountedRef.current = true;
    const init = async () => {
      const { data: sessionResp } = await supabase.auth.getSession();
      if (!mountedRef.current) return;
      setSession(sessionResp.session);
      const initialUser = sessionResp.session?.user ?? null;
      setUser(initialUser);
      setLoading(false);
      checkAndRedirect(pathname, initialUser);
    };
    init();

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!mountedRef.current) return;
      setSession(newSession);
      const newUser = newSession?.user ?? null;
      setUser(newUser);
      checkAndRedirect(pathname, newUser);
    });

    return () => {
      mountedRef.current = false;
      subscription.subscription.unsubscribe();
    };
  }, [checkAndRedirect, pathname, supabase]);

  useEffect(() => {
    if (loading) return;
    checkAndRedirect(pathname, user);
  }, [pathname, user, loading, checkAndRedirect]);

  const value = useMemo<AuthContextValue>(() => ({ user, session, loading, supabase }), [user, session, loading, supabase]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
}

// Pure helpers for testability
export function shouldProtectRoute(path: string, protectedRoutes: string[]): boolean {
  return protectedRoutes.some((route) => matchPathPrefix(path, route));
}

export function isPublicAuthRoute(path: string, publicRoutes: string[]): boolean {
  return publicRoutes.some((route) => matchPathPrefix(path, route));
}

export function matchPathPrefix(path: string, prefix: string): boolean {
  if (!prefix || prefix === "/") return path === "/";
  return path === prefix || path.startsWith(`${prefix}/`);
}


