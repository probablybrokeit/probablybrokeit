"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { draftFromIncident, SOURCES, type SourceId } from "@/lib/status-sources";
import { saveBoard } from "@/lib/storage";

type Props = { initialSource: SourceId; initialId: string; fromLink: boolean };

const button = "rounded border border-zinc-300 px-3 py-1 text-sm disabled:opacity-60 dark:border-zinc-600";

/** Provider incident import. Opened from a shared link, it arrives filled in and waits for the user to click Import. */
export function ProviderImport({ initialSource, initialId, fromLink }: Props) {
  const router = useRouter();
  const [sourceId, setSourceId] = useState<SourceId>(initialSource);
  const [incidentId, setIncidentId] = useState(initialId);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState("");
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const source = SOURCES.find((s) => s.id === sourceId);

  async function importIncident(e: React.FormEvent) {
    e.preventDefault();
    const id = incidentId.trim();
    if (!id) return;
    setImporting(true);
    setMessage("");
    try {
      const res = await fetch(`/api/incident?source=${sourceId}&id=${encodeURIComponent(id)}`);
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error ?? "Import failed.");
        return;
      }
      const board = draftFromIncident(data);
      saveBoard(board);
      router.push(`/board/${board.id}`);
    } catch {
      setMessage("Import failed. Check your connection and try again.");
    } finally {
      setImporting(false);
    }
  }

  async function copyLink() {
    const id = incidentId.trim();
    if (!id) {
      setMessage("Enter an incident ID first.");
      return;
    }
    const url = `${window.location.origin}/?source=${sourceId}&id=${encodeURIComponent(id)}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
    setTimeout(() => setCopyState("idle"), 2500);
  }

  return (
    <form onSubmit={importIncident} className="space-y-2">
      <p className="text-xs text-zinc-500">
        {fromLink ? "Opened from a shared link. Check the details, then click Import incident. " : "Draft with the provider's timeline. Only recent incidents are available. "}
        {source && (
          <a href={source.page} target="_blank" rel="noopener noreferrer" className="underline">
            Find IDs on {source.label}
          </a>
        )}
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
        <button type="submit" disabled={importing} className={button}>
          {importing ? "Importing…" : "Import incident"}
        </button>
        <button
          type="button"
          onClick={copyLink}
          className={`${button} ${copyState === "copied" ? "border-emerald-700 bg-emerald-700 text-white" : copyState === "failed" ? "border-red-600 text-red-600" : ""}`}
          title="Creates a link that opens this form already filled in."
        >
          {copyState === "copied" ? "Link copied" : copyState === "failed" ? "Copy failed" : "Copy link"}
        </button>
      </div>
      {message && <p className="text-sm text-red-600">{message}</p>}
    </form>
  );
}
