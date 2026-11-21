import { newBoard } from "./board";
import { newId } from "./storage";
import type { Board } from "./types";

// Public status feeds. The server route fetches these fixed URLs only.
// The user supplies just an incident ID, which is matched inside the list.
export const SOURCES = [
  { id: "github", label: "GitHub Status", url: "https://www.githubstatus.com/api/v2/incidents.json", page: "https://www.githubstatus.com/history" },
  { id: "gcp", label: "Google Cloud", url: "https://status.cloud.google.com/incidents.json", page: "https://status.cloud.google.com/" },
] as const;

export type SourceId = (typeof SOURCES)[number]["id"];

export type ImportedIncident = {
  title: string;
  incidentStart: string;
  incidentEnd: string;
  sourceUrl: string;
  providerImpact: string;
  timeline: { time: string; status: string; text: string }[];
};

type GhUpdate = { body: string; created_at: string; status: string };
type GhIncident = {
  id: string;
  name: string;
  impact: string;
  started_at?: string;
  created_at: string;
  resolved_at: string | null;
  shortlink: string;
  incident_updates: GhUpdate[];
};

type GcpUpdate = { when: string; text: string; status: string };
type GcpIncident = {
  id: string;
  begin: string;
  end?: string;
  service_name: string;
  external_desc: string;
  status_impact: string;
  uri: string;
  updates: GcpUpdate[];
};

export function fromGithub(list: unknown, id: string): ImportedIncident | null {
  const incidents = (list as { incidents?: GhIncident[] })?.incidents ?? [];
  const inc = incidents.find((i) => i.id === id);
  if (!inc) return null;
  return {
    title: inc.name,
    incidentStart: inc.started_at ?? inc.created_at,
    incidentEnd: inc.resolved_at ?? "",
    sourceUrl: inc.shortlink,
    providerImpact: inc.impact,
    timeline: [...inc.incident_updates]
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
      .map((u) => ({ time: u.created_at, status: u.status, text: u.body })),
  };
}

export function fromGcp(list: unknown, id: string): ImportedIncident | null {
  const incidents = Array.isArray(list) ? (list as GcpIncident[]) : [];
  const inc = incidents.find((i) => i.id === id);
  if (!inc) return null;
  return {
    title: `${inc.service_name}: ${inc.external_desc}`.slice(0, 140),
    incidentStart: inc.begin,
    incidentEnd: inc.end ?? "",
    sourceUrl: `https://status.cloud.google.com/${inc.uri}`,
    providerImpact: inc.status_impact,
    timeline: [...inc.updates]
      .sort((a, b) => a.when.localeCompare(b.when))
      .map((u) => ({ time: u.when, status: u.status, text: u.text })),
  };
}

/** "2026-11-19T17:06:26Z" -> "2026-11-19T17:06" in local time, for datetime-local inputs. */
function toLocalInput(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** "2026-11-19T17:06:26Z" -> "2026-11-19 17:06 UTC", for the timeline. */
function toUtcLabel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.toISOString().slice(0, 16).replace("T", " ")} UTC`;
}

/** One-line summary of a provider update: its first sentence, capped in length. */
export function summarizeUpdate(text: string): string {
  const clean = text.replace(/\s+/g, " ").trim();
  const first = clean.split(/(?<=[.!?])\s/)[0] ?? clean;
  return first.length > 220 ? `${first.slice(0, 217)}…` : first;
}

/** A new draft postmortem prefilled from a provider incident. The user writes the analysis. */
export function draftFromIncident(inc: ImportedIncident): Board {
  const board = newBoard(inc.title, "SEV2", toLocalInput(inc.incidentStart));
  return {
    ...board,
    incidentEnd: toLocalInput(inc.incidentEnd),
    summary: `Imported from ${inc.sourceUrl}. Provider impact: "${inc.providerImpact}". Impact on our systems: to be written.`,
    providerUpdates: inc.timeline.map((t) => ({ id: newId(), time: toUtcLabel(t.time), status: t.status, text: t.text })),
  };
}
