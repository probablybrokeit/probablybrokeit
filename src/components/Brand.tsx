import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Brand() {
  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex flex-col">
          <Link href="/" className="font-mono text-lg font-bold leading-tight tracking-tight">
            probablybrokeit
          </Link>
          <p className="text-xs uppercase tracking-wider text-zinc-500">Blameless incident postmortems</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden text-sm text-zinc-500 sm:inline">Probably broke it. Let&apos;s learn from it.</span>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
