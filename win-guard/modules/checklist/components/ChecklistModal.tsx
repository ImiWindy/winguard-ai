"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ChecklistItem, ChecklistResponseItem, ChecklistResponsePayload } from "../types";
import { computeChecklistScore } from "../scoring";

type Props = {
  open: boolean;
  onClose: () => void;
  items: ChecklistItem[];
  templateVersion: number;
  onConfirm: (payload: ChecklistResponsePayload) => void;
};

export function ChecklistModal({ open, onClose, items, templateVersion, onConfirm }: Props) {
  const [responses, setResponses] = React.useState<Record<string, ChecklistResponseItem>>({});
  const values = Object.values(responses);
  const { score, missingCritical } = computeChecklistScore(items, values);
  const lowScore = score < 60;

  React.useEffect(() => {
    if (!open) setResponses({});
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-md bg-white dark:bg-gray-900 border dark:border-gray-800 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Pre-Trade Checklist</h3>
          <button onClick={onClose} className="text-sm text-gray-500">Close</button>
        </div>
        <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
          {items.map((it) => {
            const r = responses[it.id] || { id: it.id, text: it.text, checked: false, critical: it.critical };
            return (
              <div key={it.id} className="border rounded-md p-3">
                <label className="flex items-start gap-3">
                  <input type="checkbox" checked={!!r.checked} onChange={(e) => setResponses((s) => ({ ...s, [it.id]: { ...r, checked: e.target.checked } }))} />
                  <span className="font-medium">
                    {it.text} {it.critical && <span className="text-red-600 text-xs align-middle">(critical)</span>}
                  </span>
                </label>
                <div className="mt-2">
                  <Label className="text-xs" htmlFor={`note-${it.id}`}>Note (optional)</Label>
                  <Input id={`note-${it.id}`} value={r.note || ""} onChange={(e) => setResponses((s) => ({ ...s, [it.id]: { ...r, note: e.target.value } }))} />
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm">Score: <span className={`${lowScore ? "text-red-600" : "text-green-600"}`}>{score}%</span></div>
          {lowScore && <div className="text-xs text-red-600">Score below 60%. Proceed with caution.</div>}
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onConfirm({ templateVersion, responses: Object.values(responses), score, missingCriticalItems: missingCritical })}>Confirm</Button>
        </div>
      </div>
    </div>
  );
}


