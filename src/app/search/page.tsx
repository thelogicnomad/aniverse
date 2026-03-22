'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import { useSearch } from '@/hooks/useAnime';
import AnimeCard from '@/components/ui/AnimeCard';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import Pagination from '@/components/ui/Pagination';
import { GENRES, ANIME_TYPES, ANIME_STATUSES, ANIME_RATINGS, ANIME_SEASONS, SORT_OPTIONS } from '@/lib/constants';
import { cn } from '@/lib/utils';

const TYPE_MAP: Record<string, string> = { TV: 'tv', Movie: 'movie', OVA: 'ova', ONA: 'ona', Special: 'special' };
const STATUS_MAP: Record<string, string> = { 'finished-airing': 'Finished', 'currently-airing': 'Airing', 'not-yet-aired': 'Upcoming' };

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={cn(
      'text-xs px-2.5 py-1 rounded-full border transition-colors',
      active ? 'bg-primary border-primary text-white' : 'border-border text-gray-400 hover:border-primary hover:text-white'
    )}>{label}</button>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [showFilters, setShowFilters] = useState(true);

  const { data, isLoading } = useSearch(query || searchParams.get('q') || '', page, filters);

  const pushQuery = (q: string) => {
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  const toggleFilter = (key: string, val: string) => {
    setFilters((prev) => {
      const next = { ...prev };
      if (next[key] === val) delete next[key];
      else next[key] = val;
      return next;
    });
    setPage(1);
  };

  const toggleGenre = (g: string) => {
    const slug = g.toLowerCase().replace(/ /g, '-');
    setFilters((prev) => {
      const current = prev.genres?.split(',').filter(Boolean) ?? [];
      const next = current.includes(slug) ? current.filter((x) => x !== slug) : [...current, slug];
      const updated = { ...prev };
      if (next.length) updated.genres = next.join(',');
      else delete updated.genres;
      return updated;
    });
    setPage(1);
  };

  const activeGenres = filters.genres?.split(',').filter(Boolean) ?? [];
  const activeFiltersCount = Object.keys(filters).length;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search bar */}
      <form onSubmit={(e) => { e.preventDefault(); pushQuery(query); }} className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search anime titles..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-card border border-border rounded-xl pl-12 pr-12 py-3 text-white placeholder-gray-500 outline-none focus:border-primary transition-colors text-sm"
        />
        {query && (
          <button type="button" onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        )}
      </form>

      <div className="flex gap-6">
        {/* Filters sidebar */}
        <div className={cn('w-56 shrink-0 hidden md:block')}>
          <div className="space-y-5 sticky top-20">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white text-sm">Filters {activeFiltersCount > 0 && <span className="text-primary">({activeFiltersCount})</span>}</h3>
              {activeFiltersCount > 0 && (
                <button onClick={() => setFilters({})} className="text-xs text-gray-400 hover:text-red-400 transition-colors">Clear all</button>
              )}
            </div>

            {/* Sort */}
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Sort By</p>
              <div className="flex flex-col gap-1">
                {SORT_OPTIONS.map((s) => (
                  <FilterChip key={s.value} label={s.label} active={filters.sort === s.value} onClick={() => toggleFilter('sort', s.value)} />
                ))}
              </div>
            </div>

            {/* Type */}
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Type</p>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(TYPE_MAP).map(([label, val]) => (
                  <FilterChip key={val} label={label} active={filters.type === val} onClick={() => toggleFilter('type', val)} />
                ))}
              </div>
            </div>

            {/* Status */}
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Status</p>
              <div className="flex flex-col gap-1">
                {Object.entries(STATUS_MAP).map(([val, label]) => (
                  <FilterChip key={val} label={label} active={filters.status === val} onClick={() => toggleFilter('status', val)} />
                ))}
              </div>
            </div>

            {/* Season */}
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Season</p>
              <div className="flex flex-wrap gap-1.5">
                {ANIME_SEASONS.map((s) => (
                  <FilterChip key={s} label={s.charAt(0).toUpperCase() + s.slice(1)} active={filters.season === s} onClick={() => toggleFilter('season', s)} />
                ))}
              </div>
            </div>

            {/* Genres */}
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Genres</p>
              <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto scrollbar-hide">
                {GENRES.map((g) => {
                  const slug = g.toLowerCase().replace(/ /g, '-');
                  return <FilterChip key={g} label={g} active={activeGenres.includes(slug)} onClick={() => toggleGenre(g)} />;
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 min-w-0">
          {data && (
            <p className="text-sm text-gray-400 mb-4">
              {data.totalPages > 1 ? `Page ${data.currentPage} of ${data.totalPages}` : `${data.animes.length} results`}
              {data.searchQuery && <> for &quot;<span className="text-white">{data.searchQuery}</span>&quot;</>}
            </p>
          )}

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
              {Array.from({ length: 15 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : data?.animes.length === 0 ? (
            <div className="flex flex-col items-center py-20 text-gray-500">
              <Search className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-lg font-medium">No results found</p>
              <p className="text-sm mt-1">Try different keywords or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
              {data?.animes.map((a) => <AnimeCard key={a.id} {...a} />)}
            </div>
          )}

          {data && data.totalPages > 1 && (
            <Pagination currentPage={data.currentPage} totalPages={data.totalPages} onPageChange={(p) => { setPage(p); window.scrollTo(0, 0); }} />
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="pt-24 min-h-screen">
      <Suspense fallback={<div className="container mx-auto px-4 py-8"><div className="h-12 bg-white/5 rounded-xl animate-pulse" /></div>}>
        <SearchContent />
      </Suspense>
    </div>
  );
}
