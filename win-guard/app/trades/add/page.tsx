import { redirect } from "next/navigation";
import { Buffer } from "node:buffer";
import { getSupabaseServerClient } from "../../../lib/supabase/server";
import { uploadScreenshot, deleteScreenshot } from "../../../lib/storage/upload";

export const dynamic = "force-dynamic";

async function addTrade(formData: FormData) {
  "use server";

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    redirect("/auth/login");
  }

  const {
    data: { user },
  } = await supabase!.auth.getUser();
  if (!user) redirect("/auth/login");

  const symbol = String(formData.get("symbol") || "").trim();
  const entryPrice = parseFloat(String(formData.get("entryPrice") || ""));
  const exitPrice = parseFloat(String(formData.get("exitPrice") || ""));
  const positionSize = parseFloat(String(formData.get("positionSize") || ""));
  const feeling = String(formData.get("feeling") || "Neutral");
  const notes = String(formData.get("notes") || "").trim();
  const side = String(formData.get("side") || "long").toLowerCase();
  const screenshotFile = formData.get("screenshot") as File | null;

  if (!symbol || Number.isNaN(entryPrice) || Number.isNaN(exitPrice) || Number.isNaN(positionSize) || (side !== "long" && side !== "short")) {
    redirect("/trades/add?error=validation");
  }
  // Upload screenshot first (if present)
  let uploadedPath: string | null = null;
  let screenshotUrl: string | null = null;
  if (screenshotFile && screenshotFile.size > 0) {
    try {
      const res = await uploadScreenshot(supabase!, user.id, screenshotFile);
      screenshotUrl = res.url;
      uploadedPath = res.path;
    } catch {}
  }

  try {
    await supabase!
      .from("trades")
      .insert({
        user_id: user.id,
        symbol,
        entry_price: entryPrice,
        exit_price: exitPrice,
        position_size: positionSize,
        feeling,
        side,
        notes: notes && notes.length > 0 ? notes : null,
        screenshot_url: screenshotUrl,
      });
  } catch (e) {
    // Cleanup uploaded file if DB insert failed
    await deleteScreenshot(supabase!, uploadedPath);
    redirect("/trades/add?error=insert_failed");
  }

  redirect("/trades");
}

export default async function AddTradePage() {
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

  return (
    <div className="max-w-xl mx-auto py-12">
      <h2 className="text-2xl font-bold mb-6">Add Trade</h2>
      <form action={addTrade} className="grid gap-4" encType="multipart/form-data">
        <div>
          <label className="block text-sm mb-1">Symbol</label>
          <input name="symbol" className="w-full border rounded-md px-3 py-2" placeholder="e.g. BTCUSDT" required />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm mb-1">Entry Price</label>
            <input name="entryPrice" type="number" step="0.00000001" className="w-full border rounded-md px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm mb-1">Exit Price</label>
            <input name="exitPrice" type="number" step="0.00000001" className="w-full border rounded-md px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm mb-1">Position Size</label>
            <input name="positionSize" type="number" step="0.00000001" className="w-full border rounded-md px-3 py-2" required />
          </div>
        </div>
        <div>
          <label className="block text-sm mb-1">Feeling</label>
          <select name="feeling" className="w-full border rounded-md px-3 py-2">
            <option value="Neutral">Neutral</option>
            <option value="Fear">Fear</option>
            <option value="Greed">Greed</option>
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Side</label>
          <select name="side" className="w-full border rounded-md px-3 py-2">
            <option value="long">Long</option>
            <option value="short">Short</option>
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Notes (optional)</label>
          <textarea name="notes" rows={3} className="w-full border rounded-md px-3 py-2" placeholder="..." />
        </div>
        <div>
          <label className="block text-sm mb-1">Screenshot (optional)</label>
          <input name="screenshot" type="file" accept="image/*" className="w-full border rounded-md px-3 py-2" />
        </div>
        <button className="px-4 py-2 rounded-md bg-black text-white dark:bg-white dark:text-black">Save</button>
      </form>
    </div>
  );
}


