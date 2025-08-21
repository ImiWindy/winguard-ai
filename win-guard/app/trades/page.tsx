import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "../../lib/supabase/server";
import { Trade } from "../../lib/types";
import { deleteTrade } from "./actions";

function normalizeStr(v: unknown): string | undefined {
  const s = String(v || "").trim();
  return s.length ? s : undefined;
}

function calculatePnl(trade: Trade): number {
  const diff = trade.side === 'long'
    ? trade.exit_price - trade.entry_price
    : trade.entry_price - trade.exit_price;
  return diff * trade.position_size;
}

function getScreenshotPath(url: string | null | undefined): string {
  if (!url) return "";
  try {
    const urlObj = new URL(url);
    // Path is usually /public/bucket-name/path/to/file.ext
    // We want to extract the part after the bucket name.
    const parts = urlObj.pathname.split("/trade-screenshots/");
    return parts[1] || "";
  } catch {
    return "";
  }
}

export const dynamic = "force-dynamic";

export default async function TradesListPage({
  searchParams,
}: {
  searchParams: { symbol?: string; feeling?: string; page?: string; date_from?: string; date_to?: string };
}) {
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

  const symbolParam = normalizeStr(searchParams.symbol);
  const feelingParam = normalizeStr(searchParams.feeling);
  const dateFromParam = normalizeStr(searchParams.date_from);
  const dateToParam = normalizeStr(searchParams.date_to);

  let query = supabase
    .from("trades")
    .select("*, side") // fetch side for P/L calculation
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  if (symbolParam) query = query.ilike("symbol", `%${symbolParam}%`);
  if (feelingParam) query = query.eq("feeling", feelingParam);
  if (dateFromParam) query = query.gte("created_at", new Date(`${dateFromParam}T00:00:00.000Z`).toISOString());
  if (dateToParam) query = query.lte("created_at", new Date(`${dateToParam}T23:59:59.999Z`).toISOString());
  // pagination
  const pageSize = 20;
  const page = Math.max(1, parseInt(searchParams.page || "1", 10));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data: rows } = await query.range(from, to);
  const trades: Trade[] = (rows || []).map(r => ({...r, screenshot_url: r.screenshot_url || null}));

  return (
    <div className="py-8 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Trades</h2>
        <Link href="/trades/add" className="px-3 py-2 border rounded-md text-sm">Add Trade</Link>
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
        <div>
          <label className="block text-xs mb-1">From</label>
          <input name="date_from" type="date" className="border rounded-md px-3 py-1 text-sm" defaultValue={dateFromParam} />
        </div>
        <div>
          <label className="block text-xs mb-1">To</label>
          <input name="date_to" type="date" className="border rounded-md px-3 py-1 text-sm" defaultValue={dateToParam} />
        </div>
        <button className="px-3 py-1 border rounded-md text-sm">Apply</button>
      </form>
      <div className="overflow-x-auto border rounded-md mt-4">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900/40">
            <tr>
              <th className="text-left p-3">Symbol</th>
              <th className="text-left p-3">P/L</th>
              <th className="text-left p-3">Entry</th>
              <th className="text-left p-3">Exit</th>
              <th className="text-left p-3">Size</th>
              <th className="text-left p-3">Feeling</th>
              <th className="text-left p-3">Date</th>
              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((t) => {
              const pnl = calculatePnl(t);
              const pnlColor = pnl > 0 ? "text-green-500" : pnl < 0 ? "text-red-500" : "";
              const screenshotPath = getScreenshotPath(t.screenshot_url);
              return (
                <tr key={t.id} className="border-t">
                  <td className="p-3 font-mono">{t.symbol}</td>
                  <td className={`p-3 font-mono ${pnlColor}`}>{pnl.toFixed(2)}</td>
                  <td className="p-3">{t.entry_price}</td>
                  <td className="p-3">{t.exit_price}</td>
                  <td className="p-3">{t.position_size}</td>
                  <td className="p-3">{t.feeling}</td>
                  <td className="p-3">{t.created_at ? new Date(t.created_at).toLocaleDateString() : '-'}</td>
                  <td className="p-3">
                    <form action={deleteTrade}>
                      <input type="hidden" name="tradeId" value={t.id} />
                      <input type="hidden" name="screenshotPath" value={screenshotPath} />
                      <button type="submit" className="text-red-500 hover:underline">Delete</button>
                    </form>
                  </td>
                </tr>
              );
            })}
            {(trades.length === 0) && (
              <tr>
                <td colSpan={8} className="p-6 text-center text-gray-500">No trades yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


