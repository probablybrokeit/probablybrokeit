"use client";

import Link from "next/link";
import { ActionItems } from "@/components/ActionItems";
import { NoteColumn } from "@/components/NoteColumn";
import { formatMinutes, metrics } from "@/lib/board";
import { blamelessWarnings } from "@/lib/checks";
import { boardReportHtml, boardStorageHtml, download } from "@/lib/export";
import { boardToMarkdown } from "@/lib/markdown";
import { newId } from "@/lib/storage";
import { useBoard } from "@/lib/useBoard";
import { FACTOR_CATEGORIES, NOTE_COLUMNS, SEVERITIES, type Board, type Factor, type Note } from "@/lib/types";
import { encodeBoard } from "@/lib/share";
import { useState } from "react";

const input = "rounded border border-zinc-300 bg-transparent px-2 py-1 text-sm dark:border-zinc-600";
const label = "flex flex-col gap-1 text-xs font-medium text-zinc-600 dark:text-zinc-300";

export function BoardClient({ id }: { id: string }) {
  const { board, ready, update } = useBoard(id);
  const [shareNote, setShareNote] = useState("");
  const [shareState, setShareState] = useState<"idle" | "copied" | "failed">("idle");

  if (!ready) return <p className="p-6 text-sm text-zinc-500">Loading…</p>;
  if (!board) {
    return (
      <div className="p-6">
        <p>Board not found. It may have been created in another browser.</p>
        <Link href="/" className="text-sm underline">Back to postmortems</Link>
      </div>
    );
  }

  const slug = board.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || board.id;
  const exportButton = "rounded border border-zinc-300 px-3 py-1 text-sm dark:border-zinc-600";
  async function copyShareLink(b: Board) {
    try {
      const url = `${window.location.origin}/share#${await encodeBoard(b)}`;
      await navigator.clipboard.writeText(url);
      setShareState("copied");
      setTimeout(() => setShareState("idle"), 2500);
      setShareNote(
        url.length > 6000
          ? "Link copied. It's long, so some chat tools may cut it off."
          : "Link copied. Anyone with it can read this postmortem, and it can't be revoked.",
      );
    } catch {
      setShareState("failed");
      setTimeout(() => setShareState("idle"), 2500);
      setShareNote("Could not copy the link. Your browser may block clipboard access.");
    }
  }

  const locked = board.status === "published";
  const warnings = blamelessWarnings(board);
  const m = metrics(board);

  const set = <K extends keyof Board>(key: K, value: Board[K]) =>
    update((b) => ({ ...b, [key]: value }) as Board);

  const setNotes = (fn: (notes: Note[]) => Note[]) => update((b) => ({ ...b, notes: fn(b.notes) }));
  const setFactors = (factors: Factor[]) => set("factors", factors);


  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4">
      {/* Top bar: always editable, so status changes still work when locked */}
      <header className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-zinc-500 underline">All postmortems</Link>
            <Link href={`/board/${board.id}/doc`} className="text-sm text-zinc-500 underline">View page</Link>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={board.title}
            disabled={locked}
            onChange={(e) => set("title", e.target.value)}
            className="min-w-64 flex-1 bg-transparent text-2xl font-bold outline-none disabled:opacity-60"
          />
          <span className="rounded-full border border-zinc-300 px-2 py-0.5 text-xs uppercase dark:border-zinc-600">{board.status}</span>
          {board.status === "draft" && (
            <button onClick={() => set("status", "published")} className="rounded bg-emerald-700 px-3 py-1 text-sm text-white">Publish</button>
          )}
          {board.status === "published" && (
            <button onClick={() => set("status", "draft")} className="rounded border px-3 py-1 text-sm dark:border-zinc-600">Reopen as draft</button>
          )}
          <div className="ml-auto flex flex-wrap gap-2">
            <button onClick={() => download(`${slug}.md`, "text/markdown", boardToMarkdown(board))} className={exportButton}>Markdown</button>
            <button onClick={() => download(`${slug}.json`, "application/json", JSON.stringify(board, null, 2))} className={exportButton} title="Full data for backup.">JSON</button>
            <button onClick={() => download(`${slug}.html`, "text/html", boardReportHtml(board))} className={exportButton} title="Standalone file. Open in a browser or print to PDF.">HTML report</button>
            <button onClick={() => download(`${slug}-confluence.html`, "text/html", boardStorageHtml(board))} className={exportButton} title="Paste via Insert > Markup in Confluence.">Confluence file</button>
            <button
              onClick={() => copyShareLink(board)}
              className={`${exportButton} ${shareState === "copied" ? "border-emerald-700 bg-emerald-700 text-white" : shareState === "failed" ? "border-red-600 text-red-600" : ""}`}
              title="Read-only link. Anyone with it can read the postmortem."
            >
              {shareState === "copied" ? "Link copied" : shareState === "failed" ? "Copy failed" : "Copy share link"}
            </button>
          </div>
        </div>
        {shareNote && <p className="text-sm text-zinc-500">{shareNote}</p>}
        {locked && <p className="text-sm text-zinc-500">Published postmortems are read-only. Reopen as draft to edit.</p>}
      </header>

      {/* Blameless-language suggestions. Advisory only: nothing is blocked. */}
      {warnings.length > 0 && (
        <section className="rounded-lg border border-sky-300 bg-sky-50 p-3 text-sm dark:border-sky-700 dark:bg-sky-950">
          <h2 className="mb-2 font-semibold">Blameless wording ({warnings.length} suggestions)</h2>
          <ul className="space-y-2">
            {warnings.map((w, i) => (
              <li key={i}>
                <span className="font-mono text-xs">&quot;{w.phrase}&quot;</span> in {w.where.toLowerCase()}: {w.advice}
              </li>
            ))}
          </ul>
        </section>
      )}

      <fieldset disabled={locked} className="min-w-0 space-y-8">
        {/* Metadata and metrics */}
        <section className="grid gap-4 md:grid-cols-4">
          <label className={label}>Incident ID (optional)
            <input className={input} value={board.incidentId ?? ""} placeholder="e.g. INC-1234" onChange={(e) => set("incidentId", e.target.value)} />
          </label>
          <label className={label}>Owner (one accountable person)
            <input className={input} value={board.owner} onChange={(e) => set("owner", e.target.value)} />
          </label>
          <label className={label}>Audience
            <input className={input} value={board.audience} placeholder="e.g. all engineering" onChange={(e) => set("audience", e.target.value)} />
          </label>
          <label className={label}>Severity
            <select className={input} value={board.severity} onChange={(e) => set("severity", e.target.value as Board["severity"])}>
              {SEVERITIES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </label>
          <div className={label}>Metrics
            <span className="text-sm font-normal text-zinc-700 dark:text-zinc-200">
              Detect {formatMinutes(m.timeToDetect)} · Mitigate {formatMinutes(m.timeToMitigate)} · Duration {formatMinutes(m.duration)}
            </span>
          </div>
          <label className={label}>Incident start
            <input type="datetime-local" className={input} value={board.incidentStart} onChange={(e) => set("incidentStart", e.target.value)} />
          </label>
          <label className={label}>Detected
            <input type="datetime-local" className={input} value={board.detectedAt} onChange={(e) => set("detectedAt", e.target.value)} />
          </label>
          <label className={label}>Mitigated
            <input type="datetime-local" className={input} value={board.mitigatedAt} onChange={(e) => set("mitigatedAt", e.target.value)} />
          </label>
          <label className={label}>Ended
            <input type="datetime-local" className={input} value={board.incidentEnd} onChange={(e) => set("incidentEnd", e.target.value)} />
          </label>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <label className={label}>Executive summary
            <textarea rows={4} className={input} value={board.summary} placeholder="What happened, who was affected, and how it was resolved." onChange={(e) => set("summary", e.target.value)} />
          </label>
          <label className={label}>Impact
            <textarea rows={4} className={input} value={board.impact} placeholder="Users, revenue, teams. Quantify where you can." onChange={(e) => set("impact", e.target.value)} />
          </label>
        </section>

        {/* Contributing factors instead of a single root cause */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Contributing factors</h2>
          <p className="text-xs text-zinc-500">Several conditions usually combine. List each one, and describe the system rather than people.</p>
          {board.factors.map((f) => (
            <div key={f.id} className="flex flex-wrap gap-2">
              <select className={input} value={f.category} onChange={(e) => setFactors(board.factors.map((x) => (x.id === f.id ? { ...x, category: e.target.value as Factor["category"] } : x)))}>
                <option value="">Category</option>
                {FACTOR_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
              <input className={`${input} min-w-64 flex-1`} value={f.text} onChange={(e) => setFactors(board.factors.map((x) => (x.id === f.id ? { ...x, text: e.target.value } : x)))} />
              <button onClick={() => setFactors(board.factors.filter((x) => x.id !== f.id))} className="text-sm text-red-600 hover:underline">Remove</button>
            </div>
          ))}
          <button onClick={() => setFactors([...board.factors, { id: newId(), category: "", text: "" }])} className="rounded border border-dashed border-zinc-400 px-3 py-1 text-sm">
            + Add contributing factor
          </button>
        </section>

        {/* Action items with the fields the publish check enforces */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Action items</h2>
          <ActionItems items={board.actions} onChange={(actions) => set("actions", actions)} />
        </section>

        {/* Brainstorm columns feed the document */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Brainstorm</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {NOTE_COLUMNS.map((col) => (
              <NoteColumn
                key={col.id}
                column={col.id}
                title={col.title}
                hint={col.hint}
                notes={board.notes.filter((n) => n.column === col.id)}
                onAdd={(text, time) =>
                  setNotes((notes) => [...notes, { id: newId(), column: col.id, text, time: time || undefined, votes: 0, createdAt: Date.now() }])
                }
                onVote={(noteId) => setNotes((notes) => notes.map((n) => (n.id === noteId ? { ...n, votes: n.votes + 1 } : n)))}
                onDelete={(noteId) => setNotes((notes) => notes.filter((n) => n.id !== noteId))}
              />
            ))}
          </div>
        </section>
      </fieldset>
    </div>
  );
}
