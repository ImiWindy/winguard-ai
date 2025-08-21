import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = getSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "env" }, { status: 500 });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json();
  const { tradeId, payload } = body || {};
  if (!tradeId || !payload) return NextResponse.json({ error: "invalid payload" }, { status: 400 });

  const { templateVersion, responses, score, missingCriticalItems } = payload;
  if (typeof templateVersion !== "number" || !Array.isArray(responses) || typeof score !== "number") {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("checklist_responses")
    .insert({
      user_id: user.id,
      trade_id: tradeId,
      template_version: templateVersion,
      responses,
      score,
      missing_critical_items: missingCriticalItems || [],
    })
    .select("id")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id });
}


