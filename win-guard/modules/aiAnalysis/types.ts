export type AIAnalysis = {
  id: string;
  trade_id: string;
  user_id: string;
  discipline_score: number;
  emotional_state: string | null;
  mistakes_detected: string | null;
  suggestions: string | null;
  created_at: string;
};

export type AnalyzeInput = {
  tradeId: string;
};

export type AnalyzeOutput = AIAnalysis;


