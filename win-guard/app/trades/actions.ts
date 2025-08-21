"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "../../lib/supabase/server";
import { deleteScreenshot } from "../../lib/storage/upload";
import { Trade } from "../../lib/types";

export async function deleteTrade(formData: FormData) {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    // or handle error appropriately
    return;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    // or handle error
    return;
  }

  const tradeId = String(formData.get("tradeId") || "");
  const screenshotPath = String(formData.get("screenshotPath") || "");

  if (!tradeId) {
    // or handle error
    return;
  }

  // First, verify the user owns the trade they are trying to delete.
  const { data: trade, error: fetchError } = await supabase
    .from("trades")
    .select("id, user_id, screenshot_url")
    .eq("id", tradeId)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !trade) {
    // Handle case where trade doesn't exist or user doesn't own it
    // For security, we don't reveal which case it is.
    return;
  }

  // If we are here, the user is authorized. Proceed with deletion.
  const { error: deleteError } = await supabase
    .from("trades")
    .delete()
    .eq("id", tradeId);

  if (deleteError) {
    // Handle DB deletion error
    // Maybe redirect with an error message
    return;
  }

  // After successful DB deletion, delete the associated screenshot from storage.
  if (screenshotPath) {
    await deleteScreenshot(supabase, screenshotPath);
  }

  // Revalidate the trades page to show the updated list.
  revalidatePath("/trades");
}
