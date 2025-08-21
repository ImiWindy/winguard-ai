export type TradeFeeling = "Fear" | "Greed" | "Neutral";
export type TradeSide = "long" | "short";

export type Trade = {
  id: string;
  user_id: string;
  symbol: string;
  entry_price: number;
  exit_price: number;
  position_size: number;
  feeling: TradeFeeling;
  side: TradeSide;
  notes?: string | null;
  screenshot_url?: string | null;
  created_at: string;
  updated_at: string;
};
