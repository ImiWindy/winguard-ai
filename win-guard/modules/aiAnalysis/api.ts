"use client";

import type { AnalyzeOutput } from "./types";

export async function analyzeTrade(tradeId: string): Promise<AnalyzeOutput> {
  const res = await fetch("/api/ai/analyze", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tradeId }),
  });
  if (!res.ok) throw new Error("Analysis failed");
  return res.json();
}

export async function fetchLatestAnalysis(tradeId?: string): Promise<AnalyzeOutput | null> {
  const url = tradeId ? `/api/ai/analyze?tradeId=${encodeURIComponent(tradeId)}` : "/api/ai/analyze";
  const res = await fetch(url, { credentials: "include" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch analysis");
  return res.json();
}



