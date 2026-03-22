'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Info, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { truncate } from '@/lib/utils';
import type { SpotlightAnime } from '@/types/anime';

export default function HeroCarousel({ animes }: { animes: SpotlightAnime[] }) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);

  const go = useCallback((dir: number) => {
    setDirection(dir);
    setIndex((i) => (i + dir + animes.length) % animes.length);
  }, [animes.length]);

  useEffect(() => {
    if (paused || animes.length === 0) return;
    const t = setInterval(() => go(1), 6000);
    return () => clearInterval(t);
  }, [paused, go, animes.length]);

  if (!animes.length) return null;
  const anime = animes[index];

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? '8%' : '-8%', opacity: 0 }),
    center: { x: 0, opacity: 1, transition: { duration: 0.5, ease: 'easeOut' as const } },
    exit: (d: number) => ({ x: d < 0 ? '8%' : '-8%', opacity: 0, transition: { duration: 0.3 } }),
  };

  return (
    <div
      className="relative w-full h-[70vh] min-h-[500px] overflow-hidden bg-background"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Background image */}
      <AnimatePresence mode="sync" custom={direction}>
        <motion.div
          key={anime.id}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0"
        >
          <Image
            src={anime.poster}
            alt={anime.name}
            fill
            priority
            className="object-cover object-center scale-105"
            sizes="100vw"
          />
          <div className="absolute inset-0 hero-gradient" />
          <div className="absolute inset-0 hero-gradient-bottom" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 h-full flex items-end">
        <div className="container mx-auto px-6 pb-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={anime.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4 }}
              className="max-w-2xl"
            >
              {/* Rank + info */}
              <div className="flex items-center gap-3 mb-3">
                {anime.rank && (
                  <span className="text-xs font-bold bg-primary px-2 py-0.5 rounded text-white">#{anime.rank}</span>
                )}
                <div className="flex gap-1.5">
                  {anime.otherInfo?.slice(0, 3).map((info, i) => (
                    <span key={i} className="text-xs text-gray-300 bg-white/10 px-2 py-0.5 rounded-full">{info}</span>
                  ))}
                </div>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 leading-tight drop-shadow-lg">
                {anime.name}
              </h1>

              {/* Episode badges */}
              <div className="flex gap-2 mb-4">
                {anime.episodes?.sub != null && (
                  <span className="text-xs bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 px-2.5 py-1 rounded-full">
                    SUB {anime.episodes.sub}
                  </span>
                )}
                {anime.episodes?.dub != null && anime.episodes.dub > 0 && (
                  <span className="text-xs bg-purple-500/30 text-purple-300 border border-purple-500/40 px-2.5 py-1 rounded-full">
                    DUB {anime.episodes.dub}
                  </span>
                )}
              </div>

              <p className="text-gray-300 text-sm leading-relaxed mb-6 line-clamp-3">
                {truncate(anime.description ?? '', 200)}
              </p>

              <div className="flex gap-3">
                <Link
                  href={`/anime/${anime.id}`}
                  className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-3 rounded-xl transition-colors shadow-lg shadow-primary/30"
                >
                  <Play className="w-4 h-4 fill-white" /> Watch Now
                </Link>
                <Link
                  href={`/anime/${anime.id}`}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-xl border border-white/20 transition-colors backdrop-blur-sm"
                >
                  <Info className="w-4 h-4" /> Details
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Nav arrows */}
      <button onClick={() => go(-1)} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-sm transition-colors">
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button onClick={() => go(1)} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-sm transition-colors">
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {animes.map((_, i) => (
          <button
            key={i}
            onClick={() => { setDirection(i > index ? 1 : -1); setIndex(i); }}
            className={`transition-all rounded-full ${i === index ? 'bg-primary w-6 h-2' : 'bg-white/30 w-2 h-2 hover:bg-white/60'}`}
          />
        ))}
      </div>
    </div>
  );
}
