import { formatMinutes, metrics } from "./board";
import { boardToMarkdown } from "./markdown";
import { NOTE_COLUMNS, type Board } from "./types";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Escaped text with line breaks kept. */
const multi = (s: string) => esc(s.trim()).split(/\n+/).join("<br />");

const NONE = "<p><em>None</em></p>";

function link(url: string): string {
  return /^https?:\/\//.test(url) ? `<a href="${esc(url)}">${esc(url)}</a>` : esc(url || "—");
}

/**
 * Body HTML using only plain tags (h2, p, ul, table, a), which Confluence's
 * storage format accepts. Used for the Confluence file and the clipboard copy.
 */
export function boardBodyHtml(b: Board): string {
  const m = metrics(b);
  const out: string[] = [];

  out.push("<h2>Details</h2>");
  const rows: [string, string][] = [
    ["Severity", b.severity],
    ["Status", b.status],
    ["Owner", b.owner || "—"],
    ["Audience", b.audience || "—"],
    ["Incident start", b.incidentStart || "—"],
    ["Detected", `${b.detectedAt || "—"} (time to detect: ${formatMinutes(m.timeToDetect)})`],
    ["Mitigated", `${b.mitigatedAt || "—"} (time to mitigate: ${formatMinutes(m.timeToMitigate)})`],
    ["Ended", `${b.incidentEnd || "—"} (duration: ${formatMinutes(m.duration)})`],
  ];
  out.push(`<table><tbody>${rows.map(([k, v]) => `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`).join("")}</tbody></table>`);

  out.push("<h2>Executive summary</h2>", b.summary.trim() ? `<p>${multi(b.summary)}</p>` : "<p><em>Not written yet</em></p>");
  out.push("<h2>Impact</h2>", b.impact.trim() ? `<p>${multi(b.impact)}</p>` : "<p><em>Not written yet</em></p>");

  out.push("<h2>Contributing factors</h2>");
  out.push(
    b.factors.length
      ? `<ul>${b.factors.map((f) => `<li><strong>${esc(f.category || "uncategorized")}:</strong> ${multi(f.text)}</li>`).join("")}</ul>`
      : NONE,
  );

  const timeline = b.notes.filter((n) => n.column === "timeline").sort((x, y) => (x.time ?? "").localeCompare(y.time ?? ""));
  out.push("<h2>Timeline</h2>");
  out.push(
    timeline.length
      ? `<ul>${timeline.map((n) => `<li>${n.time ? `<strong>${esc(n.time)}</strong> ` : ""}${multi(n.text)}</li>`).join("")}</ul>`
      : NONE,
  );

  for (const col of NOTE_COLUMNS.filter((c) => c.id !== "timeline")) {
    const notes = b.notes.filter((n) => n.column === col.id).sort((x, y) => y.votes - x.votes);
    out.push(`<h2>${esc(col.title)}</h2>`);
    out.push(
      notes.length
        ? `<ul>${notes.map((n) => `<li>${multi(n.text)}${n.votes ? ` (${n.votes} votes)` : ""}</li>`).join("")}</ul>`
        : NONE,
    );
  }

  out.push("<h2>Action items</h2>");
  if (b.actions.length === 0) {
    out.push(NONE);
  } else {
    const head = ["Done", "Priority", "Type", "Action", "Owner", "End state", "Tracking"]
      .map((h) => `<th>${h}</th>`)
      .join("");
    const body = b.actions
      .map(
        (a) =>
          `<tr><td>${a.done ? "Yes" : "No"}</td><td>${esc(a.priority || "P?")}</td><td>${esc(a.type || "untyped")}</td>` +
          `<td>${multi(a.text)}</td><td>${esc(a.owner || "—")}</td><td>${multi(a.endState || "—")}</td><td>${link(a.trackingLink)}</td></tr>`,
      )
      .join("");
    out.push(`<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`);
  }

  return out.join("\n");
}

/** Standalone, printable HTML report. Open in a browser and print to PDF. */
export function boardReportHtml(b: Board): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Postmortem: ${esc(b.title)}</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #18181b; max-width: 960px; margin: 40px auto; padding: 0 24px; line-height: 1.5; }
  h1 { font-size: 28px; margin-bottom: 4px; }
  .brand { font-family: ui-monospace, monospace; color: #71717a; font-size: 13px; margin-bottom: 24px; }
  h2 { font-size: 18px; border-bottom: 1px solid #e4e4e7; padding-bottom: 4px; margin-top: 32px; }
  table { border-collapse: collapse; width: 100%; font-size: 14px; }
  th, td { border: 1px solid #e4e4e7; padding: 6px 8px; text-align: left; vertical-align: top; }
  th { background: #f4f4f5; }
  table tbody tr th { width: 180px; }
  a { color: #1d4ed8; }
  @media print { body { margin: 0; } h2 { break-after: avoid; } }
</style>
</head>
<body>
<div class="brand">probablybrokeit</div>
<h1>Postmortem: ${esc(b.title)}</h1>
${boardBodyHtml(b)}
</body>
</html>
`;
}

/** Rich-text clipboard payload: paste into a Confluence page and it keeps formatting. */
export async function copyForConfluence(b: Board): Promise<void> {
  const html = `<h1>${esc(b.title)}</h1>\n${boardBodyHtml(b)}`;
  const plain = boardToMarkdown(b);
  await navigator.clipboard.write([
    new ClipboardItem({
      "text/html": new Blob([html], { type: "text/html" }),
      "text/plain": new Blob([plain], { type: "text/plain" }),
    }),
  ]);
}

export function download(filename: string, mime: string, content: string) {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
