'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Server, List, X, Play, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { useServers, useEpisodes, useAnimeInfo } from '@/hooks/useAnime';
import { useProgressStore } from '@/store/progress';
import { useHistoryStore } from '@/store/history';
import EpisodeList from '@/components/ui/EpisodeList';
import { cn } from '@/lib/utils';
import type { SubDubCategory, StreamSubtitle, StreamTimestamp } from '@/types/stream';

const VideoPlayer = dynamic(() => import('@/components/ui/VideoPlayer'), {
  ssr: false,
  loading: () => (
    <div className="w-full aspect-video bg-black flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-primary animate-spin" />
    </div>
  ),
});

const PREFERRED_SERVERS = ['hd-1', 'hd-2', 'vidstreaming', 'megacloud', 'streamtape'];

// ─── Imperative stream fetcher — tries each server in order, no React Query ──
interface StreamState {
  streamUrl: string;
  subtitles: StreamSubtitle[];
  intro?: StreamTimestamp;
  outro?: StreamTimestamp;
  isLoading: boolean;
  allFailed: boolean;
  activeServer: string;
}

function useStreamSource(
  episodeId: string,
  availableServers: string[],
  category: SubDubCategory,
  enabled: boolean
) {
  const [state, setState] = useState<StreamState>({
    streamUrl: '', subtitles: [], isLoading: false, allFailed: false, activeServer: '',
  });
  const abortRef = useRef<AbortController | null>(null);

  const tryServers = useCallback(async (servers: string[], signal: AbortSignal) => {
    for (const server of servers) {
      if (signal.aborted) return;
      setState(s => ({ ...s, isLoading: true, activeServer: server }));

      try {
        const url = `/api/proxy/api/stream?id=${encodeURIComponent(episodeId)}&server=${encodeURIComponent(server)}&type=${encodeURIComponent(category)}`;

        const res = await fetch(url, { signal, cache: 'no-store' });

        if (!res.ok) continue;

        const json = await res.json();
        const sl = json?.results?.streamingLink;

        if (!sl?.link?.file) continue;

        const m3u8 = String(sl.link.file);

        if (!m3u8 || signal.aborted) continue;

        const subtitleTracks: StreamSubtitle[] = Array.isArray(sl.tracks)
          ? sl.tracks
              .filter((t: Record<string, unknown>) => t.kind !== 'thumbnails')
              .map((t: Record<string, unknown>) => ({
                lang: String(t.label ?? ''),
                url: String(t.file ?? ''),
              }))
          : [];

        setState({
          streamUrl: m3u8,
          subtitles: subtitleTracks,
          intro: sl.intro ?? undefined,
          outro: sl.outro ?? undefined,
          isLoading: false,
          allFailed: false,
          activeServer: server,
        });
        return;
      } catch (err: unknown) {
        if ((err as Error).name === 'AbortError') return;
      }
    }
    if (!signal.aborted) {
      setState(s => ({ ...s, isLoading: false, allFailed: true }));
    }
  }, [episodeId, category]);

  useEffect(() => {
    if (!enabled || !episodeId || availableServers.length === 0) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setState({ streamUrl: '', subtitles: [], isLoading: true, allFailed: false, activeServer: availableServers[0] });
    // Sort by preference before trying
    const sorted = [
      ...PREFERRED_SERVERS.filter(s => availableServers.includes(s)),
      ...availableServers.filter(s => !PREFERRED_SERVERS.includes(s)),
    ];
    tryServers(sorted, controller.signal);
    return () => { controller.abort(); };
  // availableServers.join is stable unless server list actually changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [episodeId, availableServers.join(','), category, enabled]);

  const retry = useCallback(() => {
    if (!episodeId || availableServers.length === 0) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setState({ streamUrl: '', subtitles: [], isLoading: true, allFailed: false, activeServer: availableServers[0] });
    const sorted = [
      ...PREFERRED_SERVERS.filter(s => availableServers.includes(s)),
      ...availableServers.filter(s => !PREFERRED_SERVERS.includes(s)),
    ];
    tryServers(sorted, controller.signal);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [episodeId, availableServers.join(','), category, tryServers]);

  return { ...state, retry };
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function WatchPage() {
  const params = useParams<{ episodeId: string }>();
  const router = useRouter();
  const episodeId = decodeURIComponent(params.episodeId);
  const animeId = episodeId.split('?')[0];

  const [category, setCategory] = useState<SubDubCategory>('sub');
  const [showEpisodes, setShowEpisodes] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const { data: serversData } = useServers(episodeId);
  const { data: episodesData } = useEpisodes(animeId);
  const { data: animeData } = useAnimeInfo(animeId);
  const { saveProgress, getProgress } = useProgressStore();
  const { addEntry } = useHistoryStore();

  const info = animeData?.anime?.info;
  const episodes = episodesData?.episodes ?? [];
  const currentIdx = episodes.findIndex(e => e.episodeId === episodeId);
  const currentEp = episodes[currentIdx];
  const nextEp = episodes[currentIdx + 1];
  const prevEp = episodes[currentIdx - 1];

  const availableServers = (serversData?.[category] ?? []).map(s => s.serverName);
  const hasDub = (serversData?.dub?.length ?? 0) > 0;
  const hasRaw = (serversData?.raw?.length ?? 0) > 0;

  const { streamUrl, subtitles, intro, outro, isLoading, allFailed, activeServer, retry } =
    useStreamSource(episodeId, availableServers, category, availableServers.length > 0);

  // History
  useEffect(() => {
    if (!currentEp || !info) return;
    addEntry({
      animeId, animeName: info.name, animePoster: info.poster,
      episodeId, episodeNumber: currentEp.number, episodeTitle: currentEp.title,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [episodeId]);

  // Auto-next countdown
  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0 && nextEp) { router.push(`/watch/${encodeURIComponent(nextEp.episodeId)}`); return; }
    const t = setTimeout(() => setCountdown(c => (c ?? 0) - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, nextEp, router]);

  const handleProgress = useCallback((time: number, duration: number) => {
    if (!currentEp || !info) return;
    saveProgress(episodeId, {
      animeId, animeName: info.name, animePoster: info.poster,
      episodeId, episodeNumber: currentEp.number, episodeTitle: currentEp.title,
      currentTime: time, duration,
    });
  }, [episodeId, currentEp, info, animeId, saveProgress]);

  const savedProgress = getProgress(episodeId);
  const startTime = savedProgress?.currentTime ?? 0;

  return (
    <div className="pt-16 min-h-screen bg-background">
      <div className="flex flex-col lg:flex-row max-w-[1600px] mx-auto">

        {/* Player column */}
        <div className="flex-1 min-w-0">
          <div className="bg-black">


            {/* Loading state */}
            {isLoading && !streamUrl && (
              <div className="w-full aspect-video bg-black flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-xs text-gray-400">
                  Trying <span className="text-primary font-mono">{activeServer}</span>…
                </p>
              </div>
            )}

            {/* All failed state */}
            {allFailed && !streamUrl && (
              <div className="w-full aspect-video bg-black flex flex-col items-center justify-center gap-4 text-center px-8">
                <AlertCircle className="w-12 h-12 text-red-400" />
                <div>
                  <p className="text-white font-semibold text-base mb-1">No working stream found</p>
                  <p className="text-gray-500 text-sm">
                    All servers returned errors. The upstream API may be temporarily down for this episode.
                  </p>
                </div>
                <div className="flex gap-3 mt-1">
                  <button onClick={retry}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors">
                    <RefreshCw className="w-4 h-4" /> Retry
                  </button>
                  {nextEp && (
                    <Link href={`/watch/${encodeURIComponent(nextEp.episodeId)}`}
                      className="bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors">
                      Skip to Ep {nextEp.number}
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* Player */}
            {streamUrl && (
              <VideoPlayer
                streamUrl={streamUrl}
                subtitles={subtitles}
                intro={intro}
                outro={outro}
                onProgress={handleProgress}
                onEnded={() => nextEp && setCountdown(10)}
                startTime={startTime}
                title={`${info?.name ?? animeId} — Episode ${currentEp?.number ?? '?'}`}
              />
            )}

            {/* Auto-next overlay */}
            <AnimatePresence>
              {countdown !== null && nextEp && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 gap-4">
                  <p className="text-white text-lg font-semibold">Next episode in {countdown}s</p>
                  <p className="text-gray-300 text-sm">Episode {nextEp.number}: {nextEp.title}</p>
                  <div className="flex gap-3">
                    <Link href={`/watch/${encodeURIComponent(nextEp.episodeId)}`}
                      className="bg-primary hover:bg-primary/90 text-white font-semibold px-5 py-2 rounded-xl flex items-center gap-2 transition-colors">
                      <Play className="w-4 h-4 fill-white" /> Play Now
                    </Link>
                    <button onClick={() => setCountdown(null)}
                      className="bg-white/10 hover:bg-white/20 text-white px-5 py-2 rounded-xl flex items-center gap-1 transition-colors">
                      <X className="w-4 h-4" /> Cancel
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="p-4 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">Now Playing</p>
                <h1 className="text-base font-bold text-white">
                  {info?.name} — Ep {currentEp?.number ?? '?'}{currentEp?.title ? `: ${currentEp.title}` : ''}
                </h1>
                {activeServer && streamUrl && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    via <span className="text-accent font-mono">{activeServer}</span>
                  </p>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                {prevEp && (
                  <Link href={`/watch/${encodeURIComponent(prevEp.episodeId)}`}
                    className="flex items-center gap-1 text-sm text-gray-400 hover:text-white border border-border hover:border-primary px-3 py-1.5 rounded-lg transition-colors">
                    <ChevronLeft className="w-4 h-4" /> Prev
                  </Link>
                )}
                {nextEp && (
                  <Link href={`/watch/${encodeURIComponent(nextEp.episodeId)}`}
                    className="flex items-center gap-1 text-sm text-gray-400 hover:text-white border border-border hover:border-primary px-3 py-1.5 rounded-lg transition-colors">
                    Next <ChevronRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>

            {/* Sub/Dub/Raw */}
            <div className="flex gap-2">
              {(['sub', ...(hasDub ? ['dub'] : []), ...(hasRaw ? ['raw'] : [])] as SubDubCategory[]).map(tab => (
                <button key={tab} onClick={() => setCategory(tab)}
                  className={cn('text-sm px-4 py-1.5 rounded-lg font-medium border transition-colors uppercase',
                    category === tab ? 'bg-primary border-primary text-white' : 'border-border text-gray-400 hover:text-white hover:border-primary')}>
                  {tab}
                </button>
              ))}
            </div>

            {/* Server list (display only) */}
            {availableServers.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Server className="w-3 h-3" /> Servers
                </p>
                <div className="flex flex-wrap gap-2">
                  {availableServers.map(s => (
                    <div key={s}
                      className={cn('text-sm px-3 py-1.5 rounded-lg border capitalize',
                        s === activeServer && streamUrl ? 'bg-primary/20 border-primary text-primary' : 'border-border text-gray-500')}>
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {info && (
              <Link href={`/anime/${animeId}`}
                className="flex items-center gap-4 p-3 bg-card border border-border rounded-xl hover:border-primary transition-colors">
                <div className="w-12 h-16 relative rounded-lg overflow-hidden shrink-0">
                  <Image src={info.poster} alt={info.name} fill className="object-cover" sizes="48px" />
                </div>
                <div>
                  <p className="font-medium text-white text-sm">{info.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{info.stats?.type} · {episodes.length} Episodes</p>
                </div>
              </Link>
            )}

            <button onClick={() => setShowEpisodes(p => !p)}
              className="lg:hidden w-full flex items-center justify-center gap-2 text-sm text-gray-300 bg-card border border-border px-4 py-2.5 rounded-xl hover:border-primary transition-colors">
              <List className="w-4 h-4" /> {showEpisodes ? 'Hide' : 'Show'} Episodes
            </button>

            <AnimatePresence>
              {showEpisodes && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                  <EpisodeList episodes={episodes} currentEpisodeId={episodeId} compact />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Desktop sidebar */}
        <div className="hidden lg:block w-80 xl:w-96 shrink-0 border-l border-border">
          <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto p-4 space-y-3">
            <h2 className="font-bold text-white text-sm">Episodes ({episodes.length})</h2>
            <EpisodeList episodes={episodes} currentEpisodeId={episodeId} />
          </div>
        </div>
      </div>
    </div>
  );
}