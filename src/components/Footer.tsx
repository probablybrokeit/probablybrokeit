const linkClass = "underline hover:text-zinc-700 dark:hover:text-zinc-300";

export function Footer() {
  return (
    <footer className="fixed bottom-2 right-3 z-10 flex gap-2 text-[11px] text-zinc-400 dark:text-zinc-500">
      <a href="https://github.com/probablybrokeit/probablybrokeit/issues/new" target="_blank" rel="noopener noreferrer" className={linkClass}>
        feedback
      </a>
      <span aria-hidden="true">·</span>
      <a href="https://www.linkedin.com/in/chetan-sharma-9102505b/" target="_blank" rel="noopener noreferrer" className={linkClass}>
        connect
      </a>
      <span aria-hidden="true">·</span>
      <span title="App version and commit">
        v{process.env.NEXT_PUBLIC_APP_VERSION}
        {process.env.NEXT_PUBLIC_COMMIT ? ` (${process.env.NEXT_PUBLIC_COMMIT})` : ""}
      </span>
    </footer>
  );
}
