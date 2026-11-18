"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { boardBodyHtml } from "@/lib/export";
import { parseBoard, uniqueTitle } from "@/lib/import";
import { decodeBoard } from "@/lib/share";
import { newId, saveBoard } from "@/lib/storage";
import { useBoards } from "@/lib/useBoard";
import type { Board } from "@/lib/types";

// The part after # is read from the browser only. It is never sent to the server.
const subscribeHash = (cb: () => void) => {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
};
const readHash = () => window.location.hash.slice(1);
const noHash = () => "";

type Result = { hash: string; board: Board | null };

export function ShareClient() {
  const router = useRouter();
  const { boards } = useBoards();
  const hash = useSyncExternalStore(subscribeHash, readHash, noHash);
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    if (!hash) return;
    let cancelled = false;
    decodeBoard(hash)
      .then((raw) => parseBoard(raw))
      .catch(() => null)
      .then((board) => {
        if (!cancelled) setResult({ hash, board });
      });
    return () => {
      cancelled = true;
    };
  }, [hash]);

  if (!hash) return <Message text="This link has no postmortem in it." />;
  if (!result || result.hash !== hash) return <Message text="Loading…" />;
  if (!result.board) return <Message text="This link is damaged or is not a postmortem link." />;

  const board = result.board;

  function saveCopy() {
    const taken = (boards ?? []).map((b) => b.title);
    const copy: Board = {
      ...board,
      id: newId(),
      title: uniqueTitle(board.title, taken),
      status: "draft",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    saveBoard(copy);
    router.push(`/board/${copy.id}`);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/" className="text-sm text-zinc-500 underline">All postmortems</Link>
        <button onClick={saveCopy} className="rounded bg-zinc-900 px-3 py-1 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900">
          Save a copy and edit
        </button>
      </div>
      <p className="text-xs text-zinc-500">Shared read-only. Saving makes your own copy, which does not sync back to the original.</p>
      <article className="space-y-2 rounded-lg border border-zinc-200 p-6 dark:border-zinc-700 [&_h2]:mt-6 [&_h2]:border-b [&_h2]:border-zinc-200 [&_h2]:pb-1 [&_h2]:text-lg [&_h2]:font-semibold dark:[&_h2]:border-zinc-700 [&_li]:ml-5 [&_li]:list-disc [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm [&_td]:border [&_td]:border-zinc-200 [&_td]:p-1.5 [&_th]:border [&_th]:border-zinc-200 [&_th]:bg-zinc-100 [&_th]:p-1.5 [&_th]:text-left dark:[&_td]:border-zinc-700 dark:[&_th]:border-zinc-700 dark:[&_th]:bg-zinc-800 [&_a]:text-blue-700 [&_a]:underline">
        <h1 className="text-2xl font-bold">{board.title}</h1>
        {/* Safe: boardBodyHtml escapes every user-entered string before building the markup. */}
        <div dangerouslySetInnerHTML={{ __html: boardBodyHtml(board) }} />
      </article>
    </div>
  );
}

function Message({ text }: { text: string }) {
  return (
    <div className="p-6">
      <p>{text}</p>
      <Link href="/" className="text-sm underline">Back to postmortems</Link>
    </div>
  );
}
