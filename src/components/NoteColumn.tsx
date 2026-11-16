"use client";

import { useState } from "react";
import type { Note, NoteColumnId } from "@/lib/types";

type Props = {
  column: NoteColumnId;
  title: string;
  hint: string;
  notes: Note[];
  onAdd: (text: string, time: string) => void;
  onVote: (id: string) => void;
  onDelete: (id: string) => void;
};

const input = "rounded border border-zinc-300 bg-white px-2 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-800";

export function NoteColumn({ column, title, hint, notes, onAdd, onVote, onDelete }: Props) {
  const [text, setText] = useState("");
  const [time, setTime] = useState("");
  const isTimeline = column === "timeline";

  const sorted = isTimeline
    ? [...notes].sort((a, b) => (a.time ?? "").localeCompare(b.time ?? ""))
    : [...notes].sort((a, b) => b.votes - a.votes);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    onAdd(text.trim(), time.trim());
    setText("");
  }

  return (
    <section className="flex min-h-[40vh] flex-col rounded-lg bg-zinc-100 p-3 dark:bg-zinc-900">
      <header className="mb-3">
        <h3 className="font-semibold">{title}</h3>
        <p className="text-xs text-zinc-500">{hint}</p>
      </header>

      <ul className="flex flex-1 flex-col gap-2">
        {sorted.map((n) => (
          <li key={n.id} className="rounded-md border border-zinc-200 bg-white p-2 text-sm shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
            <div className="flex items-start justify-between gap-2">
              <p>
                {isTimeline && n.time && <span className="mr-1 font-mono text-xs text-zinc-500">{n.time}</span>}
                {n.text}
              </p>
              <button onClick={() => onDelete(n.id)} aria-label="Delete note" className="text-zinc-400 hover:text-red-600">
                ×
              </button>
            </div>
            {!isTimeline && (
              <button onClick={() => onVote(n.id)} className="mt-2 text-xs text-zinc-600 hover:text-emerald-600 dark:text-zinc-300">
                ▲ {n.votes}
              </button>
            )}
          </li>
        ))}
      </ul>

      <form onSubmit={submit} className="mt-3 flex flex-col gap-2">
        {isTimeline && (
          <input value={time} onChange={(e) => setTime(e.target.value)} placeholder="Time, e.g. 14:05 UTC" className={input} />
        )}
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} placeholder="Add a note…" className={input} />
        <button type="submit" className="rounded bg-zinc-900 px-3 py-1 text-sm text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900">
          Add
        </button>
      </form>
    </section>
  );
}
