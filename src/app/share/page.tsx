import { Suspense } from "react";
import { ShareClient } from "./ShareClient";

export default function Page() {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-zinc-500">Loading…</p>}>
      <ShareClient />
    </Suspense>
  );
}
