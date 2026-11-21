import { fromGcp, fromGithub, SOURCES, type SourceId } from "@/lib/status-sources";

const ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const source = searchParams.get("source") as SourceId | null;
  const id = searchParams.get("id") ?? "";

  const entry = SOURCES.find((s) => s.id === source);
  if (!entry) return Response.json({ error: "Unknown source." }, { status: 400 });
  if (!ID_PATTERN.test(id)) return Response.json({ error: "Check the incident ID." }, { status: 400 });

  let list: unknown;
  try {
    const res = await fetch(entry.url, { cache: "no-store" });
    if (!res.ok) throw new Error(`status ${res.status}`);
    list = await res.json();
  } catch {
    return Response.json({ error: "Could not reach the status page. Try again later." }, { status: 502 });
  }

  const incident = entry.id === "github" ? fromGithub(list, id) : fromGcp(list, id);
  if (!incident) {
    return Response.json({ error: "No incident with that ID in the provider's recent list." }, { status: 404 });
  }
  return Response.json(incident);
}
