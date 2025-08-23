import { mockAnalyze } from "./logic";

describe("mockAnalyze", () => {
  it("rewards positive PnL and penalizes missing criticals", () => {
    const res = mockAnalyze({
      trade: { entry_price: 100, exit_price: 120, position_size: 1, feeling: "Calm", side: "long" },
      checklistScore: 80,
      missingCritical: ["Set Stop Loss?"],
    });
    expect(res.discipline_score).toBeGreaterThan(50);
    expect(res.mistakes_detected).toBeTruthy();
  });
});



