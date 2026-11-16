import { Suspense } from "react";
import { BoardClient } from "./BoardClient";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-zinc-500">Loading…</p>}>
      <BoardRoute params={params} />
    </Suspense>
  );
}

async function BoardRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BoardClient id={id} />;
}
