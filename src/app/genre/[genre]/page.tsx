'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useGenreAnimes } from '@/hooks/useAnime';
import AnimeCard from '@/components/ui/AnimeCard';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import Pagination from '@/components/ui/Pagination';

export default function GenrePage() {
  const { genre } = useParams<{ genre: string }>();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGenreAnimes(genre, page);

  const title = data?.genreName ?? genre.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="pt-24 min-h-screen container mx-auto px-4 pb-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">{title}</h1>
        {data && <p className="text-gray-400 text-sm">Page {data.currentPage} of {data.totalPages}</p>}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {Array.from({ length: 18 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {data?.animes.map((a) => <AnimeCard key={a.id} {...a} />)}
        </div>
      )}

      {data && data.totalPages > 1 && (
        <Pagination currentPage={data.currentPage} totalPages={data.totalPages} onPageChange={(p) => { setPage(p); window.scrollTo(0, 0); }} />
      )}
    </div>
  );
}
