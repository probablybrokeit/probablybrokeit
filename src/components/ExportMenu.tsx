"use client";

import { useState } from "react";
import { boardReportHtml, boardStorageHtml, copyForConfluence, download } from "@/lib/export";
import { boardToMarkdown } from "@/lib/markdown";
import type { Board } from "@/lib/types";

const slugOf = (b: Board) => b.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || b.id;

const item = "block w-full px-3 py-1.5 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800";

export function ExportMenu({ board }: { board: Board }) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const slug = slugOf(board);

  function flash(msg: string) {
    setNote(msg);
    setTimeout(() => setNote(""), 2000);
  }

  async function copyRichText() {
    setOpen(false);
    try {
      await copyForConfluence(board);
      flash("Copied");
    } catch {
      flash("Copy failed");
    }
  }

  function exportFile(action: () => void) {
    setOpen(false);
    action();
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="rounded border border-zinc-300 px-3 py-1 text-sm dark:border-zinc-600"
      >
        {note || "Export ▾"}
      </button>
      {open && (
        <div role="menu" className="absolute right-0 z-20 mt-1 w-56 rounded border border-zinc-200 bg-white py-1 shadow-md dark:border-zinc-700 dark:bg-zinc-900">
          <button role="menuitem" className={item} onClick={copyRichText}>Copy as rich text</button>
          <button role="menuitem" className={item} onClick={() => exportFile(() => download(`${slug}.md`, "text/markdown", boardToMarkdown(board)))}>
            Markdown file
          </button>
          <button role="menuitem" className={item} onClick={() => exportFile(() => download(`${slug}.html`, "text/html", boardReportHtml(board)))}>
            HTML report
          </button>
          <button role="menuitem" className={item} onClick={() => exportFile(() => download(`${slug}-confluence.html`, "text/html", boardStorageHtml(board)))}>
            Confluence file
          </button>
          <button role="menuitem" className={item} onClick={() => exportFile(() => download(`${slug}.json`, "application/json", JSON.stringify(board, null, 2)))}>
            JSON backup
          </button>
        </div>
      )}
    </div>
  );
}
