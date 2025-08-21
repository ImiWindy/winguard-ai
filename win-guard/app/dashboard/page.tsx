import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "../../lib/supabase/server";

type Trade = {
  id: string;
  symbol: string;
  entry_price: number;
  exit_price: number;
  position_size: number;
  feeling: string | null;
  side?: 'long' | 'short';
  created_at?: string;
};

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

  const { data: trades } = await supabase
    .from("trades")
    .select("id, symbol, entry_price, exit_price, position_size, feeling, side, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  const list: Trade[] = (trades as any) || [];
  const pnlSeries = list.map((t) => {
    const isShort = (t.side || 'long') === 'short';
    const pnl = isShort
      ? (t.entry_price - t.exit_price) * t.position_size
      : (t.exit_price - t.entry_price) * t.position_size;
    return Number.isFinite(pnl) ? pnl : 0;
  });
  const cumulative = pnlSeries.reduce<number[]>((acc, v) => {
    const last = acc.length > 0 ? acc[acc.length - 1] : 0;
    acc.push(last + v);
    return acc;
  }, []);
  const totalPnl = cumulative.length ? cumulative[cumulative.length - 1] : 0;

  // Simple inline SVG chart
  const width = 320;
  const height = 120;
  const padding = 12;
  const minY = Math.min(0, ...cumulative);
  const maxY = Math.max(0, ...cumulative);
  const rangeY = maxY - minY || 1;
  const stepX = cumulative.length > 1 ? (width - padding * 2) / (cumulative.length - 1) : 0;
  const points = cumulative.map((y, i) => {
    const xPos = padding + i * stepX;
    const yPos = height - padding - ((y - minY) / rangeY) * (height - padding * 2);
    return `${xPos},${yPos}`;
  }).join(" ");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">داشبورد</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">خوش آمدید {user.email}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border rounded-md p-4">
          <div className="text-sm text-gray-500">Total P&L</div>
          <div className={`text-xl font-bold ${totalPnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>{totalPnl.toFixed(2)}</div>
        </div>
        <div className="md:col-span-2 border rounded-md p-4">
          <div className="text-sm text-gray-500 mb-2">P&L Over Time</div>
          <svg width={width} height={height} className="w-full h-auto">
            <rect x="0" y="0" width={width} height={height} fill="transparent" />
            {cumulative.length > 0 && (
              <polyline fill="none" stroke="#2563eb" strokeWidth="2" points={points} />
            )}
          </svg>
        </div>
      </div>

      <div className="border rounded-md overflow-x-auto">
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
            {list.slice(-10).reverse().map((t) => (
              <tr key={t.id} className="border-t">
                <td className="p-3">{t.symbol}</td>
                <td className="p-3">{t.entry_price}</td>
                <td className="p-3">{t.exit_price}</td>
                <td className="p-3">{t.position_size}</td>
                <td className="p-3">{t.feeling}</td>
                <td className="p-3">{t.created_at ? new Date(t.created_at).toLocaleDateString() : '-'}</td>
              </tr>
            ))}
            {list.length === 0 && (
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

