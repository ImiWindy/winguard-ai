import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "../../lib/supabase/server";
import { headers } from "next/headers";

function normalizeStr(v: unknown): string | undefined {
  const s = String(v || "").trim();
  return s.length ? s : undefined;
}

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
  if (!user) redirect("/auth");

  // read URL search params from headers
  const h = headers();
  const host = h.get("x-forwarded-host") || h.get("host") || "localhost:3000";
  const proto = h.get("x-forwarded-proto") || "http";
  const path = h.get("x-invoke-path") || "/trades";
  const qs = h.get("x-invoke-query") || "";
  const url = new URL(`${proto}://${host}${path}${qs ? `?${qs}` : ''}`);
  const symbolParam = normalizeStr(url.searchParams.get("symbol"));
  const feelingParam = normalizeStr(url.searchParams.get("feeling"));

  let query = supabase
    .from("trades")
    .select("id, symbol, entry_price, exit_price, position_size, feeling, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  if (symbolParam) query = query.ilike("symbol", `%${symbolParam}%`);
  if (feelingParam) query = query.eq("feeling", feelingParam);
  // pagination
  const pageSize = 20;
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data: rows } = await query.range(from, to);

  return (
    <div className="py-8 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Trades</h2>
        <Link href="/trades/new" className="px-3 py-2 border rounded-md text-sm">Add Trade</Link>
      </div>
      <form className="flex flex-wrap gap-2 items-end">
        <div>
          <label className="block text-xs mb-1">Symbol</label>
          <input name="symbol" className="border rounded-md px-3 py-1 text-sm" placeholder="BTC" defaultValue={symbolParam} />
        </div>
        <div>
          <label className="block text-xs mb-1">Feeling</label>
          <select name="feeling" className="border rounded-md px-3 py-1 text-sm" defaultValue={feelingParam}>
            <option value="">All</option>
            <option value="Neutral">Neutral</option>
            <option value="Fear">Fear</option>
            <option value="Greed">Greed</option>
          </select>
        </div>
        <button className="px-3 py-1 border rounded-md text-sm">Apply</button>
      </form>
      <div className="overflow-x-auto border rounded-md mt-4">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900/40">
            <tr>
              <th className="text-left p-3">Symbol</th>
              <th className="text-left p-3">Entry</th>
              <th className="text-left p-3">Exit</th>
              <th className="text-left p-3">Size</th>
              <th className="text-left p-3">Feeling</th>
              <th className="text-left p-3">Date</th>
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
                <td className="p-3">{t.created_at ? new Date(t.created_at).toLocaleDateString() : '-'}</td>
              </tr>
            ))}
            {(!rows || rows.length === 0) && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500">No trades yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


