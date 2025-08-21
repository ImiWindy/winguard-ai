"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { fetchActiveTemplate, saveTemplate } from "@/modules/checklist/api";
import type { ChecklistItem } from "@/modules/checklist/types";

export default function ChecklistSettingsPage() {
  const [title, setTitle] = useState("Default");
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const t = await fetchActiveTemplate();
        setTitle(t.title || "Default");
        setItems(t.items);
      } catch (e: any) {
        setError(e?.message || "failed");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const addItem = () => setItems((it) => [...it, { id: crypto.randomUUID(), text: "", critical: false }]);
  const removeItem = (id: string) => setItems((it) => it.filter((x) => x.id !== id));
  const updateItem = (id: string, patch: Partial<ChecklistItem>) => setItems((it) => it.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  const onSave = async () => {
    setError(null);
    try {
      const saved = await saveTemplate(items, title);
      setTitle(saved.title || title);
      setItems(saved.items);
      alert("Template saved (new version created)");
    } catch (e: any) {
      setError(e?.message || "failed");
    }
  };

  if (loading) return <div className="p-6 text-sm">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto py-12 space-y-6">
      <h2 className="text-2xl font-bold">Checklist Template</h2>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div>
        <Label htmlFor="title">Title</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className="space-y-3">
        {items.map((it) => (
          <div key={it.id} className="border rounded-md p-3">
            <div className="flex gap-2 items-center">
              <input type="checkbox" checked={!!it.critical} onChange={(e) => updateItem(it.id, { critical: e.target.checked })} />
              <Input value={it.text} onChange={(e) => updateItem(it.id, { text: e.target.value })} placeholder="Checklist item text" />
              <Button variant="outline" onClick={() => removeItem(it.id)}>Remove</Button>
            </div>
          </div>
        ))}
        <Button variant="outline" onClick={addItem}>Add Item</Button>
      </div>
      <div className="flex justify-end">
        <Button onClick={onSave}>Save New Version</Button>
      </div>
    </div>
  );
}


