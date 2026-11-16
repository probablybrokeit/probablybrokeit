"use client";

import { useMemo, useSyncExternalStore } from "react";
import { parseBoards, readRaw, saveBoard, subscribe } from "./storage";
import type { Board } from "./types";

// Server snapshot is null, so the client only reads localStorage after hydration.
const noSnapshot = () => null;

export function useBoards(): { boards: Board[] | null } {
  const raw = useSyncExternalStore(subscribe, readRaw, noSnapshot);
  const boards = useMemo(() => (raw === null ? null : parseBoards(raw)), [raw]);
  return { boards };
}

export function useBoard(id: string) {
  const { boards } = useBoards();
  const board = useMemo(() => boards?.find((b) => b.id === id) ?? null, [boards, id]);
  const ready = boards !== null;

  function update(fn: (b: Board) => Board) {
    if (!board) return;
    saveBoard({ ...fn(board), updatedAt: Date.now() });
  }

  return { board, ready, update };
}
