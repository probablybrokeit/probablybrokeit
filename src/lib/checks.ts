import type { Board } from "./types";

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
