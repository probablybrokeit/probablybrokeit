import { Suspense } from "react";
import { DocClient } from "./DocClient";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-zinc-500">Loading…</p>}>
      <DocRoute params={params} />
    </Suspense>
  );
}

async function DocRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DocClient id={id} />;
}
