import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { defaultTemplateItems } from "@/modules/checklist/scoring";

export async function GET() {
  const supabase = getSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "env" }, { status: 500 });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  // get latest active template or create default version 1
  const { data: rows } = await supabase
    .from("checklist_templates")
    .select("id, user_id, version, title, items, is_active, created_at")
    .eq("user_id", user.id)
    .order("version", { ascending: false })
    .limit(1);

  if (rows && rows.length > 0) return NextResponse.json(rows[0]);

  const defaultItems = defaultTemplateItems();
  const { data: inserted, error } = await supabase
    .from("checklist_templates")
    .insert({ user_id: user.id, version: 1, title: "Default", items: defaultItems, is_active: true })
    .select("id, user_id, version, title, items, is_active, created_at")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(inserted);
}

export async function POST(req: Request) {
  const supabase = getSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "env" }, { status: 500 });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json();
  const items = body.items;
  const title = body.title || "Custom";
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "invalid items" }, { status: 400 });
  }
  // new version number
  const { data: maxRow } = await supabase
    .from("checklist_templates")
    .select("version")
    .eq("user_id", user.id)
    .order("version", { ascending: false })
    .limit(1)
    .single();
  const nextVersion = (maxRow?.version || 0) + 1;

  const { data: inserted, error } = await supabase
    .from("checklist_templates")
    .insert({ user_id: user.id, version: nextVersion, title, items, is_active: true })
    .select("id, user_id, version, title, items, is_active, created_at")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(inserted);
}


