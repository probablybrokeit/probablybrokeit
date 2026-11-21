"use client";

import { useState } from "react";
import { summarizeUpdate } from "@/lib/status-sources";
import type { ProviderUpdate } from "@/lib/types";

/** The provider's own updates, one line each. Full text is one click away. */
export function ProviderUpdates({ updates, onClear }: { updates: ProviderUpdate[]; onClear?: () => void }) {
  const [full, setFull] = useState(false);
  if (updates.length === 0) return null;

  return (
    <details open className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
      <summary className="cursor-pointer font-semibold">Provider updates ({updates.length})</summary>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500">
        <span>Written by the provider, not by your team. Use them as reference.</span>
        <div className="flex gap-3">
          <button type="button" onClick={() => setFull((f) => !f)} className="underline">
            {full ? "Show summary" : "Show full text"}
          </button>
          {onClear && (
            <button type="button" onClick={onClear} className="text-red-600 underline">
              Remove
            </button>
          )}
        </div>
      </div>
      <ol className="mt-3 space-y-2 text-sm">
        {updates.map((u) => (
          <li key={u.id} className="flex flex-col gap-1 sm:flex-row sm:gap-3">
            <span className="shrink-0 font-mono text-xs text-zinc-500 sm:w-36">{u.time}</span>
            {u.status && <span className="shrink-0 text-xs uppercase tracking-wide text-zinc-500 sm:w-36">{u.status.replace(/_/g, " ")}</span>}
            <span>{full ? u.text : summarizeUpdate(u.text)}</span>
          </li>
        ))}
      </ol>
    </details>
  );
}
