import type { ChecklistItem, ChecklistResponseItem } from "./types";

export function computeChecklistScore(items: ChecklistItem[], responses: ChecklistResponseItem[]): { score: number; missingCritical: string[] } {
  if (items.length === 0) return { score: 100, missingCritical: [] };
  const byId = new Map<string, ChecklistResponseItem>(responses.map(r => [r.id, r]));
  let checkedCount = 0;
  const missingCritical: string[] = [];
  for (const item of items) {
    const r = byId.get(item.id);
    const checked = !!r?.checked;
    if (checked) checkedCount += 1;
    if (item.critical && !checked) missingCritical.push(item.text);
  }
  const score = Math.round((checkedCount / items.length) * 100);
  return { score, missingCritical };
}

export function defaultTemplateItems(): ChecklistItem[] {
  return [
    { id: "stop-loss", text: "Set Stop Loss?", critical: true },
    { id: "rr", text: "Risk/Reward > 1:2?", critical: true },
    { id: "strategy", text: "Aligned with strategy?" },
    { id: "emotion", text: "Emotional state stable?" },
  ];
}


