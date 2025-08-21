"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { getSupabaseClient } from "@/utils/supabaseClient";

export default function AuthIndexPage() {
  const router = useRouter();
  const supabase = getSupabaseClient();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
      }
      router.replace("/dashboard");
    } catch (err: any) {
      setError(err?.message || "خطا رخ داد");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <h2 className="text-2xl font-bold mb-6 text-center">ورود / ثبت‌نام</h2>
      <Tabs
        tabs={[{ value: "login", label: "ورود" }, { value: "signup", label: "ثبت‌نام" }]}
        initial={mode}
        onChange={(v) => setMode((v as any) || "login")}
        className="mb-6"
      />
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">ایمیل</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="password">رمز عبور</Label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button disabled={loading} className="w-full">{loading ? "در حال ارسال..." : mode === "login" ? "ورود" : "ثبت‌نام"}</Button>
      </form>
    </div>
  );
}


