import type { AIAnalysis } from "./types";

type Inputs = {
  trade: {
    entry_price: number;
    exit_price: number;
    position_size: number;
    feeling: string | null;
    side?: "long" | "short" | null;
  };
  checklistScore?: number | null;
  missingCritical?: string[];
};

export function mockAnalyze({ trade, checklistScore, missingCritical }: Inputs): Omit<AIAnalysis, "id" | "trade_id" | "user_id" | "created_at"> {
  const pnl = (trade.side === "short"
    ? (trade.entry_price - trade.exit_price)
    : (trade.exit_price - trade.entry_price)) * (trade.position_size || 0);
  const base = checklistScore ?? 50;
  const penalty = Math.min(40, (missingCritical?.length || 0) * 10);
  const discipline_score = Math.max(1, Math.min(100, Math.round(base - penalty + (pnl >= 0 ? 10 : -5))));
  const emotional_state = trade.feeling || (discipline_score < 50 ? "Stressed" : "Calm");
  const mistakes_detected = missingCritical && missingCritical.length
    ? `Missing critical items: ${missingCritical.join(", ")}`
    : pnl < 0 && (checklistScore ?? 0) < 60
      ? "Low checklist adherence with negative P&L detected"
      : null;
  const suggestions = discipline_score < 60
    ? "Increase adherence to critical checklist items, reduce size, and wait for clearer setups."
    : "Maintain your process. Review R/R and journaling consistency.";

  return {
    discipline_score,
    emotional_state,
    mistakes_detected,
    suggestions,
  };
}


