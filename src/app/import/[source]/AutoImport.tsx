"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { draftFromIncident } from "@/lib/status-sources";
import { parseBoards, readRaw, saveBoard } from "@/lib/storage";

/**
 * Imports a provider incident as a draft, then opens it. The draft ID is fixed per
 * incident, so opening the same link again opens the existing draft instead of making a copy.
 */
export function AutoImport({ source, id }: { source: string; id: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const boardId = `import-${source}-${id}`.replace(/[^A-Za-z0-9_-]/g, "");

  useEffect(() => {
    if (!id) return;
    if (parseBoards(readRaw()).some((b) => b.id === boardId)) {
      router.replace(`/board/${boardId}`);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/incident?source=${encodeURIComponent(source)}&id=${encodeURIComponent(id)}`);
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(data.error ?? "Import failed.");
          return;
        }
        saveBoard({ ...draftFromIncident(data), id: boardId });
        router.replace(`/board/${boardId}`);
      } catch {
        if (!cancelled) setError("Import failed. Check your connection and try again.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [source, id, boardId, router]);

  if (!id) return <Message text="This link needs an incident ID, for example ?id=m310qbkfm3ww." />;
  if (error) return <Message text={error} />;
  return <p className="p-6 text-sm text-zinc-500">Importing incident…</p>;
}

function Message({ text }: { text: string }) {
  return (
    <div className="p-6">
      <p>{text}</p>
      <Link href="/" className="text-sm underline">Back to postmortems</Link>
    </div>
  );
}
