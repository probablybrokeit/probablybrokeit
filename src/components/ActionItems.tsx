"use client";

import { newId } from "@/lib/storage";
import { ACTION_TYPES, PRIORITIES, type ActionItem } from "@/lib/types";

const input = "rounded border border-zinc-300 bg-white px-2 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-800";

type Props = { items: ActionItem[]; onChange: (items: ActionItem[]) => void };

export function ActionItems({ items, onChange }: Props) {
  const patch = (id: string, p: Partial<ActionItem>) =>
    onChange(items.map((i) => (i.id === id ? { ...i, ...p } : i)));

  const add = () =>
    onChange([
      ...items,
      { id: newId(), text: "", type: "", priority: "", owner: "", endState: "", done: false, createdAt: Date.now() },
    ]);

  const remove = (id: string) => onChange(items.filter((i) => i.id !== id));

  return (
    <div className="space-y-3">
      {items.map((i) => (
        <div key={i.id} className="grid gap-2 rounded-lg border border-zinc-200 p-3 md:grid-cols-6 dark:border-zinc-700">
          <input className={`${input} md:col-span-3`} value={i.text} placeholder="What will change?" onChange={(e) => patch(i.id, { text: e.target.value })} />
          <select className={input} value={i.type} onChange={(e) => patch(i.id, { type: e.target.value as ActionItem["type"] })}>
            <option value="">Type</option>
            {ACTION_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
          <select className={input} value={i.priority} onChange={(e) => patch(i.id, { priority: e.target.value as ActionItem["priority"] })}>
            <option value="">Priority</option>
            {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
          </select>
          <input className={input} value={i.owner} placeholder="Owner (team or role)" onChange={(e) => patch(i.id, { owner: e.target.value })} />
          <input className={`${input} md:col-span-4`} value={i.endState} placeholder="Measurable end state, e.g. alert pages within 5 min of error spike" onChange={(e) => patch(i.id, { endState: e.target.value })} />
          <div className="flex items-center justify-between gap-2 md:col-span-2">
            <label className="flex items-center gap-1 text-sm">
              <input type="checkbox" checked={i.done} onChange={(e) => patch(i.id, { done: e.target.checked })} />
              Done
            </label>
            <button onClick={() => remove(i.id)} className="text-sm text-red-600 hover:underline">Remove</button>
          </div>
        </div>
      ))}
      <button onClick={add} className="rounded border border-dashed border-zinc-400 px-3 py-1 text-sm">
        + Add action item
      </button>
    </div>
  );
}
