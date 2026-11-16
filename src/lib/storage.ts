import type { Board } from "./types";

// Local-first storage. Swap these functions for API calls when a backend is added.
const KEY = "postmortem-boards-v1";
const CHANGE_EVENT = "postmortem-storage-change";

export function readRaw(): string {
  if (typeof window === "undefined") return "[]";
  return window.localStorage.getItem(KEY) ?? "[]";
}

export function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

export function parseBoards(raw: string): Board[] {
  try {
    return JSON.parse(raw) as Board[];
  } catch {
    return [];
  }
}

function writeAll(boards: Board[]) {
  window.localStorage.setItem(KEY, JSON.stringify(boards));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function saveBoard(board: Board) {
  const others = parseBoards(readRaw()).filter((b) => b.id !== board.id);
  writeAll([...others, board]);
}

export function deleteBoard(id: string) {
  writeAll(parseBoards(readRaw()).filter((b) => b.id !== id));
}

export function newId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}
