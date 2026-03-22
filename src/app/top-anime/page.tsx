'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Trophy, Star, Tv, Clock } from 'lucide-react';
import { useCategoryAnimes } from '@/hooks/useAnime';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import AnimeCard from '@/components/ui/AnimeCard';
import Pagination from '@/components/ui/Pagination';
import { cn } from '@/lib/utils';

const TABS = [
  { label: 'Top Airing', value: 'top-airing' },
  { label: 'Most Popular', value: 'most-popular' },
  { label: 'Most Favorite', value: 'most-favorite' },
  { label: 'Top Upcoming', value: 'top-upcoming' },
  { label: 'Completed', value: 'completed' },
];

function RankBadge({ rank }: { rank: number }) {
  const colors = ['bg-yellow-500 text-black', 'bg-gray-300 text-black', 'bg-amber-600 text-white'];
  return (
    <div className={cn(
      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0',
      rank <= 3 ? colors[rank - 1] : 'bg-white/10 text-gray-300'
    )}>
      {rank <= 3 ? <Trophy className="w-4 h-4" /> : rank}
    </div>
  );
}

export default function TopAnimePage() {
  const [activeTab, setActiveTab] = useState('top-airing');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useCategoryAnimes(activeTab, page);

  const switchTab = (val: string) => { setActiveTab(val); setPage(1); };

  return (
    <div className="pt-24 min-h-screen container mx-auto px-4 pb-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
          <Trophy className="w-7 h-7 text-yellow-500" /> Top Anime
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto scrollbar-hide pb-1">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => switchTab(tab.value)}
            className={cn(
              'text-sm px-4 py-2 rounded-xl border font-medium shrink-0 transition-all',
              activeTab === tab.value
                ? 'bg-primary border-primary text-white shadow-lg shadow-primary/25'
                : 'bg-card border-border text-gray-400 hover:border-primary hover:text-white'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {Array.from({ length: 20 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {data?.animes.map((anime, i) => (
              <AnimeCard key={anime.id} {...anime} rank={(page - 1) * 24 + i + 1} />
            ))}
          </div>

          {data && data.totalPages > 1 && (
            <Pagination
              currentPage={data.currentPage}
              totalPages={Math.min(data.totalPages, 100)}
              onPageChange={(p) => { setPage(p); window.scrollTo(0, 0); }}
            />
          )}
        </>
      )}
    </div>
  );
}
