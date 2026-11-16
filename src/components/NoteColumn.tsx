"use client";

import { useState } from "react";
import type { ColumnId, Note } from "@/lib/types";

type Props = {
  column: ColumnId;
  title: string;
  hint: string;
  notes: Note[];
  onAdd: (text: string, meta: string) => void;
  onVote: (id: string) => void;
  onDelete: (id: string) => void;
  onMetaChange: (id: string, meta: string) => void;
  onToggleDone: (id: string) => void;
};

export function NoteColumn({ column, title, hint, notes, onAdd, onVote, onDelete, onMetaChange, onToggleDone }: Props) {
  const [text, setText] = useState("");
  const [meta, setMeta] = useState("");
  const isTimeline = column === "timeline";
  const isActions = column === "actions";
  const sorted = isTimeline
    ? [...notes].sort((a, b) => (a.meta ?? "").localeCompare(b.meta ?? ""))
    : isActions
      ? notes
      : [...notes].sort((a, b) => b.votes - a.votes);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    onAdd(text.trim(), meta.trim());
    setText("");
  }

  return (
    <section className="flex min-h-[60vh] flex-col rounded-lg bg-zinc-100 p-3 dark:bg-zinc-900">
      <header className="mb-3">
        <h2 className="font-semibold">{title}</h2>
        <p className="text-xs text-zinc-500">{hint}</p>
      </header>

      <ul className="flex flex-1 flex-col gap-2">
        {sorted.map((n) => (
          <li key={n.id} className="rounded-md border border-zinc-200 bg-white p-2 text-sm shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
            <div className="flex items-start justify-between gap-2">
              <p className={isActions && n.done ? "line-through text-zinc-400" : ""}>
                {isTimeline && n.meta && <span className="mr-1 font-mono text-xs text-zinc-500">{n.meta}</span>}
                {n.text}
              </p>
              <button onClick={() => onDelete(n.id)} aria-label="Delete note" className="text-zinc-400 hover:text-red-600">
                ×
              </button>
            </div>

            {isActions && (
              <div className="mt-2 flex items-center gap-2 text-xs">
                <input
                  value={n.meta ?? ""}
                  onChange={(e) => onMetaChange(n.id, e.target.value)}
                  placeholder="Owner"
                  className="w-28 rounded border border-zinc-300 bg-transparent px-1 py-0.5 dark:border-zinc-600"
                />
                <label className="flex items-center gap-1">
                  <input type="checkbox" checked={!!n.done} onChange={() => onToggleDone(n.id)} />
                  Done
                </label>
              </div>
            )}

            {!isTimeline && !isActions && (
              <button onClick={() => onVote(n.id)} className="mt-2 text-xs text-zinc-600 hover:text-emerald-600 dark:text-zinc-300">
                ▲ {n.votes}
              </button>
            )}
          </li>
        ))}
      </ul>

      <form onSubmit={submit} className="mt-3 flex flex-col gap-2">
        {(isTimeline || isActions) && (
          <input
            value={meta}
            onChange={(e) => setMeta(e.target.value)}
            placeholder={isTimeline ? "Time, e.g. 14:05 UTC" : "Owner (optional)"}
            className="rounded border border-zinc-300 bg-white px-2 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-800"
          />
        )}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={2}
          placeholder="Add a note…"
          className="rounded border border-zinc-300 bg-white px-2 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-800"
        />
        <button type="submit" className="rounded bg-zinc-900 px-3 py-1 text-sm text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900">
          Add
        </button>
      </form>
    </section>
  );
}
