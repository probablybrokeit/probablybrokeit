"use client";

import Link from "next/link";
import { useState } from "react";
import { boardBodyHtml, boardReportHtml, copyForConfluence, download } from "@/lib/export";
import { boardToMarkdown } from "@/lib/markdown";
import { useBoard } from "@/lib/useBoard";

const button = "rounded border border-zinc-300 px-3 py-1 text-sm hover:bg-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-800";

export function DocClient({ id }: { id: string }) {
  const { board, ready } = useBoard(id);
  const [status, setStatus] = useState("");

  if (!ready) return <p className="p-6 text-sm text-zinc-500">Loading…</p>;
  if (!board) {
    return (
      <div className="p-6">
        <p>Postmortem not found.</p>
        <Link href="/" className="text-sm underline">Back to postmortems</Link>
      </div>
    );
  }

  const flash = (msg: string) => {
    setStatus(msg);
    setTimeout(() => setStatus(""), 2000);
  };

  async function copy(kind: "rich" | "html" | "markdown") {
    try {
      if (kind === "rich") await copyForConfluence(board!);
      if (kind === "html") await navigator.clipboard.writeText(`<h1>${escapeText(board!.title)}</h1>\n${boardBodyHtml(board!)}`);
      if (kind === "markdown") await navigator.clipboard.writeText(boardToMarkdown(board!));
      flash("Copied");
    } catch {
      flash("Copy failed. Your browser may block clipboard access.");
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href={`/board/${board.id}`} className="text-sm text-zinc-500 underline">Back to editor</Link>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => copy("rich")} className={button} title="Keeps formatting. Paste into Confluence, Google Docs or Word.">Copy rich text</button>
          <button onClick={() => copy("html")} className={button} title="Raw HTML source.">Copy HTML</button>
          <button onClick={() => copy("markdown")} className={button}>Copy Markdown</button>
          <button onClick={() => download(`${slugify(board.title) || board.id}.html`, "text/html", boardReportHtml(board))} className={button} title="Standalone file. Open in a browser or print to PDF.">Download HTML</button>
          {status && <span className="text-sm text-emerald-700 dark:text-emerald-400">{status}</span>}
        </div>
      </div>

      <article className="space-y-2 rounded-lg border border-zinc-200 p-6 dark:border-zinc-700 [&_h2]:mt-6 [&_h2]:border-b [&_h2]:border-zinc-200 [&_h2]:pb-1 [&_h2]:text-lg [&_h2]:font-semibold dark:[&_h2]:border-zinc-700 [&_li]:ml-5 [&_li]:list-disc [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm [&_td]:border [&_td]:border-zinc-200 [&_td]:p-1.5 [&_th]:border [&_th]:border-zinc-200 [&_th]:bg-zinc-100 [&_th]:p-1.5 [&_th]:text-left dark:[&_td]:border-zinc-700 dark:[&_th]:border-zinc-700 dark:[&_th]:bg-zinc-800 [&_a]:text-blue-700 [&_a]:underline">
        <h1 className="text-2xl font-bold">{board.title}</h1>
        {/* Safe: boardBodyHtml escapes every user-entered string before building the markup. */}
        <div dangerouslySetInnerHTML={{ __html: boardBodyHtml(board) }} />
      </article>
    </div>
  );
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function escapeText(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
