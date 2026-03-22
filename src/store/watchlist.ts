'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type WatchStatus = 'watching' | 'plan-to-watch' | 'completed' | 'on-hold' | 'dropped';

export interface WatchlistEntry {
  id: string;
  name: string;
  poster: string;
  type?: string;
  episodes?: { sub?: number | null; dub?: number | null };
  status: WatchStatus;
  addedAt: number;
}

interface WatchlistStore {
  items: Record<string, WatchlistEntry>;
  add: (anime: Omit<WatchlistEntry, 'addedAt'>) => void;
  remove: (id: string) => void;
  updateStatus: (id: string, status: WatchStatus) => void;
  isInWatchlist: (id: string) => boolean;
  getStatus: (id: string) => WatchStatus | null;
  getByStatus: (status: WatchStatus) => WatchlistEntry[];
  getAll: () => WatchlistEntry[];
}

export const useWatchlistStore = create<WatchlistStore>()(
  persist(
    (set, get) => ({
      items: {},
      add: (anime) =>
        set((s) => ({ items: { ...s.items, [anime.id]: { ...anime, addedAt: Date.now() } } })),
      remove: (id) =>
        set((s) => { const { [id]: _, ...rest } = s.items; return { items: rest }; }),
      updateStatus: (id, status) =>
        set((s) => ({ items: { ...s.items, [id]: { ...s.items[id], status } } })),
      isInWatchlist: (id) => !!get().items[id],
      getStatus: (id) => get().items[id]?.status ?? null,
      getByStatus: (status) => Object.values(get().items).filter((i) => i.status === status),
      getAll: () => Object.values(get().items).sort((a, b) => b.addedAt - a.addedAt),
    }),
    { name: 'aniverse-watchlist' }
  )
);
