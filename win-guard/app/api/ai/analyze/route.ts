import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { mockAnalyze } from "@/modules/aiAnalysis/logic";

export async function POST(req: Request) {
  const supabase = getSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "env" }, { status: 500 });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json();
  const tradeId = body?.tradeId as string;
  if (!tradeId) return NextResponse.json({ error: "tradeId required" }, { status: 400 });

  // Fetch trade and checklist info for this user
  const { data: trade, error: tradeErr } = await supabase
    .from("trades")
    .select("id, user_id, entry_price, exit_price, position_size, feeling, side, checklist_score")
    .eq("id", tradeId)
    .eq("user_id", user.id)
    .single();
  if (tradeErr || !trade) return NextResponse.json({ error: "trade not found" }, { status: 404 });

  const { data: resp } = await supabase
    .from("checklist_responses")
    .select("responses, missing_critical_items")
    .eq("trade_id", tradeId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const analysis = mockAnalyze({
    trade: {
      entry_price: trade.entry_price,
      exit_price: trade.exit_price,
      position_size: trade.position_size,
      feeling: trade.feeling,
      side: (trade.side as any) || null,
    },
    checklistScore: trade.checklist_score ?? null,
    missingCritical: (resp?.missing_critical_items as string[]) || [],
  });

  const { data: inserted, error } = await supabase
    .from("ai_analysis")
    .insert({
      user_id: user.id,
      trade_id: tradeId,
      discipline_score: analysis.discipline_score,
      emotional_state: analysis.emotional_state,
      mistakes_detected: analysis.mistakes_detected,
      suggestions: analysis.suggestions,
    })
    .select("id, trade_id, user_id, discipline_score, emotional_state, mistakes_detected, suggestions, created_at")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(inserted);
}

export async function GET(req: Request) {
  const supabase = getSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "env" }, { status: 500 });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const tradeId = url.searchParams.get("tradeId");

  const q = supabase
    .from("ai_analysis")
    .select("id, trade_id, user_id, discipline_score, emotional_state, mistakes_detected, suggestions, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1);

  const { data, error } = tradeId ? await q.eq("trade_id", tradeId) : await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data || data.length === 0) return new NextResponse(null, { status: 404 });
  return NextResponse.json(data[0]);
}



