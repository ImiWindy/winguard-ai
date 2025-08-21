"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { analyzeTrade, fetchLatestAnalysis } from "../api";

type Props = {
  tradeId?: string;
};

export default function AIAnalysisCard({ tradeId }: Props) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [data, setData] = React.useState<any | null>(null);

  const load = React.useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetchLatestAnalysis(tradeId);
      setData(res);
    } catch (e: any) {
      setError(e?.message || "Failed to load analysis");
    } finally {
      setLoading(false);
    }
  }, [tradeId]);

  React.useEffect(() => { load(); }, [load]);

  const run = async () => {
    if (!tradeId) return;
    setError(null);
    setLoading(true);
    try {
      const res = await analyzeTrade(tradeId);
      setData(res);
    } catch (e: any) {
      setError(e?.message || "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const score = data?.discipline_score as number | undefined;
  const scoreColor = typeof score === "number" ? (score >= 70 ? "text-green-600" : score >= 40 ? "text-yellow-600" : "text-red-600") : "";

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>AI Analysis</span>
          <div className="flex gap-2">
            <Button variant="outline" onClick={load} disabled={loading}>Refresh</Button>
            {tradeId && <Button onClick={run} disabled={loading}>Re-run</Button>}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading && <p className="text-sm">Loading...</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {!loading && !error && (
          data ? (
            <div className="space-y-2 text-sm">
              <div>Discipline Score: <span className={`font-semibold ${scoreColor}`}>{data.discipline_score}%</span></div>
              {data.emotional_state && <div>Emotional: {data.emotional_state}</div>}
              {data.mistakes_detected && <div className="text-red-600">Mistakes: {data.mistakes_detected}</div>}
              {data.suggestions && <div className="text-gray-700 dark:text-gray-300">Suggestions: {data.suggestions}</div>}
              <div className="text-xs text-gray-500">Updated: {new Date(data.created_at).toLocaleString()}</div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No analysis yet.</p>
          )
        )}
      </CardContent>
    </Card>
  );
}


