# Postmortem app

A postmortem workflow based on the Google SRE Workbook, Ch. 10 (Postmortem Culture).

## What it covers

- **Metadata:** owner, audience, severity, and incident start, detection, mitigation, and end times.
- **Metrics:** time to detect, time to mitigate, and duration, computed from the timestamps.
- **Executive summary and impact.**
- **Contributing factors:** a categorised list, instead of a single root cause.
- **Action items:** each has a type, priority, owner, tracking link, and measurable end state.
- **Brainstorm columns:** timeline, what went well, what went wrong, where we got lucky.
- **Lifecycle:** draft, review, published. Publishing is blocked until the checks pass. Published postmortems are read-only until reopened.
- **Blameless wording check:** flags second person, "should have", blame words, and vague end states. It suggests and never edits.
- **Markdown export** in the template's section order.

## Storage

Boards are stored in the browser's `localStorage` (key `postmortem-boards-v2`). They're per-browser and not shared. Moving to a database means replacing the functions in `src/lib/storage.ts`.

## Checks

- `src/lib/checks.ts`: publish requirements and blameless-wording rules.
- `src/lib/board.ts`: time metrics and the new-board default.
