'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface HistoryEntry {
  animeId: string;
  animeName: string;
  animePoster: string;
  episodeId: string;
  episodeNumber: number;
  episodeTitle: string;
  watchedAt: number;
}

interface HistoryStore {
  entries: HistoryEntry[];
  addEntry: (entry: Omit<HistoryEntry, 'watchedAt'>) => void;
  removeEntry: (episodeId: string) => void;
  clearAll: () => void;
  getRecent: (limit?: number) => HistoryEntry[];
}

export const useHistoryStore = create<HistoryStore>()(
  persist(
    (set, get) => ({
      entries: [],
      addEntry: (entry) =>
        set((s) => {
          const filtered = s.entries.filter((e) => e.episodeId !== entry.episodeId);
          return { entries: [{ ...entry, watchedAt: Date.now() }, ...filtered].slice(0, 200) };
        }),
      removeEntry: (episodeId) =>
        set((s) => ({ entries: s.entries.filter((e) => e.episodeId !== episodeId) })),
      clearAll: () => set({ entries: [] }),
      getRecent: (limit = 50) => get().entries.slice(0, limit),
    }),
    { name: 'aniverse-history' }
  )
);
