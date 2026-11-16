"use client";

import Link from "next/link";
import { NoteColumn } from "@/components/NoteColumn";
import { useBoard } from "@/lib/useBoard";
import { boardToMarkdown } from "@/lib/markdown";
import { newId } from "@/lib/storage";
import { COLUMNS, type Board, type Note } from "@/lib/types";

export function BoardClient({ id }: { id: string }) {
  const { board, ready, update } = useBoard(id);

  if (!ready) return <p className="p-6 text-sm text-zinc-500">Loading…</p>;
  if (!board) {
    return (
      <div className="p-6">
        <p>Board not found. It may have been created on another browser.</p>
        <Link href="/" className="text-sm underline">Back to boards</Link>
      </div>
    );
  }

  const patchNote = (noteId: string, fn: (n: Note) => Note) =>
    update((b) => ({ ...b, notes: b.notes.map((n) => (n.id === noteId ? fn(n) : n)) }));

  const setField = <K extends keyof Board>(key: K, value: Board[K]) => update((b) => ({ ...b, [key]: value }));

  function exportMarkdown() {
    const md = boardToMarkdown(board!);
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `postmortem-${board!.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-7xl space-y-4 p-4">
      <header className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="text-sm text-zinc-500 underline">All boards</Link>
          <button onClick={exportMarkdown} className="rounded border border-zinc-300 px-3 py-1 text-sm dark:border-zinc-600">
            Export Markdown
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={board.title}
            onChange={(e) => setField("title", e.target.value)}
            className="min-w-64 flex-1 bg-transparent text-2xl font-bold outline-none"
          />
          <select value={board.severity} onChange={(e) => setField("severity", e.target.value as Board["severity"])} className="rounded border border-zinc-300 bg-transparent px-2 py-1 text-sm dark:border-zinc-600">
            {["SEV1", "SEV2", "SEV3", "SEV4"].map((s) => <option key={s}>{s}</option>)}
          </select>
          <input type="date" value={board.incidentDate} onChange={(e) => setField("incidentDate", e.target.value)} className="rounded border border-zinc-300 bg-transparent px-2 py-1 text-sm dark:border-zinc-600" />
        </div>
        <textarea
          value={board.summary}
          onChange={(e) => setField("summary", e.target.value)}
          placeholder="Short summary of the incident and impact…"
          rows={2}
          className="w-full rounded border border-zinc-300 bg-transparent p-2 text-sm dark:border-zinc-600"
        />
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {COLUMNS.map((col) => (
          <NoteColumn
            key={col.id}
            column={col.id}
            title={col.title}
            hint={col.hint}
            notes={board.notes.filter((n) => n.column === col.id)}
            onAdd={(text, meta) =>
              update((b) => ({
                ...b,
                notes: [...b.notes, { id: newId(), column: col.id, text, meta: meta || undefined, votes: 0, done: false, createdAt: Date.now() }],
              }))
            }
            onVote={(noteId) => patchNote(noteId, (n) => ({ ...n, votes: n.votes + 1 }))}
            onDelete={(noteId) => update((b) => ({ ...b, notes: b.notes.filter((n) => n.id !== noteId) }))}
            onMetaChange={(noteId, meta) => patchNote(noteId, (n) => ({ ...n, meta }))}
            onToggleDone={(noteId) => patchNote(noteId, (n) => ({ ...n, done: !n.done }))}
          />
        ))}
      </div>
    </div>
  );
}
