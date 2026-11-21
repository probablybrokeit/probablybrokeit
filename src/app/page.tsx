"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { ProviderImport } from "@/components/ProviderImport";
import { newBoard } from "@/lib/board";
import { parseBoard, uniqueTitle } from "@/lib/import";
import { SOURCES } from "@/lib/status-sources";
import { deleteBoard, saveBoard } from "@/lib/storage";
import { useBoards } from "@/lib/useBoard";
import { SEVERITIES, type Severity } from "@/lib/types";

function subscribeSearch(callback: () => void) {
  window.addEventListener("popstate", callback);
  return () => window.removeEventListener("popstate", callback);
}

export default function Home() {
  const router = useRouter();
  const { boards } = useBoards();
  const [title, setTitle] = useState("");
  const [severity, setSeverity] = useState<Severity>("SEV2");
  const [incidentStart, setIncidentStart] = useState("");
  const [message, setMessage] = useState("");
  const [importMode, setImportMode] = useState<"file" | "provider" | null>(null);

  // Links like /?source=gcp&id=... open with the provider form filled in.
  const search = useSyncExternalStore(subscribeSearch, () => window.location.search, () => "");
  const params = new URLSearchParams(search);
  const linkSource = SOURCES.find((s) => s.id === params.get("source"))?.id;
  const linkId = params.get("id")?.trim() ?? "";
  const fromLink = !!linkSource && linkId !== "";
  const mode = importMode ?? (fromLink ? "provider" : "file");

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
        <h2 className="font-semibold">New postmortem</h2>
        <form onSubmit={create} className="space-y-2 rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
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
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">Import</h2>
        <div className="space-y-4 rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
          <div role="tablist" className="flex gap-2 text-sm">
            <button
              type="button"
              role="tab"
              aria-selected={mode === "file"}
              onClick={() => setImportMode("file")}
              className={`rounded border px-3 py-1 text-sm ${mode === "file" ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" : "border-zinc-300 dark:border-zinc-600"}`}
            >
              From a file
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "provider"}
              onClick={() => setImportMode("provider")}
              className={`rounded border px-3 py-1 text-sm ${mode === "provider" ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" : "border-zinc-300 dark:border-zinc-600"}`}
            >
              From a provider incident
            </button>
          </div>

          {mode === "file" ? (
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <label className="cursor-pointer rounded border border-zinc-300 px-3 py-1 hover:bg-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-800">
                Choose .json files
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
              <span className="text-xs text-zinc-500">Files exported from this app</span>
              {message && <span className="text-zinc-600 dark:text-zinc-300">{message}</span>}
            </div>
          ) : (
            <ProviderImport key={search} initialSource={linkSource ?? "github"} initialId={linkId} fromLink={fromLink} />
          )}
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
