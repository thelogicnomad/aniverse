'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import AnimeCard from '@/components/ui/AnimeCard';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import type { AnimeCard as AnimeCardType } from '@/types/anime';

interface AnimeRowProps {
  title: string;
  animes: AnimeCardType[];
  isLoading?: boolean;
  viewAllHref?: string;
  count?: number;
}

export default function AnimeRow({ title, animes, isLoading, viewAllHref, count = 12 }: AnimeRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 280, behavior: 'smooth' });
    }
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="w-1 h-5 bg-primary rounded-full inline-block" />
          {title}
        </h2>
        <div className="flex items-center gap-2">
          {viewAllHref && (
            <Link href={viewAllHref} className="text-sm text-gray-400 hover:text-primary transition-colors flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
          <div className="hidden sm:flex gap-1">
            <button onClick={() => scroll(-1)} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => scroll(1)} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 7 }).map((_, i) => <SkeletonCard key={i} className="w-36 shrink-0" />)}
        </div>
      ) : (
        <div ref={scrollRef} className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
          {animes.slice(0, count).map((anime, i) => (
            <div key={`${anime.id}-${i}`} className="w-36 sm:w-40 shrink-0">
              <AnimeCard {...anime} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
