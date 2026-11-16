# Postmortem Board

A small retro-style board for incident postmortems. Create a board per incident, add sticky notes to five columns (Timeline, What went well, What went wrong, Where we got lucky, Action items), vote on notes, and export the result as Markdown.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Notes

- Boards are stored in the browser's `localStorage`. They are per-browser and not shared yet.
- Next step for multi-person use: add a database and API routes in `src/lib/storage.ts`.

## Deploy

Import the repo in Vercel. No environment variables are needed for the current version.
