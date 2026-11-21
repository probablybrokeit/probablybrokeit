import { Suspense } from "react";
import { AutoImport } from "./AutoImport";

// Shareable link: /import/github?id=<incident id>. Opening it imports the incident.
export default function Page({
  params,
  searchParams,
}: {
  params: Promise<{ source: string }>;
  searchParams: Promise<{ id?: string }>;
}) {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-zinc-500">Importing incident…</p>}>
      <ImportRoute params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function ImportRoute({
  params,
  searchParams,
}: {
  params: Promise<{ source: string }>;
  searchParams: Promise<{ id?: string }>;
}) {
  const { source } = await params;
  const { id } = await searchParams;
  return <AutoImport source={source} id={id ?? ""} />;
}
