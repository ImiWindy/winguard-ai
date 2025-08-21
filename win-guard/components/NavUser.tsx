"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function NavUser() {
  const supabase = getSupabaseBrowserClient();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!supabase) return;
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
      setEmail(data.user?.email ?? null);
    };
    load();
    const { data: sub } = supabase ? supabase.auth.onAuthStateChange(() => load()) : { data: { subscription: { unsubscribe: () => {} } } } as any;
    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe();
    };
  }, [supabase]);

  const onLogout = async () => {
    try {
      await fetch("/api/auth/signout", { method: "POST" });
      setEmail(null);
      window.location.href = "/";
    } catch {}
  };

  if (!email) {
    return (
      <div className="flex items-center gap-3">
        <Link href="/auth/login">Login</Link>
        <Link href="/auth/signup">Sign Up</Link>
      </div>
    );
  }

  return (
    <button onClick={onLogout} className="text-red-600">
      Logout
    </button>
  );
}

