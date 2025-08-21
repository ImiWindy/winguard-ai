import { computeChecklistScore, defaultTemplateItems } from "./scoring";

describe("computeChecklistScore", () => {
  it("returns 100 when all checked", () => {
    const items = defaultTemplateItems();
    const responses = items.map(i => ({ id: i.id, text: i.text, checked: true, critical: i.critical }));
    const { score, missingCritical } = computeChecklistScore(items, responses);
    expect(score).toBe(100);
    expect(missingCritical).toHaveLength(0);
  });

  it("computes partial score and missing criticals", () => {
    const items = defaultTemplateItems();
    const responses = items.map(i => ({ id: i.id, text: i.text, checked: false, critical: i.critical }));
    responses[0].checked = true; // only one checked
    const { score, missingCritical } = computeChecklistScore(items, responses);
    expect(score).toBe(Math.round((1 / items.length) * 100));
    expect(missingCritical.length).toBeGreaterThanOrEqual(1);
  });
});


