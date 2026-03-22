'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Clock, Calendar, ChevronLeft, ChevronRight, Tv } from 'lucide-react';
import { useSchedule } from '@/hooks/useAnime';
import { formatCountdown, cn } from '@/lib/utils';

function getWeekDates(): { date: string; label: string; dayName: string; isToday: boolean }[] {
  const days = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    days.push({
      date: dateStr,
      label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      dayName: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' }),
      isToday: i === 0,
    });
  }
  return days;
}

function Countdown({ seconds }: { seconds: number }) {
  const [remaining, setRemaining] = useState(seconds);
  useEffect(() => {
    if (remaining <= 0) return;
    const t = setInterval(() => setRemaining((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, []);
  if (remaining <= 0) return <span className="text-green-400 text-xs font-medium">Airing Now</span>;
  return <span className="text-xs text-accent font-mono">{formatCountdown(remaining)}</span>;
}

export default function SchedulePage() {
  const days = getWeekDates();
  const [selectedDay, setSelectedDay] = useState(0);
  const { data, isLoading } = useSchedule(days[selectedDay].date);

  const animes = data?.scheduledAnimes ?? [];

  return (
    <div className="pt-24 min-h-screen container mx-auto px-4 pb-16">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
          <Calendar className="w-7 h-7 text-primary" /> Airing Schedule
        </h1>
        <p className="text-gray-400 text-sm">Upcoming episode air times for currently airing anime</p>
      </div>

      {/* Day selector */}
      <div className="flex gap-2 mb-8 overflow-x-auto scrollbar-hide pb-1">
        {days.map((day, i) => (
          <button
            key={day.date}
            onClick={() => setSelectedDay(i)}
            className={cn(
              'flex flex-col items-center px-4 py-3 rounded-xl border shrink-0 transition-all min-w-[80px]',
              selectedDay === i
                ? 'bg-primary border-primary text-white shadow-lg shadow-primary/25'
                : 'bg-card border-border text-gray-400 hover:border-primary hover:text-white'
            )}
          >
            <span className="text-xs font-semibold">{day.dayName}</span>
            <span className="text-sm mt-0.5">{day.label}</span>
          </button>
        ))}
      </div>

      {/* Schedule list */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-20 bg-card border border-border rounded-xl animate-pulse" />
          ))}
        </div>
      ) : animes.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-gray-500">
          <Calendar className="w-12 h-12 mb-3 opacity-30" />
          <p className="text-lg font-medium">No schedule data available</p>
          <p className="text-sm mt-1">Try a different date</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {animes.map((anime, i) => (
            <motion.div
              key={anime.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Link href={`/anime/${anime.id}`}>
                <div className={cn(
                  'flex items-center gap-4 p-4 bg-card border rounded-xl hover:border-primary transition-all group',
                  anime.secondsUntilAiring <= 0 ? 'border-green-500/40' : 'border-border'
                )}>
                  <div className="text-center w-14 shrink-0">
                    <p className="text-sm font-mono font-bold text-white">{anime.time}</p>
                    <p className="text-xs text-gray-500">JST</p>
                  </div>
                  <div className="w-px h-10 bg-border shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white group-hover:text-primary transition-colors truncate">{anime.name}</p>
                    {anime.jname && <p className="text-xs text-gray-500 truncate mt-0.5">{anime.jname}</p>}
                  </div>
                  <div className="shrink-0 text-right">
                    <Countdown seconds={anime.secondsUntilAiring} />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
