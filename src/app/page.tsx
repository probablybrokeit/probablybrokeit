"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { newBoard } from "@/lib/board";
import { parseBoard, uniqueTitle } from "@/lib/import";
import { draftFromIncident, SOURCES, type SourceId } from "@/lib/status-sources";
import { deleteBoard, saveBoard } from "@/lib/storage";
import { useBoards } from "@/lib/useBoard";
import { SEVERITIES, type Severity } from "@/lib/types";

export default function Home() {
  const router = useRouter();
  const { boards } = useBoards();
  const [title, setTitle] = useState("");
  const [severity, setSeverity] = useState<Severity>("SEV2");
  const [incidentStart, setIncidentStart] = useState("");
  const [message, setMessage] = useState("");
  const [sourceId, setSourceId] = useState<SourceId>("github");
  const [incidentId, setIncidentId] = useState("");
  const [importing, setImporting] = useState(false);
  const [incidentMessage, setIncidentMessage] = useState("");

  async function importIncident(e: React.FormEvent) {
    e.preventDefault();
    const id = incidentId.trim();
    if (!id) return;
    setImporting(true);
    setIncidentMessage("");
    try {
      const res = await fetch(`/api/incident?source=${sourceId}&id=${encodeURIComponent(id)}`);
      const data = await res.json();
      if (!res.ok) {
        setIncidentMessage(data.error ?? "Import failed.");
        return;
      }
      const board = draftFromIncident(data);
      saveBoard(board);
      router.push(`/board/${board.id}`);
    } catch {
      setIncidentMessage("Import failed. Check your connection and try again.");
    } finally {
      setImporting(false);
    }
  }

  function create(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const board = newBoard(title.trim(), severity, incidentStart);
    saveBoard(board);
    router.push(`/board/${board.id}`);
  }

  async function importFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const taken = (boards ?? []).map((b) => b.title);
    const failed: string[] = [];
    let imported = 0;
    for (const file of Array.from(files)) {
      let raw: unknown;
      try {
        raw = JSON.parse(await file.text());
      } catch {
        failed.push(`${file.name} (not valid JSON)`);
        continue;
      }
      const board = parseBoard(raw);
      if (!board) {
        failed.push(`${file.name} (not a postmortem export from this app)`);
        continue;
      }
      board.title = uniqueTitle(board.title, taken);
      taken.push(board.title);
      saveBoard(board);
      imported++;
    }
    const summary = `Imported ${imported} postmortem${imported === 1 ? "" : "s"}.`;
    setMessage(failed.length ? `${summary} Skipped: ${failed.join("; ")}` : summary);
  }

  function remove(id: string) {
    if (!confirm("Delete this postmortem? This cannot be undone.")) return;
    deleteBoard(id);
  }

  const sorted = boards ? [...boards].sort((a, b) => b.updatedAt - a.updatedAt) : null;

  return (
    <main className="mx-auto max-w-3xl space-y-8 p-6">
      <h1 className="text-3xl font-bold">Blameless incident postmortems</h1>

      <section className="space-y-3 text-sm text-zinc-600 dark:text-zinc-300">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">About</h2>
        <p>A blameless postmortem tool. Describe what happened and what the system allowed, not who did what. Based on the <a href="https://sre.google/workbook/postmortem-culture/" target="_blank" rel="noopener noreferrer" className="underline hover:text-zinc-900 dark:hover:text-zinc-100">Google SRE Workbook, Chapter 10: Postmortem Culture</a>.</p>
        <ol className="list-inside list-decimal space-y-1">
          <li>Create a postmortem with a title, severity and incident start time.</li>
          <li>Fill in whatever you know. Nothing is required, and tickets can be created later.</li>
          <li>Publish when you&apos;re ready, then copy or download it from the editor or <em>View page</em>.</li>
          <li>Share a read-only link, or export a file and import it on another computer.</li>
        </ol>
        <p className="text-xs text-zinc-500">Postmortems are saved in this browser only. Clearing browser data deletes them. A share link can&apos;t be revoked, and a shared copy doesn&apos;t sync back.</p>
        <div>
          <p className="font-medium text-zinc-900 dark:text-zinc-100">Coming next</p>
          <ul className="list-inside list-disc text-xs">
            <li>Shared storage, so boards aren&apos;t limited to one browser</li>
            <li>An open action item dashboard across all postmortems</li>
          </ul>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">Start a postmortem</h2>
        <div className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 dark:divide-zinc-700 dark:border-zinc-700">
          <form onSubmit={create} className="space-y-2 p-4">
            <p className="text-sm font-medium">New</p>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Checkout outage, 2026-11-10"
              aria-label="Title"
              className="w-full rounded border border-zinc-300 bg-transparent px-2 py-1 dark:border-zinc-600"
            />
            <div className="flex flex-wrap gap-2">
              <select value={severity} onChange={(e) => setSeverity(e.target.value as Severity)} aria-label="Severity" className="rounded border border-zinc-300 bg-transparent px-2 py-1 dark:border-zinc-600">
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

          <div className="flex flex-wrap items-center gap-3 p-4 text-sm">
            <p className="font-medium">From a file</p>
            <label className="cursor-pointer rounded border border-zinc-300 px-3 py-1 hover:bg-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-800">
              Import postmortem
              <input
                type="file"
                accept="application/json,.json"
                multiple
                className="hidden"
                onChange={(e) => {
                  importFiles(e.target.files);
                  e.target.value = "";
                }}
              />
            </label>
            <span className="text-xs text-zinc-500">.json files exported from this app</span>
            {message && <span className="text-zinc-600 dark:text-zinc-300">{message}</span>}
          </div>

          <form onSubmit={importIncident} className="space-y-2 p-4">
            <p className="text-sm font-medium">From a provider incident</p>
            <p className="text-xs text-zinc-500">
              Draft with the provider&apos;s timeline. Only recent incidents are available.{" "}
              <a href={SOURCES.find((s) => s.id === sourceId)?.page} target="_blank" rel="noopener noreferrer" className="underline">
                Find IDs on {SOURCES.find((s) => s.id === sourceId)?.label}
              </a>
            </p>
            <div className="flex flex-wrap gap-2">
              <select value={sourceId} onChange={(e) => setSourceId(e.target.value as SourceId)} aria-label="Provider" className="rounded border border-zinc-300 bg-transparent px-2 py-1 dark:border-zinc-600">
                {SOURCES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
              <input
                value={incidentId}
                onChange={(e) => setIncidentId(e.target.value)}
                placeholder="Incident ID"
                aria-label="Incident ID"
                className="min-w-40 flex-1 rounded border border-zinc-300 bg-transparent px-2 py-1 dark:border-zinc-600"
              />
              <button type="submit" disabled={importing} className="rounded border border-zinc-300 px-3 py-1 text-sm disabled:opacity-60 dark:border-zinc-600">
                {importing ? "Importing…" : "Import incident"}
              </button>
            </div>
            {incidentMessage && <p className="text-sm text-red-600">{incidentMessage}</p>}
          </form>
        </div>
      </section>

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
