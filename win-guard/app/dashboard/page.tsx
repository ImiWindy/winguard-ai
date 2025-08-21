import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "../../lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    // Missing envs, render a friendly message.
    return <p className="text-sm text-red-600">Supabase env vars تنظیم نشده‌اند.</p>;
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">داشبورد</h2>
      <p>خوش آمدید {user.email}</p>
    </div>
  );
}

