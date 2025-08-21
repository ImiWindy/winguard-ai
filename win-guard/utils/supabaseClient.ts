"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let browserSupabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (browserSupabaseClient) return browserSupabaseClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables"
    );
  }

  browserSupabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  return browserSupabaseClient;
}

export type { SupabaseClient };


