import { formatMinutes, metrics } from "./board";
import { NOTE_COLUMNS, type Board } from "./types";

/** Markdown in the section order of the SRE Workbook postmortem template. */
export function boardToMarkdown(b: Board): string {
  const m = metrics(b);
  const lines: string[] = [];

  lines.push(`# Postmortem: ${b.title}`, "");
  if (b.incidentId) lines.push(`- **Incident ID:** ${b.incidentId}`);
  lines.push(`- **Severity:** ${b.severity}`);
  lines.push(`- **Status:** ${b.status}`);
  lines.push(`- **Owner:** ${b.owner || "—"}`);
  lines.push(`- **Audience:** ${b.audience || "—"}`);
  lines.push(`- **Incident start:** ${b.incidentStart || "—"}`);
  lines.push(`- **Detected:** ${b.detectedAt || "—"} (time to detect: ${formatMinutes(m.timeToDetect)})`);
  lines.push(`- **Mitigated:** ${b.mitigatedAt || "—"} (time to mitigate: ${formatMinutes(m.timeToMitigate)})`);
  lines.push(`- **Ended:** ${b.incidentEnd || "—"} (duration: ${formatMinutes(m.duration)})`, "");

  lines.push("## Executive summary", "", b.summary.trim() || "_Not written yet_", "");
  lines.push("## Impact", "", b.impact.trim() || "_Not written yet_", "");

  lines.push("## Contributing factors", "");
  if (b.factors.length === 0) lines.push("_None_");
  for (const f of b.factors) lines.push(`- **${f.category || "uncategorized"}:** ${f.text}`);
  lines.push("");

  const timeline = b.notes.filter((n) => n.column === "timeline").sort((x, y) => (x.time ?? "").localeCompare(y.time ?? ""));
  lines.push("## Timeline", "");
  if (timeline.length === 0) lines.push("_None_");
  for (const n of timeline) lines.push(`- ${n.time ? `**${n.time}** ` : ""}${n.text}`);
  lines.push("");

  for (const col of NOTE_COLUMNS.filter((c) => c.id !== "timeline")) {
    const notes = b.notes.filter((n) => n.column === col.id).sort((x, y) => y.votes - x.votes);
    lines.push(`## ${col.title}`, "");
    if (notes.length === 0) lines.push("_None_");
    for (const n of notes) lines.push(`- ${n.text}${n.votes ? ` (${n.votes} votes)` : ""}`);
    lines.push("");
  }

  if (b.providerUpdates && b.providerUpdates.length > 0) {
    lines.push("## Provider updates", "", "_Written by the provider, not by the team._", "");
    for (const u of b.providerUpdates) lines.push(`- **${u.time}**${u.status ? ` (${u.status.replace(/_/g, " ")})` : ""} ${u.text}`);
    lines.push("");
  }

  lines.push("## Action items", "");
  if (b.actions.length === 0) lines.push("_None_");
  for (const a of b.actions) {
    const check = a.done ? "x" : " ";
    lines.push(
      `- [${check}] **${a.priority || "P?"}** (${a.type || "untyped"}) ${a.text}`,
      `  - Owner: ${a.owner || "—"}`,
      `  - End state: ${a.endState || "—"}`,
    );
  }
  lines.push("");

  return lines.join("\n");
}
