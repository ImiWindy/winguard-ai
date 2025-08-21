"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { getSupabaseClient } from "@/utils/supabaseClient";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const supabase = getSupabaseClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) return setError(error.message);
    router.push("/dashboard");
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <h2 className="text-2xl font-bold mb-6">ثبت‌نام</h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <input
          className="w-full border rounded-md px-3 py-2"
          type="email"
          placeholder="ایمیل"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="w-full border rounded-md px-3 py-2"
          type="password"
          placeholder="رمز عبور"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          disabled={loading || !supabase}
          className="w-full px-4 py-2 rounded-md bg-black text-white dark:bg-white dark:text-black"
        >
          {loading ? "در حال ثبت‌نام..." : "ثبت‌نام"}
        </button>
      </form>
      <p className="text-sm mt-4 text-center">
        حساب دارید؟ <a className="underline" href="/auth">ورود</a>
      </p>
    </div>
  );
}

