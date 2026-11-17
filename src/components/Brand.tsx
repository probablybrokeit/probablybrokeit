import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Brand() {
  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto flex max-w-7xl items-baseline justify-between gap-4 px-4 py-3">
        <Link href="/" className="font-mono text-lg font-bold tracking-tight">
          probablybrokeit
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-500">Probably broke it. Let&apos;s learn from it.</span>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
