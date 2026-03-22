'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Play, Plus, Check, Star, Clock, Tv } from 'lucide-react';
import { useWatchlistStore } from '@/store/watchlist';
import { cn, truncate } from '@/lib/utils';
import type { AnimeCard as AnimeCardType } from '@/types/anime';

interface AnimeCardProps extends AnimeCardType {
  description?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function AnimeCard({
  id, name, poster, type, rating, episodes, duration, description, rank, className, size = 'md',
}: AnimeCardProps) {
  const router = useRouter();
  const [imgError, setImgError] = useState(false);
  const { isInWatchlist, add, remove } = useWatchlistStore();
  const inWatchlist = isInWatchlist(id);

  const toggleWatchlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWatchlist) {
      remove(id);
    } else {
      add({ id, name, poster, type, episodes: episodes ? { sub: episodes.sub ?? null, dub: episodes.dub ?? null } : undefined, status: 'plan-to-watch' });
    }
  };

  const handleWatchClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/anime/${id}`);
  };

  return (
    <Link href={`/anime/${id}`} className={cn('group block', className)}>
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        className="relative bg-card border border-border rounded-xl overflow-hidden cursor-pointer"
      >
        {/* Poster */}
        <div className="relative overflow-hidden bg-card aspect-[2/3]">
          {!imgError ? (
            <Image
              src={poster}
              alt={name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-card">
              <Tv className="w-8 h-8 text-gray-600" />
            </div>
          )}

          {/* Rank badge */}
          {rank && (
            <div className="absolute top-2 left-2 bg-primary text-white text-xs font-bold px-1.5 py-0.5 rounded">
              #{rank}
            </div>
          )}

          {/* Type badge */}
          {type && (
            <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded backdrop-blur-sm">
              {type}
            </div>
          )}

          {/* Hover Overlay — uses buttons/divs only, NO nested <a> */}
          <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-3">
            <div>
              {description && (
                <p className="text-xs text-gray-300 leading-relaxed line-clamp-4">
                  {truncate(description, 120)}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleWatchClick}
                className="flex-1 flex items-center justify-center gap-1 bg-primary hover:bg-primary/90 text-white text-xs font-semibold py-1.5 rounded-lg transition-colors"
              >
                <Play className="w-3 h-3 fill-white" /> Watch
              </button>
              <button
                onClick={toggleWatchlist}
                className={cn(
                  'p-1.5 rounded-lg transition-colors border text-xs',
                  inWatchlist
                    ? 'bg-primary/20 border-primary text-primary'
                    : 'bg-white/10 border-border text-gray-300 hover:border-primary hover:text-primary'
                )}
              >
                {inWatchlist ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="p-2.5">
          <p className="text-sm font-medium text-white leading-tight line-clamp-1 mb-1.5 group-hover:text-primary transition-colors">
            {name}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            {rating && (
              <span className="flex items-center gap-0.5 text-xs text-yellow-400">
                <Star className="w-2.5 h-2.5 fill-current" /> {rating}
              </span>
            )}
            {episodes?.sub != null && (
              <span className="text-xs bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-1.5 py-0.5 rounded-full leading-none">
                Sub {episodes.sub}
              </span>
            )}
            {episodes?.dub != null && episodes.dub > 0 && (
              <span className="text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30 px-1.5 py-0.5 rounded-full leading-none">
                Dub {episodes.dub}
              </span>
            )}
            {duration && (
              <span className="text-xs text-gray-500 flex items-center gap-0.5 ml-auto">
                <Clock className="w-2.5 h-2.5" /> {duration.replace('m', 'min')}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
