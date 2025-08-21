"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const schema = z.object({
  symbol: z.string().min(1, "Required").max(20),
  entry_price: z.coerce.number().positive(),
  exit_price: z.coerce.number().positive(),
  position_size: z.coerce.number().positive(),
  feeling: z.enum(["Neutral", "Fear", "Greed"]).default("Neutral"),
  notes: z.string().max(1000).optional().or(z.literal("")),
  screenshot: z.any().optional(),
});

export type TradeFormValues = z.infer<typeof schema>;

type Props = {
  defaultValues?: Partial<TradeFormValues>;
  onSubmit: (values: TradeFormValues) => Promise<void> | void;
  submittingText?: string;
};

export default function TradeForm({ defaultValues, onSubmit, submittingText = "Saving..." }: Props) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<TradeFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      symbol: "",
      entry_price: undefined as unknown as number,
      exit_price: undefined as unknown as number,
      position_size: undefined as unknown as number,
      feeling: "Neutral",
      notes: "",
      ...defaultValues,
    },
  });

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label className="block text-sm mb-1">Symbol</label>
        <Input {...register("symbol")} placeholder="e.g. BTCUSDT" />
        {errors.symbol && <p className="text-xs text-red-600 mt-1">{errors.symbol.message}</p>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm mb-1">Entry Price</label>
          <Input type="number" step="0.00000001" {...register("entry_price", { valueAsNumber: true })} />
          {errors.entry_price && <p className="text-xs text-red-600 mt-1">Must be a positive number</p>}
        </div>
        <div>
          <label className="block text-sm mb-1">Exit Price</label>
          <Input type="number" step="0.00000001" {...register("exit_price", { valueAsNumber: true })} />
          {errors.exit_price && <p className="text-xs text-red-600 mt-1">Must be a positive number</p>}
        </div>
        <div>
          <label className="block text-sm mb-1">Position Size</label>
          <Input type="number" step="0.00000001" {...register("position_size", { valueAsNumber: true })} />
          {errors.position_size && <p className="text-xs text-red-600 mt-1">Must be a positive number</p>}
        </div>
      </div>
      <div>
        <label className="block text-sm mb-1">Feeling</label>
        <Select {...register("feeling")} options={[{ label: "Neutral", value: "Neutral" }, { label: "Fear", value: "Fear" }, { label: "Greed", value: "Greed" }]} />
      </div>
      <div>
        <label className="block text-sm mb-1">Notes (optional)</label>
        <Textarea rows={3} {...register("notes")} placeholder="..." />
      </div>
      <div>
        <label className="block text-sm mb-1">Screenshot (optional)</label>
        <Input type="file" accept="image/*" {...register("screenshot")} />
      </div>
      <Button disabled={isSubmitting}>{isSubmitting ? submittingText : "Save"}</Button>
    </form>
  );
}

"use client";

import { useState } from "react";
import { z } from "zod";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const schema = z.object({
  symbol: z.string().trim().min(1, "Symbol is required"),
  entry_price: z.preprocess((v) => Number(v), z.number().finite()),
  exit_price: z.preprocess((v) => Number(v), z.number().finite()),
  position_size: z.preprocess((v) => Number(v), z.number().finite().nonnegative()),
  feeling: z.enum(["Neutral", "Fear", "Greed"]).default("Neutral"),
  screenshot_url: z.string().url().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

type FormDataType = z.infer<typeof schema>;

export default function TradeForm() {
  const supabase = getSupabaseBrowserClient();
  const [form, setForm] = useState<FormDataType>({
    symbol: "",
    entry_price: 0,
    exit_price: 0,
    position_size: 0,
    feeling: "Neutral",
    screenshot_url: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      setMessage({ type: "error", text: first?.message || "Invalid input" });
      return;
    }
    if (!supabase) {
      setMessage({ type: "error", text: "Supabase env vars are not configured." });
      return;
    }
    setSubmitting(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setMessage({ type: "error", text: "Please login first." });
        setSubmitting(false);
        return;
      }
      const payload = {
        user_id: user.id,
        symbol: parsed.data.symbol,
        entry_price: parsed.data.entry_price,
        exit_price: parsed.data.exit_price,
        position_size: parsed.data.position_size,
        feeling: parsed.data.feeling,
        notes: parsed.data.notes || null,
        screenshot_url: parsed.data.screenshot_url || null,
      };
      const { error } = await supabase.from("trades").insert(payload);
      if (error) throw error;
      setMessage({ type: "success", text: "Trade saved." });
      setForm({ symbol: "", entry_price: 0, exit_price: 0, position_size: 0, feeling: "Neutral", screenshot_url: "", notes: "" });
    } catch (err: any) {
      setMessage({ type: "error", text: err?.message || "Failed to save trade" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-4 max-w-xl">
      {message && (
        <div className={`${message.type === "success" ? "text-green-600" : "text-red-600"} text-sm`}>{message.text}</div>
      )}
      <div>
        <label className="block text-sm mb-1">Symbol</label>
        <input
          className="w-full border rounded-md px-3 py-2"
          name="symbol"
          placeholder="BTCUSDT"
          value={form.symbol}
          onChange={onChange}
          required
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm mb-1">Entry Price</label>
          <input
            className="w-full border rounded-md px-3 py-2"
            name="entry_price"
            type="number"
            step="0.00000001"
            value={form.entry_price}
            onChange={onChange}
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Exit Price</label>
          <input
            className="w-full border rounded-md px-3 py-2"
            name="exit_price"
            type="number"
            step="0.00000001"
            value={form.exit_price}
            onChange={onChange}
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Position Size</label>
          <input
            className="w-full border rounded-md px-3 py-2"
            name="position_size"
            type="number"
            step="0.00000001"
            value={form.position_size}
            onChange={onChange}
            required
          />
        </div>
      </div>
      <div>
        <label className="block text-sm mb-1">Feeling</label>
        <select
          className="w-full border rounded-md px-3 py-2"
          name="feeling"
          value={form.feeling}
          onChange={onChange}
        >
          <option value="Neutral">Neutral</option>
          <option value="Fear">Fear</option>
          <option value="Greed">Greed</option>
        </select>
      </div>
      <div>
        <label className="block text-sm mb-1">Screenshot URL (optional)</label>
        <input
          className="w-full border rounded-md px-3 py-2"
          name="screenshot_url"
          placeholder="https://..."
          value={form.screenshot_url || ""}
          onChange={onChange}
        />
      </div>
      <div>
        <label className="block text-sm mb-1">Notes (optional)</label>
        <textarea
          className="w-full border rounded-md px-3 py-2"
          name="notes"
          rows={3}
          placeholder="..."
          value={form.notes || ""}
          onChange={onChange}
        />
      </div>
      <button
        disabled={submitting}
        className="px-4 py-2 rounded-md bg-black text-white dark:bg-white dark:text-black disabled:opacity-50"
      >
        {submitting ? "Saving..." : "Save Trade"}
      </button>
    </form>
  );
}


