import { newId } from "./storage";
import { SEVERITIES, type ActionItem, type Board, type Factor, type Note, type ProviderUpdate } from "./types";

const str = (v: unknown) => (typeof v === "string" ? v : "");
const bool = (v: unknown) => v === true;
const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : 0);
const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null;

/**
 * Turns an exported postmortem (JSON) into a new board with fresh IDs.
 * Returns null when the file doesn't look like a postmortem.
 */
export function parseBoard(raw: unknown): Board | null {
  if (!isObj(raw)) return null;
  const title = str(raw.title).trim();
  if (!title || !Array.isArray(raw.notes) || !Array.isArray(raw.factors) || !Array.isArray(raw.actions)) return null;

  const now = Date.now();
  const severity = (SEVERITIES as readonly string[]).includes(str(raw.severity))
    ? (raw.severity as Board["severity"])
    : "SEV2";

  const factors: Factor[] = raw.factors.filter(isObj).map((f) => ({
    id: newId(),
    category: str(f.category) as Factor["category"],
    text: str(f.text),
  }));

  const notes: Note[] = raw.notes.filter(isObj).map((n) => ({
    id: newId(),
    column: str(n.column) as Note["column"],
    text: str(n.text),
    votes: num(n.votes),
    time: str(n.time) || undefined,
    createdAt: now,
  }));

  const actions: ActionItem[] = raw.actions.filter(isObj).map((a) => ({
    id: newId(),
    text: str(a.text),
    type: str(a.type) as ActionItem["type"],
    priority: str(a.priority) as ActionItem["priority"],
    owner: str(a.owner),
    endState: str(a.endState),
    done: bool(a.done),
    createdAt: now,
  }));

  const providerUpdates: ProviderUpdate[] = Array.isArray(raw.providerUpdates)
    ? raw.providerUpdates.filter(isObj).map((u) => ({ id: newId(), time: str(u.time), status: str(u.status), text: str(u.text) }))
    : [];

  return {
    id: newId(),
    title,
    incidentId: str(raw.incidentId),
    severity,
    status: raw.status === "published" ? "published" : "draft",
    owner: str(raw.owner),
    audience: str(raw.audience),
    incidentStart: str(raw.incidentStart),
    detectedAt: str(raw.detectedAt),
    mitigatedAt: str(raw.mitigatedAt),
    incidentEnd: str(raw.incidentEnd),
    impact: str(raw.impact),
    summary: str(raw.summary),
    factors,
    notes,
    providerUpdates,
    actions,
    createdAt: now,
    updatedAt: now,
  };
}

/** "Title", then "Title (1)", "Title (2)", ... if the title is already taken. */
export function uniqueTitle(title: string, taken: string[]): string {
  if (!taken.includes(title)) return title;
  for (let i = 1; ; i++) {
    const candidate = `${title} (${i})`;
    if (!taken.includes(candidate)) return candidate;
  }
}
