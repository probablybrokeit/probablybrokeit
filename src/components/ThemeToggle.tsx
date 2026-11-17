"use client";

export function ThemeToggle() {
  function toggle() {
    const isDark = document.documentElement.classList.toggle("dark");
    try {
      localStorage.setItem("theme", isDark ? "dark" : "light");
    } catch {
      // Storage can be blocked; the choice then lasts for this page only.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle dark mode"
      title="Toggle dark mode"
      className="rounded px-2 py-1 text-base hover:bg-zinc-100 dark:hover:bg-zinc-800"
    >
      <span className="dark:hidden" aria-hidden="true">🌙</span>
      <span className="hidden dark:inline" aria-hidden="true">☀️</span>
    </button>
  );
}
