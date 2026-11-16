import type { Board } from "./types";

/** Everything that must be true before a postmortem can be published. */
export function publishProblems(b: Board): string[] {
  const p: string[] = [];
  if (!b.owner.trim()) p.push("Set an owner: one person accountable for the postmortem.");
  if (!b.audience.trim()) p.push("Set the audience: who should read this.");
  if (!b.incidentStart) p.push("Set when the incident started.");
  if (!b.detectedAt) p.push("Set when the incident was detected.");
  if (!b.mitigatedAt) p.push("Set when impact was mitigated.");
  if (!b.incidentEnd) p.push("Set when the incident ended.");

  const t = (s: string) => new Date(s).getTime();
  if (b.incidentStart && b.detectedAt && t(b.detectedAt) < t(b.incidentStart)) p.push("Detection is before the incident start.");
  if (b.detectedAt && b.mitigatedAt && t(b.mitigatedAt) < t(b.detectedAt)) p.push("Mitigation is before detection.");
  if (b.mitigatedAt && b.incidentEnd && t(b.incidentEnd) < t(b.mitigatedAt)) p.push("The incident ended before it was mitigated.");

  if (!b.impact.trim()) p.push("Describe the impact: users, revenue, teams.");
  if (!b.summary.trim()) p.push("Write an executive summary.");

  if (b.factors.length === 0) p.push("Add at least one contributing factor.");
  b.factors.forEach((f, i) => {
    if (!f.category) p.push(`Contributing factor ${i + 1}: pick a category.`);
    if (!f.text.trim()) p.push(`Contributing factor ${i + 1}: describe it.`);
  });

  if (b.actions.length === 0) p.push("Add at least one action item.");
  b.actions.forEach((a, i) => {
    const n = `Action item ${i + 1}`;
    if (!a.text.trim()) p.push(`${n}: describe the change.`);
    if (!a.type) p.push(`${n}: pick a type (prevent, mitigate, detect, repair, investigate).`);
    if (!a.priority) p.push(`${n}: pick a priority.`);
    if (!a.owner.trim()) p.push(`${n}: set an owner.`);
    if (!/^https?:\/\//.test(a.trackingLink)) p.push(`${n}: add a tracking link starting with https://.`);
    if (!a.endState.trim()) p.push(`${n}: write a measurable end state.`);
  });

  return p;
}

const BLAME_PATTERNS: { pattern: RegExp; advice: string }[] = [
  { pattern: /\byou(r)?\b/i, advice: "Second person points at someone. Describe the system or decision instead." },
  { pattern: /\bshould(n't| not)? have\b|\bshould've\b/i, advice: "Say what the system allowed and why that seemed right at the time." },
  { pattern: /\bhuman error\b|\bmistake\b|\bcareless\w*|\bnegligen\w*|\bforgot\b|\bfault\b|\bto blame\b/i, advice: "Blame-oriented wording. Name the condition that let the error happen." },
  { pattern: /\bfailed to\b|\bdidn'?t\b/i, advice: "Reads as a missed action by a person. Say what the system did and what it lacked." },
  { pattern: /\bimprove\b|\bbetter\b|\bmake sure\b|\bbe careful\b/i, advice: "Vague. Use a measurable, verifiable end state." },
];

export type BlamelessWarning = { where: string; phrase: string; advice: string };

/** Rule-based check for blame-oriented wording. Suggests, never edits. */
export function blamelessWarnings(b: Board): BlamelessWarning[] {
  const fields: { where: string; text: string }[] = [
    { where: "Summary", text: b.summary },
    { where: "Impact", text: b.impact },
    ...b.factors.map((f) => ({ where: "Contributing factor", text: f.text })),
    ...b.notes.map((n) => ({ where: "Note", text: n.text })),
    ...b.actions.flatMap((a) => [
      { where: "Action item", text: a.text },
      { where: "Action end state", text: a.endState },
    ]),
  ];

  const out: BlamelessWarning[] = [];
  for (const f of fields) {
    for (const { pattern, advice } of BLAME_PATTERNS) {
      const m = f.text.match(pattern);
      if (m) out.push({ where: f.where, phrase: m[0], advice });
    }
  }
  return out;
}
