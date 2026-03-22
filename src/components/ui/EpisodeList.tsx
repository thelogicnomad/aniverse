'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Check, AlertCircle, LayoutGrid, List, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Episode } from '@/types/episode';

interface EpisodeListProps {
  episodes: Episode[];
  currentEpisodeId?: string;
  watchedIds?: Set<string>;
  animeId?: string;
  compact?: boolean;
}

const PAGE_SIZE = 100;

export default function EpisodeList({ episodes, currentEpisodeId, watchedIds = new Set(), animeId, compact = false }: EpisodeListProps) {
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [page, setPage] = useState(0);
  const [showAll, setShowAll] = useState(false);

  const filtered = useMemo(() =>
    episodes.filter((ep) =>
      !search ||
      ep.number.toString().includes(search) ||
      ep.title?.toLowerCase().includes(search.toLowerCase())
    ), [episodes, search]);

  const totalChunks = Math.ceil(filtered.length / PAGE_SIZE);
  const chunked = showAll ? filtered : filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="space-y-3">
      {/* Controls */}
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
          <input
            type="text"
            placeholder="Search episodes..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="w-full bg-card border border-border rounded-lg pl-8 pr-3 py-1.5 text-sm text-white placeholder-gray-500 outline-none focus:border-primary transition-colors"
          />
        </div>
        <button onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')} className="p-2 border border-border rounded-lg text-gray-400 hover:text-white hover:border-primary transition-colors">
          {viewMode === 'list' ? <LayoutGrid className="w-4 h-4" /> : <List className="w-4 h-4" />}
        </button>
      </div>

      {/* Chunk Selector */}
      {!search && totalChunks > 1 && (
        <div className="flex flex-wrap gap-1.5">
          {Array.from({ length: totalChunks }).map((_, i) => (
            <button
              key={i}
              onClick={() => { setPage(i); setShowAll(false); }}
              className={cn(
                'text-xs px-2.5 py-1 rounded-lg border transition-colors',
                page === i && !showAll ? 'bg-primary border-primary text-white' : 'border-border text-gray-400 hover:border-primary hover:text-white'
              )}
            >
              {i * PAGE_SIZE + 1}–{Math.min((i + 1) * PAGE_SIZE, filtered.length)}
            </button>
          ))}
        </div>
      )}

      {/* Episode Grid */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-1.5">
          {chunked.map((ep) => {
            const isCurrent = ep.episodeId === currentEpisodeId;
            const isWatched = watchedIds.has(ep.episodeId);
            return (
              <Link
                key={ep.episodeId}
                href={`/watch/${encodeURIComponent(ep.episodeId)}`}
                className={cn(
                  'flex items-center justify-center h-9 rounded-lg text-sm font-medium border transition-all relative',
                  isCurrent ? 'bg-primary border-primary text-white' :
                  isWatched ? 'bg-white/5 border-white/10 text-gray-500' :
                  'bg-card border-border text-gray-300 hover:border-primary hover:text-white',
                  ep.isFiller && 'opacity-60'
                )}
              >
                {isWatched && !isCurrent && <Check className="absolute top-0.5 right-0.5 w-2.5 h-2.5 text-green-400" />}
                {ep.number}
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="space-y-1 max-h-[500px] overflow-y-auto pr-1">
          {chunked.map((ep) => {
            const isCurrent = ep.episodeId === currentEpisodeId;
            const isWatched = watchedIds.has(ep.episodeId);
            return (
              <Link
                key={ep.episodeId}
                href={`/watch/${encodeURIComponent(ep.episodeId)}`}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg border transition-all',
                  isCurrent ? 'bg-primary/20 border-primary/50 text-white' :
                  'bg-card border-transparent hover:border-border hover:bg-card-hover text-gray-300 hover:text-white'
                )}
              >
                <span className={cn('text-xs font-mono w-8 shrink-0', isCurrent ? 'text-primary font-bold' : 'text-gray-500')}>
                  {ep.number}
                </span>
                <span className="flex-1 text-sm truncate">{ep.title || `Episode ${ep.number}`}</span>
                <div className="flex items-center gap-1.5 shrink-0">
                  {ep.isFiller && (
                    <span className="text-[10px] bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 px-1 rounded">
                      Filler
                    </span>
                  )}
                  {isWatched && !isCurrent && <Check className="w-3.5 h-3.5 text-green-400" />}
                  {isCurrent && <span className="text-[10px] bg-primary text-white px-1.5 rounded-full">Playing</span>}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="flex flex-col items-center py-8 text-gray-500">
          <AlertCircle className="w-8 h-8 mb-2" />
          <p className="text-sm">No episodes found</p>
        </div>
      )}
    </div>
  );
}
