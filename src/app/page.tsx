"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { newBoard } from "@/lib/board";
import { deleteBoard, saveBoard } from "@/lib/storage";
import { useBoards } from "@/lib/useBoard";
import { SEVERITIES, type Severity } from "@/lib/types";

export default function Home() {
  const router = useRouter();
  const { boards } = useBoards();
  const [title, setTitle] = useState("");
  const [severity, setSeverity] = useState<Severity>("SEV2");
  const [incidentStart, setIncidentStart] = useState("");

  function create(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const board = newBoard(title.trim(), severity, incidentStart);
    saveBoard(board);
    router.push(`/board/${board.id}`);
  }

  function remove(id: string) {
    if (!confirm("Delete this postmortem? This cannot be undone.")) return;
    deleteBoard(id);
  }

  const sorted = boards ? [...boards].sort((a, b) => b.updatedAt - a.updatedAt) : null;

  return (
    <main className="mx-auto max-w-3xl space-y-8 p-6">
      <h1 className="text-3xl font-bold">Postmortems</h1>

      <form onSubmit={create} className="space-y-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
        <h2 className="font-semibold">New postmortem</h2>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Checkout outage, 2026-11-10"
          className="w-full rounded border border-zinc-300 bg-transparent px-2 py-1 dark:border-zinc-600"
        />
        <div className="flex flex-wrap gap-2">
          <select value={severity} onChange={(e) => setSeverity(e.target.value as Severity)} className="rounded border border-zinc-300 bg-transparent px-2 py-1 dark:border-zinc-600">
            {SEVERITIES.map((s) => <option key={s}>{s}</option>)}
          </select>
          <input
            type="datetime-local"
            value={incidentStart}
            onChange={(e) => setIncidentStart(e.target.value)}
            aria-label="Incident start"
            className="rounded border border-zinc-300 bg-transparent px-2 py-1 dark:border-zinc-600"
          />
          <button type="submit" className="ml-auto rounded bg-zinc-900 px-4 py-1 text-white dark:bg-zinc-100 dark:text-zinc-900">Create</button>
        </div>
      </form>

      <ul className="divide-y divide-zinc-200 dark:divide-zinc-700">
        {sorted?.length === 0 && <li className="py-4 text-sm text-zinc-500">No postmortems yet.</li>}
        {sorted?.map((b) => (
          <li key={b.id} className="flex items-center justify-between py-3">
            <Link href={`/board/${b.id}`} className="hover:underline">
              <span className="font-medium">{b.title}</span>
              <span className="ml-2 text-xs text-zinc-500">
                {b.severity} · {b.status} · {b.incidentStart ? b.incidentStart.slice(0, 10) : "no date"} · {b.actions.length} actions
              </span>
            </Link>
            <button onClick={() => remove(b.id)} className="text-xs text-zinc-400 hover:text-red-600">Delete</button>
          </li>
        ))}
      </ul>
    </main>
  );
}
