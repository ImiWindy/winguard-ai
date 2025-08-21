"use client";

import type { ChecklistTemplate, ChecklistResponsePayload } from "./types";

export async function fetchActiveTemplate(): Promise<ChecklistTemplate> {
  const res = await fetch("/api/checklist/template", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to load checklist template");
  return res.json();
}

export async function saveTemplate(items: ChecklistTemplate["items"], title?: string): Promise<ChecklistTemplate> {
  const res = await fetch("/api/checklist/template", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items, title }),
  });
  if (!res.ok) throw new Error("Failed to save checklist template");
  return res.json();
}

export async function saveResponse(tradeId: string, payload: ChecklistResponsePayload): Promise<{ id: string }> {
  const res = await fetch("/api/checklist/responses", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tradeId, payload }),
  });
  if (!res.ok) throw new Error("Failed to save checklist response");
  return res.json();
}


