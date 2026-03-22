'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Play, Plus, Check, Star, Clock, Calendar, Tv, ChevronDown, ChevronUp, BookmarkPlus } from 'lucide-react';
import { useAnimeInfo, useEpisodes } from '@/hooks/useAnime';
import { useWatchlistStore } from '@/store/watchlist';
import EpisodeList from '@/components/ui/EpisodeList';
import AnimeCard from '@/components/ui/AnimeCard';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import { cn } from '@/lib/utils';

export default function AnimePage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useAnimeInfo(id);
  const { data: episodesData, isLoading: epLoading } = useEpisodes(id);
  const [expandDesc, setExpandDesc] = useState(false);
  const [activeSeason, setActiveSeason] = useState(0);
  const { isInWatchlist, add, remove, getStatus } = useWatchlistStore();
  const inWatchlist = isInWatchlist(id);

  const info = data?.anime?.info;
  const moreInfo = data?.anime?.moreInfo;
  const seasons = data?.seasons ?? [];
  const related = data?.relatedAnimes ?? [];
  const recommended = data?.recommendedAnimes ?? [];

  if (isLoading) {
    return (
      <div className="pt-16">
        <div className="h-72 animate-pulse bg-card" />
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-4 gap-6">
            <div className="aspect-[2/3] bg-white/5 rounded-xl animate-pulse" />
            <div className="col-span-3 space-y-4">
              <div className="h-8 bg-white/5 rounded animate-pulse w-2/3" />
              <div className="h-4 bg-white/5 rounded animate-pulse w-1/2" />
              <div className="h-20 bg-white/5 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!info) return <div className="pt-32 text-center text-gray-400">Anime not found</div>;

  const firstEpId = episodesData?.episodes?.[0]?.episodeId;

  return (
    <div className="pt-16 min-h-screen">
      {/* Banner */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <Image src={info.poster} alt={info.name} fill className="object-cover blur-sm scale-105 brightness-50" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      </div>

      <div className="container mx-auto px-4">
        {/* Main info */}
        <div className="relative -mt-32 md:-mt-40 flex gap-6 flex-col sm:flex-row">
          {/* Poster */}
          <div className="w-36 sm:w-48 shrink-0 rounded-xl overflow-hidden border-2 border-border shadow-2xl self-start">
            <Image src={info.poster} alt={info.name} width={192} height={288} className="object-cover w-full" />
          </div>

          {/* Info */}
          <div className="flex-1 pt-2 sm:pt-8">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">{info.name}</h1>
            {moreInfo?.japanese && <p className="text-sm text-gray-400 mb-3">{moreInfo.japanese as string}</p>}

            {/* Stats row */}
            <div className="flex flex-wrap gap-3 mb-4 text-sm">
              {info.stats?.rating && (
                <span className="flex items-center gap-1 text-yellow-400">
                  <Star className="w-3.5 h-3.5 fill-current" /> {info.stats.rating}
                </span>
              )}
              {info.stats?.type && <span className="text-gray-300 bg-white/10 px-2 py-0.5 rounded">{info.stats.type}</span>}
              {info.stats?.duration && (
                <span className="text-gray-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {info.stats.duration}
                </span>
              )}
              {moreInfo?.aired && (
                <span className="text-gray-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> {moreInfo.aired as string}
                </span>
              )}
              {moreInfo?.status && (
                <span className={cn(
                  'px-2 py-0.5 rounded text-xs font-medium',
                  (moreInfo.status as string).toLowerCase().includes('air')
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-gray-500/20 text-gray-400'
                )}>
                  {moreInfo.status as string}
                </span>
              )}
            </div>

            {/* Genres */}
            {moreInfo?.genres?.length && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {(moreInfo.genres as string[]).map((g) => (
                  <Link key={g} href={`/genre/${g.toLowerCase().replace(/ /g, '-')}`}
                    className="text-xs px-2.5 py-1 rounded-full bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 transition-colors">
                    {g}
                  </Link>
                ))}
              </div>
            )}

            {/* Description */}
            <div className="mb-4">
              <p className={cn('text-sm text-gray-300 leading-relaxed', !expandDesc && 'line-clamp-3')}>
                {info.description}
              </p>
              {info.description?.length > 200 && (
                <button onClick={() => setExpandDesc((p) => !p)} className="text-xs text-primary hover:text-primary/80 mt-1 flex items-center gap-1">
                  {expandDesc ? <><ChevronUp className="w-3 h-3" /> Less</> : <><ChevronDown className="w-3 h-3" /> More</>}
                </button>
              )}
            </div>

            {/* Studio */}
            {moreInfo?.studios && (
              <p className="text-sm text-gray-400 mb-4">
                Studio: <span className="text-white">{moreInfo.studios as string}</span>
              </p>
            )}

            {/* CTAs */}
            <div className="flex flex-wrap gap-3">
              {firstEpId && (
                <Link href={`/watch/${encodeURIComponent(firstEpId)}`}
                  className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-lg shadow-primary/25">
                  <Play className="w-4 h-4 fill-white" /> Watch Now
                </Link>
              )}
              <button
                onClick={() => {
                  if (inWatchlist) remove(id);
                  else add({ id, name: info.name, poster: info.poster, type: info.stats?.type, episodes: info.stats?.episodes, status: 'plan-to-watch' });
                }}
                className={cn(
                  'flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold border transition-colors',
                  inWatchlist ? 'bg-primary/20 border-primary text-primary' : 'bg-white/10 border-border text-white hover:border-primary hover:text-primary'
                )}
              >
                {inWatchlist ? <><Check className="w-4 h-4" /> In Watchlist</> : <><BookmarkPlus className="w-4 h-4" /> Add to List</>}
              </button>
            </div>
          </div>
        </div>

        {/* Seasons tabs */}
        {seasons.length > 1 && (
          <div className="mt-8">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Seasons</h3>
            <div className="flex gap-2 flex-wrap">
              {seasons.map((s, i) => (
                <Link key={s.id} href={`/anime/${s.id}`}
                  className={cn('text-sm px-3 py-1.5 rounded-lg border transition-colors', s.isCurrent ? 'bg-primary border-primary text-white' : 'border-border text-gray-400 hover:text-white hover:border-primary')}>
                  {s.name || s.title}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Episodes */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Tv className="w-4 h-4 text-primary" />
              Episodes ({episodesData?.totalEpisodes ?? 0})
            </h2>
            {epLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-10 bg-white/5 rounded-lg animate-pulse" />)}
              </div>
            ) : (
              <EpisodeList episodes={episodesData?.episodes ?? []} animeId={id} />
            )}
          </div>

          {/* More info sidebar */}
          <div className="space-y-2 text-sm">
            <h3 className="text-base font-bold text-white mb-3">Information</h3>
            {Object.entries(moreInfo ?? {}).filter(([k]) => !['genres'].includes(k)).map(([k, v]) => (
              v ? (
                <div key={k} className="flex gap-3 py-1.5 border-b border-border/50">
                  <span className="text-gray-500 capitalize w-24 shrink-0">{k.replace(/([A-Z])/g, ' $1')}</span>
                  <span className="text-gray-300 flex-1">{Array.isArray(v) ? (v as string[]).join(', ') : String(v)}</span>
                </div>
              ) : null
            ))}
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
              <span className="w-1 h-5 bg-accent rounded-full" /> Related Anime
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {related.map((a) => <AnimeCard key={a.id} {...a} />)}
            </div>
          </div>
        )}

        {/* Recommended */}
        {recommended.length > 0 && (
          <div className="mt-12 mb-16">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
              <span className="w-1 h-5 bg-primary rounded-full" /> Recommended
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {recommended.map((a) => <AnimeCard key={a.id} {...a} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
