import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "../../lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function TradesListPage() {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return (
      <div className="max-w-md mx-auto py-12 text-sm text-red-600">Supabase env vars تنظیم نشده‌اند.</div>
    );
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: rows } = await supabase
    .from("trades")
    .select("id, symbol, entry_price, exit_price, position_size, feeling")
    .eq("user_id", user.id)
    .order("id", { ascending: false });

  return (
    <div className="py-8 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Trades</h2>
        <Link href="/trades/add" className="px-3 py-2 border rounded-md text-sm">Add Trade</Link>
      </div>
      <div className="overflow-x-auto border rounded-md">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900/40">
            <tr>
              <th className="text-left p-3">Symbol</th>
              <th className="text-left p-3">Entry</th>
              <th className="text-left p-3">Exit</th>
              <th className="text-left p-3">Size</th>
              <th className="text-left p-3">Feeling</th>
            </tr>
          </thead>
          <tbody>
            {(rows || []).map((t: any) => (
              <tr key={t.id} className="border-t">
                <td className="p-3">{t.symbol}</td>
                <td className="p-3">{t.entry_price}</td>
                <td className="p-3">{t.exit_price}</td>
                <td className="p-3">{t.position_size}</td>
                <td className="p-3">{t.feeling}</td>
              </tr>
            ))}
            {(!rows || rows.length === 0) && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-500">No trades yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


