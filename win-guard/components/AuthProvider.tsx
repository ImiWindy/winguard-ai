"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type AuthContextValue = {
  supabase: SupabaseClient | null;
  user: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextValue>({ supabase: null, user: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const client = useMemo(() => getSupabaseBrowserClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!client) {
        if (mounted) setLoading(false);
        return;
      }
      const { data } = await client.auth.getUser();
      if (!mounted) return;
      setUser(data.user ?? null);
      setLoading(false);
    };
    load();
    const { data: sub } = client?.auth.onAuthStateChange(() => load()) || { data: { subscription: { unsubscribe() {} } } } as any;
    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, [client]);

  const value = useMemo(() => ({ supabase: client, user, loading }), [client, user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}


