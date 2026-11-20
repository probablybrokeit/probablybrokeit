"use client";

import Link from "next/link";
import { ExportMenu } from "@/components/ExportMenu";
import { boardBodyHtml } from "@/lib/export";
import { useBoard } from "@/lib/useBoard";

export function DocClient({ id }: { id: string }) {
  const { board, ready } = useBoard(id);

  if (!ready) return <p className="p-6 text-sm text-zinc-500">Loading…</p>;
  if (!board) {
    return (
      <div className="p-6">
        <p>Postmortem not found.</p>
        <Link href="/" className="text-sm underline">Back to postmortems</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href={`/board/${board.id}`} className="text-sm text-zinc-500 underline">Back to editor</Link>
        <ExportMenu board={board} />
      </div>

      <article className="space-y-2 rounded-lg border border-zinc-200 p-6 dark:border-zinc-700 [&_h2]:mt-6 [&_h2]:border-b [&_h2]:border-zinc-200 [&_h2]:pb-1 [&_h2]:text-lg [&_h2]:font-semibold dark:[&_h2]:border-zinc-700 [&_li]:ml-5 [&_li]:list-disc [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm [&_td]:border [&_td]:border-zinc-200 [&_td]:p-1.5 [&_th]:border [&_th]:border-zinc-200 [&_th]:bg-zinc-100 [&_th]:p-1.5 [&_th]:text-left dark:[&_td]:border-zinc-700 dark:[&_th]:border-zinc-700 dark:[&_th]:bg-zinc-800 [&_a]:text-blue-700 [&_a]:underline">
        <h1 className="text-2xl font-bold">{board.title}</h1>
        {/* Safe: boardBodyHtml escapes every user-entered string before building the markup. */}
        <div dangerouslySetInnerHTML={{ __html: boardBodyHtml(board) }} />
      </article>
    </div>
  );
}
