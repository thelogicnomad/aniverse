'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ProgressEntry {
  animeId: string;
  animeName: string;
  animePoster: string;
  episodeId: string;
  episodeNumber: number;
  episodeTitle: string;
  currentTime: number;
  duration: number;
  updatedAt: number;
}

interface ProgressStore {
  entries: Record<string, ProgressEntry>;
  saveProgress: (episodeId: string, data: Omit<ProgressEntry, 'updatedAt'>) => void;
  getProgress: (episodeId: string) => ProgressEntry | undefined;
  removeProgress: (animeId: string) => void;
  getContinueWatching: () => ProgressEntry[];
  clearAll: () => void;
}

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => ({
      entries: {},
      saveProgress: (episodeId, data) =>
        set((s) => ({
          entries: {
            ...s.entries,
            [data.animeId]: { ...data, episodeId, updatedAt: Date.now() },
          },
        })),
      getProgress: (episodeId) =>
        Object.values(get().entries).find((e) => e.episodeId === episodeId),
      removeProgress: (animeId) =>
        set((s) => {
          const { [animeId]: _, ...rest } = s.entries;
          return { entries: rest };
        }),
      getContinueWatching: () =>
        Object.values(get().entries)
          .filter((e) => e.currentTime > 10 && e.currentTime < e.duration - 30)
          .sort((a, b) => b.updatedAt - a.updatedAt)
          .slice(0, 20),
      clearAll: () => set({ entries: {} }),
    }),
    { name: 'aniverse-progress' }
  )
);
