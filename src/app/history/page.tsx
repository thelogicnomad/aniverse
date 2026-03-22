'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Clock, Trash2, Play, X } from 'lucide-react';
import { useHistoryStore } from '@/store/history';

function timeAgo(ts: number): string {
  const seconds = Math.floor((Date.now() - ts) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// Group by date
function groupByDate(entries: ReturnType<typeof useHistoryStore.getState>['entries']) {
  const groups: { label: string; entries: typeof entries }[] = [];
  const map = new Map<string, typeof entries>();
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  for (const e of entries) {
    const d = new Date(e.watchedAt).toDateString();
    const label = d === today ? 'Today' : d === yesterday ? 'Yesterday' : new Date(e.watchedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    if (!map.has(label)) map.set(label, []);
    map.get(label)!.push(e);
  }

  map.forEach((entries, label) => groups.push({ label, entries }));
  return groups;
}

export default function HistoryPage() {
  const { entries, removeEntry, clearAll } = useHistoryStore();
  const groups = groupByDate(entries);

  return (
    <div className="pt-24 min-h-screen container mx-auto px-4 pb-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
            <Clock className="w-7 h-7 text-accent" /> Watch History
          </h1>
          <p className="text-gray-400 text-sm">{entries.length} episodes watched</p>
        </div>
        {entries.length > 0 && (
          <button onClick={() => { if (confirm('Clear all history?')) clearAll(); }}
            className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 border border-red-400/30 hover:border-red-400/60 px-4 py-2 rounded-xl transition-colors">
            <Trash2 className="w-4 h-4" /> Clear All
          </button>
        )}
      </div>

      {entries.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-gray-500">
          <Clock className="w-12 h-12 mb-3 opacity-30" />
          <p className="text-lg font-medium">No watch history</p>
          <p className="text-sm mt-1 mb-6">Episodes you watch will appear here</p>
          <Link href="/" className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-xl font-semibold transition-colors">
            Start Watching
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {groups.map((group) => (
            <div key={group.label}>
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-1 h-4 bg-accent rounded-full" />{group.label}
              </h2>
              <div className="space-y-2">
                {group.entries.map((entry) => (
                  <motion.div
                    key={`${entry.episodeId}-${entry.watchedAt}`}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="group flex items-center gap-4 p-3 bg-card border border-border rounded-xl hover:border-primary/50 transition-all"
                  >
                    <Link href={`/anime/${entry.animeId}`} className="w-12 h-16 relative rounded-lg overflow-hidden shrink-0 bg-background">
                      <Image src={entry.animePoster} alt={entry.animeName} fill className="object-cover" sizes="48px" />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link href={`/anime/${entry.animeId}`} className="text-sm font-semibold text-white hover:text-primary transition-colors">
                        {entry.animeName}
                      </Link>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Episode {entry.episodeNumber}{entry.episodeTitle ? `: ${entry.episodeTitle}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-gray-500 hidden sm:block">{timeAgo(entry.watchedAt)}</span>
                      <Link href={`/watch/${encodeURIComponent(entry.episodeId)}`}
                        className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                        <Play className="w-4 h-4" />
                      </Link>
                      <button onClick={() => removeEntry(entry.episodeId)}
                        className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
