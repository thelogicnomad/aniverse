'use client';

import { Suspense } from 'react';
import { useHome } from '@/hooks/useAnime';
import HeroCarousel from '@/components/home/HeroCarousel';
import AnimeRow from '@/components/home/AnimeRow';
import ContinueWatching from '@/components/home/ContinueWatching';
import GenreFilter from '@/components/home/GenreFilter';
import { SkeletonHero, SkeletonRow } from '@/components/ui/SkeletonCard';
import AnimeCard from '@/components/ui/AnimeCard';

function Top10Section({ animes }: { animes: { id: string; name: string; poster: string; rank: number; episodes?: { sub?: number | null; dub?: number | null } }[] }) {
  return (
    <section>
      <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
        <span className="w-1 h-5 bg-yellow-500 rounded-full inline-block" />
        Top 10 Today
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {animes.slice(0, 10).map((a) => (
          <AnimeCard key={a.id} {...a} />
        ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  const { data, isLoading } = useHome();

  return (
    <div className="pt-16">
      {isLoading ? <SkeletonHero /> : <HeroCarousel animes={data?.spotlightAnimes ?? []} />}

      <div className="container mx-auto px-4 py-10 space-y-14">
        <ContinueWatching />

        <GenreFilter genres={data?.genres} />

        <AnimeRow
          title="Trending Now"
          animes={data?.trendingAnimes ?? []}
          isLoading={isLoading}
          viewAllHref="/top-anime"
        />

        <AnimeRow
          title="Latest Episodes"
          animes={data?.latestEpisodeAnimes ?? []}
          isLoading={isLoading}
          viewAllHref="/category/recently-updated"
        />

        {data?.top10Animes?.today?.length ? (
          <Top10Section animes={data.top10Animes.today} />
        ) : null}

        <AnimeRow
          title="Top Airing"
          animes={data?.topAiringAnimes ?? []}
          isLoading={isLoading}
          viewAllHref="/top-anime"
        />

        <AnimeRow
          title="Most Popular"
          animes={data?.mostPopularAnimes ?? []}
          isLoading={isLoading}
          viewAllHref="/top-anime"
        />

        <AnimeRow
          title="Most Favorite"
          animes={data?.mostFavoriteAnimes ?? []}
          isLoading={isLoading}
        />

        <AnimeRow
          title="Upcoming Anime"
          animes={data?.topUpcomingAnimes ?? []}
          isLoading={isLoading}
        />

        <AnimeRow
          title="Latest Completed"
          animes={data?.latestCompletedAnimes ?? []}
          isLoading={isLoading}
          viewAllHref="/category/completed"
        />
      </div>
    </div>
  );
}
