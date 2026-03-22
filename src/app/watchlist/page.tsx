'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Bookmark, Trash2, ChevronDown, Play } from 'lucide-react';
import { useWatchlistStore, type WatchStatus, type WatchlistEntry } from '@/store/watchlist';
import { cn } from '@/lib/utils';

const STATUS_TABS: { label: string; value: WatchStatus | 'all'; color: string }[] = [
  { label: 'All', value: 'all', color: 'bg-primary' },
  { label: 'Watching', value: 'watching', color: 'bg-green-500' },
  { label: 'Plan to Watch', value: 'plan-to-watch', color: 'bg-blue-500' },
  { label: 'Completed', value: 'completed', color: 'bg-gray-500' },
  { label: 'On Hold', value: 'on-hold', color: 'bg-yellow-500' },
  { label: 'Dropped', value: 'dropped', color: 'bg-red-500' },
];

const STATUS_OPTIONS: WatchStatus[] = ['watching', 'plan-to-watch', 'completed', 'on-hold', 'dropped'];

function WatchlistCard({ entry, onRemove, onStatusChange }: {
  entry: WatchlistEntry;
  onRemove: () => void;
  onStatusChange: (s: WatchStatus) => void;
}) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group relative bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all"
    >
      <div className="flex gap-3 p-3">
        <Link href={`/anime/${entry.id}`} className="w-16 h-24 relative rounded-lg overflow-hidden shrink-0 bg-background">
          <Image src={entry.poster} alt={entry.name} fill className="object-cover" sizes="64px" />
        </Link>
        <div className="flex-1 min-w-0 py-0.5">
          <Link href={`/anime/${entry.id}`} className="text-sm font-semibold text-white hover:text-primary transition-colors line-clamp-2 block mb-1.5">
            {entry.name}
          </Link>
          {entry.type && <span className="text-xs bg-white/10 text-gray-300 px-2 py-0.5 rounded mr-2">{entry.type}</span>}

          {/* Status dropdown */}
          <div className="relative mt-2">
            <button
              onClick={() => setShowMenu((p) => !p)}
              className="flex items-center gap-1.5 text-xs border border-border rounded-lg px-2.5 py-1.5 text-gray-300 hover:border-primary transition-colors"
            >
              <span className={cn('w-2 h-2 rounded-full', STATUS_TABS.find((t) => t.value === entry.status)?.color ?? 'bg-gray-500')} />
              {STATUS_TABS.find((t) => t.value === entry.status)?.label}
              <ChevronDown className="w-3 h-3 ml-1" />
            </button>
            {showMenu && (
              <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-xl overflow-hidden shadow-2xl z-10 min-w-[140px]">
                {STATUS_OPTIONS.map((s) => (
                  <button key={s} onClick={() => { onStatusChange(s); setShowMenu(false); }}
                    className={cn('w-full text-left text-xs px-3 py-2 hover:bg-white/10 transition-colors flex items-center gap-2',
                      entry.status === s && 'text-primary')}>
                    <span className={cn('w-1.5 h-1.5 rounded-full', STATUS_TABS.find((t) => t.value === s)?.color)} />
                    {STATUS_TABS.find((t) => t.value === s)?.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1.5 shrink-0">
          <Link href={`/anime/${entry.id}`}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
            <Play className="w-4 h-4" />
          </Link>
          <button onClick={onRemove}
            className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function WatchlistPage() {
  const [activeTab, setActiveTab] = useState<WatchStatus | 'all'>('all');
  const { items, remove, updateStatus, getAll, getByStatus } = useWatchlistStore();

  const list = activeTab === 'all' ? getAll() : getByStatus(activeTab);
  const counts = STATUS_OPTIONS.reduce((acc, s) => ({ ...acc, [s]: getByStatus(s).length }), {} as Record<WatchStatus, number>);

  return (
    <div className="pt-24 min-h-screen container mx-auto px-4 pb-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
          <Bookmark className="w-7 h-7 text-primary" /> My Watchlist
        </h1>
        <p className="text-gray-400 text-sm">{getAll().length} anime in your list</p>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide pb-1">
        {STATUS_TABS.map((tab) => {
          const count = tab.value === 'all' ? getAll().length : counts[tab.value as WatchStatus] ?? 0;
          return (
            <button key={tab.value} onClick={() => setActiveTab(tab.value)}
              className={cn('flex items-center gap-2 text-sm px-4 py-2 rounded-xl border shrink-0 transition-all',
                activeTab === tab.value ? 'bg-primary border-primary text-white' : 'bg-card border-border text-gray-400 hover:border-primary hover:text-white')}>
              {tab.label}
              <span className={cn('text-xs px-1.5 py-0.5 rounded-full font-mono',
                activeTab === tab.value ? 'bg-white/20' : 'bg-white/10')}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {list.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-gray-500">
          <Bookmark className="w-12 h-12 mb-3 opacity-30" />
          <p className="text-lg font-medium">No anime here yet</p>
          <p className="text-sm mt-1 mb-6">Browse and add anime to your watchlist</p>
          <Link href="/" className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-xl font-semibold transition-colors">
            Discover Anime
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {list.map((entry) => (
            <WatchlistCard
              key={entry.id}
              entry={entry}
              onRemove={() => remove(entry.id)}
              onStatusChange={(s) => updateStatus(entry.id, s)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
