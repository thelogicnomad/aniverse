'use client';

import { useState } from 'react';
import { useCategoryAnimes } from '@/hooks/useAnime';
import AnimeCard from '@/components/ui/AnimeCard';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import Pagination from '@/components/ui/Pagination';

interface CategoryPageProps {
  category: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

export default function CategoryPage({ category, title, description, icon }: CategoryPageProps) {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useCategoryAnimes(category, page);

  return (
    <div className="pt-24 min-h-screen container mx-auto px-4 pb-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
          {icon}
          {title}
        </h1>
        {description && <p className="text-gray-400 text-sm">{description}</p>}
        {data && <p className="text-gray-500 text-sm mt-1">Page {data.currentPage} of {data.totalPages}</p>}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {Array.from({ length: 24 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {data?.animes.map((a) => <AnimeCard key={a.id} {...a} />)}
        </div>
      )}

      {data && data.totalPages > 1 && (
        <Pagination
          currentPage={data.currentPage}
          totalPages={Math.min(data.totalPages, 100)}
          onPageChange={(p) => { setPage(p); window.scrollTo(0, 0); }}
        />
      )}
    </div>
  );
}
