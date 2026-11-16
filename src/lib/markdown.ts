import { COLUMNS, type Board } from "./types";

export function boardToMarkdown(board: Board): string {
  const lines: string[] = [];
  lines.push(`# Postmortem: ${board.title}`, "");
  lines.push(`- **Severity:** ${board.severity}`);
  lines.push(`- **Incident date:** ${board.incidentDate || "unknown"}`, "");
  if (board.summary.trim()) lines.push("## Summary", "", board.summary.trim(), "");

  for (const col of COLUMNS) {
    const notes = board.notes
      .filter((n) => n.column === col.id)
      .sort((a, b) => (col.id === "timeline" ? (a.meta ?? "").localeCompare(b.meta ?? "") : b.votes - a.votes));
    lines.push(`## ${col.title}`, "");
    if (notes.length === 0) lines.push("_None_", "");
    for (const n of notes) {
      if (col.id === "actions") {
        lines.push(`- [${n.done ? "x" : " "}] ${n.text}${n.meta ? ` (owner: ${n.meta})` : ""}`);
      } else if (col.id === "timeline") {
        lines.push(`- ${n.meta ? `**${n.meta}** ` : ""}${n.text}`);
      } else {
        lines.push(`- ${n.text}${n.votes ? ` (${n.votes} votes)` : ""}`);
      }
    }
    lines.push("");
  }
  return lines.join("\n");
}
