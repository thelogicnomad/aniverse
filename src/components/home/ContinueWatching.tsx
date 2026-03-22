'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Play, X, Clock } from 'lucide-react';
import { useProgressStore, type ProgressEntry } from '@/store/progress';
import { formatTime } from '@/lib/utils';

export default function ContinueWatching() {
  const [entries, setEntries] = useState<ProgressEntry[]>([]);
  const { getContinueWatching, removeProgress } = useProgressStore();

  useEffect(() => {
    setEntries(getContinueWatching());
  }, [getContinueWatching]);

  if (!entries.length) return null;

  return (
    <section>
      <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
        <span className="w-1 h-5 bg-accent rounded-full inline-block" />
        Continue Watching
      </h2>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
        {entries.map((entry) => {
          const pct = entry.duration > 0 ? Math.min(100, (entry.currentTime / entry.duration) * 100) : 0;
          return (
            <div key={entry.animeId} className="relative w-48 shrink-0 group">
              <Link href={`/watch/${encodeURIComponent(entry.episodeId)}`}>
                <div className="relative aspect-video rounded-xl overflow-hidden bg-card border border-border">
                  <Image src={entry.animePoster} alt={entry.animeName} fill className="object-cover" sizes="192px" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                      <Play className="w-5 h-5 fill-white text-white ml-0.5" />
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                    <div className="h-full bg-primary transition-none" style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <div className="mt-2 px-0.5">
                  <p className="text-sm text-white font-medium truncate">{entry.animeName}</p>
                  <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Ep {entry.episodeNumber} · {formatTime(entry.currentTime)} / {formatTime(entry.duration)}
                  </p>
                </div>
              </Link>
              <button
                onClick={() => { removeProgress(entry.animeId); setEntries(getContinueWatching()); }}
                className="absolute top-1.5 right-1.5 w-5 h-5 bg-black/70 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
