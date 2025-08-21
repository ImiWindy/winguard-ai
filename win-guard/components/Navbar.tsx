"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getSupabaseClient } from "@/utils/supabaseClient";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const supabase = getSupabaseClient();

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      router.replace("/");
    } catch {}
  };

  return (
    <nav className="w-full border-b dark:border-gray-800 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-bold">Win Guard</Link>
          <div className="hidden md:flex items-center gap-3 text-sm">
            <Link href="/">Landing</Link>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/trades/new">Add Trade</Link>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <Button variant="outline" onClick={logout}>Logout</Button>
        </div>
        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
          ☰
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t dark:border-gray-800 p-3 space-y-2 text-sm">
          <div className="flex flex-col gap-2">
            <Link href="/" onClick={() => setOpen(false)}>Landing</Link>
            <Link href="/dashboard" onClick={() => setOpen(false)}>Dashboard</Link>
            <Link href="/trades/new" onClick={() => setOpen(false)}>Add Trade</Link>
            <button onClick={logout} className="text-left">Logout</button>
          </div>
        </div>
      )}
    </nav>
  );
}


