import { newId } from "./storage";
import type { Board, Severity } from "./types";

export function newBoard(title: string, severity: Severity, incidentStart: string): Board {
  const now = Date.now();
  return {
    id: newId(),
    title,
    incidentId: "",
    severity,
    status: "draft",
    owner: "",
    audience: "",
    incidentStart,
    detectedAt: "",
    mitigatedAt: "",
    incidentEnd: "",
    impact: "",
    summary: "",
    factors: [],
    notes: [],
    actions: [],
    createdAt: now,
    updatedAt: now,
  };
}

/** Minutes from a to b, or null if either is missing or invalid. */
export function minutesBetween(a: string, b: string): number | null {
  if (!a || !b) return null;
  const diff = (new Date(b).getTime() - new Date(a).getTime()) / 60000;
  return Number.isFinite(diff) ? Math.round(diff) : null;
}

export function formatMinutes(m: number | null): string {
  if (m === null) return "—";
  if (Math.abs(m) < 60) return `${m}m`;
  const h = Math.floor(Math.abs(m) / 60) * Math.sign(m);
  return `${h}h ${Math.abs(m) % 60}m`;
}

/** Standard incident metrics derived from the timestamps. */
export function metrics(b: Board) {
  return {
    timeToDetect: minutesBetween(b.incidentStart, b.detectedAt),
    timeToMitigate: minutesBetween(b.incidentStart, b.mitigatedAt),
    duration: minutesBetween(b.incidentStart, b.incidentEnd),
  };
}
