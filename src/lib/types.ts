export type ColumnId = "timeline" | "went_well" | "went_wrong" | "lucky" | "actions";

export const COLUMNS: { id: ColumnId; title: string; hint: string }[] = [
  { id: "timeline", title: "Timeline", hint: "What happened, and when" },
  { id: "went_well", title: "What went well", hint: "Things that helped" },
  { id: "went_wrong", title: "What went wrong", hint: "Things that hurt or slowed us down" },
  { id: "lucky", title: "Where we got lucky", hint: "Things that could have been worse" },
  { id: "actions", title: "Action items", hint: "Follow-ups with an owner" },
];

export type Note = {
  id: string;
  column: ColumnId;
  text: string;
  votes: number;
  /** Timeline: time of the event. Actions: owner. */
  meta?: string;
  /** Action items only. */
  done?: boolean;
  createdAt: number;
};

export type Board = {
  id: string;
  title: string;
  incidentDate: string;
  severity: "SEV1" | "SEV2" | "SEV3" | "SEV4";
  summary: string;
  notes: Note[];
  createdAt: number;
  updatedAt: number;
};
