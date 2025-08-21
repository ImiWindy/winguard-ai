"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "../../lib/supabase/server";
import { deleteScreenshot } from "../../lib/storage/upload";

export async function deleteTrade(formData: FormData) {
  const supabase = getSupabaseServerClient();
  if (!supabase) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const tradeId = String(formData.get("tradeId") || "").trim();
  const screenshotPath = String(formData.get("screenshotPath") || "").trim();
  if (!tradeId) return;

  const { error } = await supabase.from("trades").delete().eq("id", tradeId).eq("user_id", user.id);
  if (!error && screenshotPath) {
    await deleteScreenshot(supabase, screenshotPath);
  }
  revalidatePath("/trades");
}
