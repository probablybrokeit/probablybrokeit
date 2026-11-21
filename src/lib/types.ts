export const SEVERITIES = ["SEV1", "SEV2", "SEV3", "SEV4"] as const;
export type Severity = (typeof SEVERITIES)[number];

export const STATUSES = ["draft", "published"] as const;
export type Status = (typeof STATUSES)[number];

// Brainstorm columns (sticky notes).
export type NoteColumnId = "timeline" | "went_well" | "went_wrong" | "lucky";

export const NOTE_COLUMNS: { id: NoteColumnId; title: string; hint: string }[] = [
  { id: "timeline", title: "Timeline", hint: "Events in order. Add the time (UTC)." },
  { id: "went_well", title: "What went well", hint: "Things that helped." },
  { id: "went_wrong", title: "What went wrong", hint: "Systems, gaps and conditions that hurt. Describe the system, not people." },
  { id: "lucky", title: "Where we got lucky", hint: "Things that could have been worse." },
];

export type Note = {
  id: string;
  column: NoteColumnId;
  text: string;
  votes: number;
  /** Timeline notes only: time of the event, free text such as "14:05 UTC". */
  time?: string;
  /** Set on notes copied from a provider's status page. Not checked for blameless wording. */
  source?: "provider";
  createdAt: number;
};

export const ACTION_TYPES = ["prevent", "mitigate", "detect", "repair", "investigate"] as const;
export type ActionType = (typeof ACTION_TYPES)[number];

export const PRIORITIES = ["P0", "P1", "P2", "P3"] as const;
export type Priority = (typeof PRIORITIES)[number];

export const FACTOR_CATEGORIES = ["process", "tooling", "code", "communication", "capacity", "other"] as const;
export type FactorCategory = (typeof FACTOR_CATEGORIES)[number];

export type Factor = {
  id: string;
  category: FactorCategory | "";
  text: string;
};

export type ActionItem = {
  id: string;
  text: string;
  type: ActionType | "";
  priority: Priority | "";
  /** A role or team is preferred over a person. */
  owner: string;
  /** Measurable, verifiable end state. */
  endState: string;
  done: boolean;
  createdAt: number;
};

export type Board = {
  id: string;
  title: string;
  /** Optional ID from your incident tracker, e.g. INC-1234. */
  incidentId?: string;
  severity: Severity;
  status: Status;
  owner: string;
  audience: string;
  /** datetime-local strings ("YYYY-MM-DDTHH:mm") or "". */
  incidentStart: string;
  detectedAt: string;
  mitigatedAt: string;
  incidentEnd: string;
  impact: string;
  summary: string;
  factors: Factor[];
  notes: Note[];
  actions: ActionItem[];
  createdAt: number;
  updatedAt: number;
};
