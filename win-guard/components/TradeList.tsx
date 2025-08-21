"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export type TradeRow = {
  id: string;
  symbol: string;
  entry_price: number;
  exit_price: number;
  position_size: number;
  feeling: string | null;
  created_at?: string;
};

type Props = {
  trades: TradeRow[];
  onInlineSave?: (row: TradeRow) => Promise<void> | void;
};

export default function TradeList({ trades, onInlineSave }: Props) {
  const [symbol, setSymbol] = useState("");
  const [feeling, setFeeling] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [edit, setEdit] = useState<Partial<TradeRow>>({});

  const filtered = useMemo(() => {
    return trades.filter((t) => {
      if (symbol && !t.symbol.toLowerCase().includes(symbol.toLowerCase())) return false;
      if (feeling && t.feeling !== feeling) return false;
      if (dateFrom && t.created_at && new Date(t.created_at) < new Date(dateFrom)) return false;
      if (dateTo && t.created_at && new Date(t.created_at) > new Date(dateTo)) return false;
      return true;
    });
  }, [trades, symbol, feeling, dateFrom, dateTo]);

  const startEdit = (row: TradeRow) => {
    setEditId(row.id);
    setEdit(row);
  };
  const cancelEdit = () => {
    setEditId(null);
    setEdit({});
  };
  const saveEdit = async () => {
    if (!editId) return;
    const row = { ...(edit as TradeRow), id: editId };
    await onInlineSave?.(row);
    setEditId(null);
  };

  return (
    <div className="space-y-4">
      <form className="flex flex-wrap gap-2 items-end">
        <div>
          <label className="block text-xs mb-1">Symbol</label>
          <Input value={symbol} onChange={(e) => setSymbol(e.target.value)} placeholder="BTC" className="h-9" />
        </div>
        <div>
          <label className="block text-xs mb-1">Feeling</label>
          <Select value={feeling} onChange={(e) => setFeeling(e.target.value)} options={[{ label: "All", value: "" }, { label: "Neutral", value: "Neutral" }, { label: "Fear", value: "Fear" }, { label: "Greed", value: "Greed" }]} />
        </div>
        <div>
          <label className="block text-xs mb-1">From</label>
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-9" />
        </div>
        <div>
          <label className="block text-xs mb-1">To</label>
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-9" />
        </div>
        <Button type="button" variant="outline" onClick={() => { setSymbol(""); setFeeling(""); setDateFrom(""); setDateTo(""); }}>Reset</Button>
      </form>

      <div className="overflow-x-auto border rounded-md">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900/40">
            <tr>
              <th className="text-left p-3">Symbol</th>
              <th className="text-left p-3">Entry</th>
              <th className="text-left p-3">Exit</th>
              <th className="text-left p-3">Size</th>
              <th className="text-left p-3">Feeling</th>
              <th className="text-left p-3">Date</th>
              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr key={t.id} className="border-t">
                <td className="p-3">
                  {editId === t.id ? (
                    <Input value={edit.symbol || ""} onChange={(e) => setEdit({ ...edit, symbol: e.target.value })} className="h-9" />
                  ) : (
                    t.symbol
                  )}
                </td>
                <td className="p-3">
                  {editId === t.id ? (
                    <Input type="number" step="0.00000001" value={edit.entry_price as number} onChange={(e) => setEdit({ ...edit, entry_price: Number(e.target.value) })} className="h-9" />
                  ) : (
                    t.entry_price
                  )}
                </td>
                <td className="p-3">
                  {editId === t.id ? (
                    <Input type="number" step="0.00000001" value={edit.exit_price as number} onChange={(e) => setEdit({ ...edit, exit_price: Number(e.target.value) })} className="h-9" />
                  ) : (
                    t.exit_price
                  )}
                </td>
                <td className="p-3">
                  {editId === t.id ? (
                    <Input type="number" step="0.00000001" value={edit.position_size as number} onChange={(e) => setEdit({ ...edit, position_size: Number(e.target.value) })} className="h-9" />
                  ) : (
                    t.position_size
                  )}
                </td>
                <td className="p-3">
                  {editId === t.id ? (
                    <Select value={String(edit.feeling || "")} onChange={(e) => setEdit({ ...edit, feeling: e.target.value })} options={[{ label: "Neutral", value: "Neutral" }, { label: "Fear", value: "Fear" }, { label: "Greed", value: "Greed" }]} />
                  ) : (
                    t.feeling
                  )}
                </td>
                <td className="p-3">{t.created_at ? new Date(t.created_at).toLocaleDateString() : "-"}</td>
                <td className="p-3">
                  {editId === t.id ? (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={saveEdit}>Save</Button>
                      <Button size="sm" variant="outline" onClick={cancelEdit}>Cancel</Button>
                    </div>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => startEdit(t)}>Edit</Button>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-500">No trades</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


