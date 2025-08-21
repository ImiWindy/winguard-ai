import { nanoid } from "nanoid";
import type { SupabaseClient } from "@supabase/supabase-js";

export type UploadResult = { url: string | null; path: string | null };

export async function uploadScreenshot(
  supabase: SupabaseClient,
  userId: string,
  file: File
): Promise<UploadResult> {
  const arrayBuffer = await file.arrayBuffer();
  const ext = (file.name.split(".").pop() || "bin").toLowerCase();
  const path = `${userId}/${nanoid()}.${ext}`;
  const { error } = await supabase.storage
    .from("trade-screenshots")
    .upload(path, Buffer.from(arrayBuffer), {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || "application/octet-stream",
    });
  if (error) return { url: null, path: null };
  const { data } = supabase.storage.from("trade-screenshots").getPublicUrl(path);
  return { url: data.publicUrl || null, path };
}

export async function deleteScreenshot(
  supabase: SupabaseClient,
  path: string | null | undefined
) {
  if (!path) return;
  try {
    await supabase.storage.from("trade-screenshots").remove([path]);
  } catch {
    // ignore
  }
}


