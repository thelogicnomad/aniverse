'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Play, Pause, Volume2, VolumeX, Maximize, Minimize,
  SkipForward, Subtitles, Loader2, PictureInPicture2, ChevronRight
} from 'lucide-react';
import { formatTime, getProxiedStreamUrl, getProxiedSubtitleUrl } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { StreamSubtitle, StreamTimestamp } from '@/types/stream';
import { PLAYBACK_SPEEDS } from '@/lib/constants';

interface VideoPlayerProps {
  streamUrl: string;
  subtitles?: StreamSubtitle[];
  intro?: StreamTimestamp;
  outro?: StreamTimestamp;
  onProgress?: (time: number, duration: number) => void;
  onEnded?: () => void;
  startTime?: number;
  title?: string;
}

export default function VideoPlayer({
  streamUrl, subtitles = [], intro, outro, onProgress, onEnded, startTime = 0, title,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<unknown>(null);
  const progressSaveRef = useRef<NodeJS.Timeout>();
  const hideControlsRef = useRef<NodeJS.Timeout>();

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [buffering, setBuffering] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [selectedSub, setSelectedSub] = useState<string | null>(null);
  const [showSkipIntro, setShowSkipIntro] = useState(false);
  const [showSkipOutro, setShowSkipOutro] = useState(false);
  const [showSubMenu, setShowSubMenu] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  const proxiedUrl = getProxiedStreamUrl(streamUrl);

  // Load HLS
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamUrl) return;

    console.log('[VideoPlayer] Initializing with stream URL:', streamUrl.substring(0, 80) + '...');
    console.log('[VideoPlayer] Proxied URL:', proxiedUrl);

    let hls: unknown = null;

    const initHls = async () => {
      const Hls = (await import('hls.js')).default;
      console.log('[VideoPlayer] HLS.js loaded, isSupported:', Hls.isSupported());

      if (Hls.isSupported()) {
        const instance = new Hls({
          enableWorker: true,
          debug: false, // Set to true for verbose HLS.js logs
        });
        hlsRef.current = instance;
        hls = instance;

        // Error handling
        (instance as any).on('hlsError' as any, (_event: unknown, data: unknown) => {
          const errorData = data as { fatal?: boolean; type?: string; details?: string; response?: { code?: number } };
          console.error('[VideoPlayer] HLS ERROR:', {
            fatal: errorData.fatal,
            type: errorData.type,
            details: errorData.details,
            responseCode: errorData.response?.code,
          });

          if (errorData.fatal) {
            switch (errorData.type) {
              case 'networkError':
                console.error('[VideoPlayer] Fatal network error - attempting recovery...');
                (instance as any).startLoad();
                break;
              case 'mediaError':
                console.error('[VideoPlayer] Fatal media error - attempting recovery...');
                (instance as any).recoverMediaError();
                break;
              default:
                console.error('[VideoPlayer] Unrecoverable error, destroying HLS instance');
                (instance as any).destroy();
                break;
            }
          }
        });

        // Success events
        (instance as any).on('hlsManifestLoaded' as any, () => {
          console.log('[VideoPlayer] M3U8 manifest loaded successfully');
        });

        (instance as any).on('hlsFragLoaded' as any, (_event: unknown, data: unknown) => {
          const fragData = data as { frag?: { sn?: number } };
          console.log('[VideoPlayer] Video fragment loaded, segment:', fragData.frag?.sn);
        });

        (instance as any).loadSource(proxiedUrl);
        (instance as any).attachMedia(video);
        (instance as any).on('hlsManifestParsed' as any, () => {
          console.log('[VideoPlayer] Manifest parsed, starting playback...');
          if (startTime > 0) video.currentTime = startTime;
          video.play().catch((e) => console.warn('[VideoPlayer] Autoplay blocked:', e.message));
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        console.log('[VideoPlayer] Using native HLS (Safari)');
        video.src = proxiedUrl;
        if (startTime > 0) video.currentTime = startTime;
        video.play().catch((e) => console.warn('[VideoPlayer] Autoplay blocked:', e.message));
      } else {
        console.error('[VideoPlayer] HLS not supported in this browser');
      }
    };

    initHls();
    return () => {
      if (hls) {
        console.log('[VideoPlayer] Destroying HLS instance');
        (hls as { destroy: () => void }).destroy();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streamUrl]);

  // Auto-set first English subtitle
  useEffect(() => {
    const eng = subtitles.find((s) => s.lang.toLowerCase().includes('english'));
    if (eng) setSelectedSub(eng.url);
  }, [subtitles]);

  // Time update
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const ct = video.currentTime;
    setCurrentTime(ct);
    if (video.buffered.length > 0) {
      setBuffered((video.buffered.end(video.buffered.length - 1) / video.duration) * 100);
    }
    if (intro) setShowSkipIntro(ct >= intro.start && ct < intro.end);
    if (outro) setShowSkipOutro(ct >= outro.start && ct < outro.end);
  }, [intro, outro]);

  // Save progress every 5s
  useEffect(() => {
    if (!playing) return;
    progressSaveRef.current = setInterval(() => {
      const v = videoRef.current;
      if (v) onProgress?.(v.currentTime, v.duration);
    }, 5000);
    return () => clearInterval(progressSaveRef.current);
  }, [playing, onProgress]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const video = videoRef.current;
      if (!video) return;
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      switch (e.key.toLowerCase()) {
        case ' ': case 'k': e.preventDefault(); video.paused ? video.play() : video.pause(); break;
        case 'f': toggleFullscreen(); break;
        case 'm': setMuted((m) => !m); break;
        case 'arrowright': e.preventDefault(); video.currentTime = Math.min(video.duration, video.currentTime + 10); break;
        case 'arrowleft': e.preventDefault(); video.currentTime = Math.max(0, video.currentTime - 10); break;
        case 'arrowup': e.preventDefault(); setVolume((v) => Math.min(1, v + 0.1)); break;
        case 'arrowdown': e.preventDefault(); setVolume((v) => Math.max(0, v - 0.1)); break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Volume sync
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.volume = volume;
    v.muted = muted;
  }, [volume, muted]);

  // Speed sync
  useEffect(() => {
    const v = videoRef.current;
    if (v) v.playbackRate = speed;
  }, [speed]);

  // Fullscreen change listener
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // Auto-hide controls
  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    clearTimeout(hideControlsRef.current);
    hideControlsRef.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) setShowControls(false);
    }, 3000);
  }, []);

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) el.requestFullscreen();
    else document.exitFullscreen();
  };

  const handlePiP = async () => {
    const video = videoRef.current;
    if (!video) return;
    if (document.pictureInPictureElement) await document.exitPictureInPicture();
    else await video.requestPictureInPicture();
  };

  const seekTo = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    const video = videoRef.current;
    if (video) video.currentTime = pct * video.duration;
  };

  return (
    <div
      ref={containerRef}
      className="relative bg-black w-full aspect-video select-none"
      onMouseMove={resetHideTimer}
      onMouseLeave={() => { if (playing) setShowControls(false); }}
    >
      {/* Video element */}
      <video
        ref={videoRef}
        className="w-full h-full"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => setDuration(videoRef.current?.duration ?? 0)}
        onWaiting={() => setBuffering(true)}
        onCanPlay={() => setBuffering(false)}
        onEnded={onEnded}
        onClick={() => {
          const v = videoRef.current;
          if (v) v.paused ? v.play() : v.pause();
          resetHideTimer();
        }}
        crossOrigin="anonymous"
      >
        {subtitles.map((s) => (
          <track
            key={s.url}
            kind="subtitles"
            label={s.lang}
            src={getProxiedSubtitleUrl(s.url)}
            default={selectedSub === s.url}
          />
        ))}
      </video>

      {/* Buffering spinner */}
      {buffering && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
      )}

      {/* ── Skip Intro — outside controls overlay so always clickable ── */}
      {showSkipIntro && (
        <button
        onClick={() => {
  if (videoRef.current && intro && isFinite(videoRef.current.duration))
    videoRef.current.currentTime = intro.end;
}}
          className="absolute bottom-20 right-4 z-20 bg-primary/90 hover:bg-primary text-white text-sm font-semibold px-4 py-2 rounded-lg border border-primary/50 transition-colors flex items-center gap-2"
        >
          Skip Intro <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {/* ── Skip Outro — outside controls overlay so always clickable ── */}
      {showSkipOutro && (
        <button
        onClick={() => {
  if (videoRef.current && outro && isFinite(videoRef.current.duration))
    videoRef.current.currentTime = outro.end;
}}
          className="absolute bottom-20 right-4 z-20 bg-accent/90 hover:bg-accent text-white text-sm font-semibold px-4 py-2 rounded-lg border border-accent/50 transition-colors flex items-center gap-2"
        >
          Skip Outro <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {/* ── Controls overlay ── */}
      <div className={cn(
        'absolute inset-0 flex flex-col justify-end transition-opacity duration-200',
        showControls || !playing ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}>
        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />

        {/* Title */}
        {title && (
          <div className="absolute top-4 left-4 text-sm font-medium text-white/90 drop-shadow pointer-events-none">
            {title}
          </div>
        )}

        <div className="relative z-10 px-4 pb-4 space-y-2">
          {/* Progress bar */}
          <div
            className="relative h-1 rounded-full bg-white/20 cursor-pointer hover:h-2 transition-all group/bar"
            onClick={seekTo}
          >
            <div className="absolute inset-y-0 left-0 bg-white/30 rounded-full" style={{ width: `${buffered}%` }} />
            <div className="absolute inset-y-0 left-0 bg-primary rounded-full" style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover/bar:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* Buttons row */}
          <div className="flex items-center gap-2">
            {/* Play/Pause */}
            <button
              onClick={() => { const v = videoRef.current; if (v) v.paused ? v.play() : v.pause(); }}
              className="text-white hover:text-primary transition-colors"
            >
              {playing ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
            </button>

            {/* Skip 10s */}
            <button
              onClick={() => { if (videoRef.current) videoRef.current.currentTime += 10; }}
              className="text-white/70 hover:text-white transition-colors"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            {/* Volume */}
            <div className="flex items-center gap-2 group/vol">
              <button onClick={() => setMuted((m) => !m)} className="text-white hover:text-primary transition-colors">
                {muted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input
                type="range" min={0} max={1} step={0.05}
                value={muted ? 0 : volume}
                onChange={(e) => { setVolume(+e.target.value); setMuted(false); }}
                className="w-0 group-hover/vol:w-20 transition-all duration-200 volume-slider accent-accent"
              />
            </div>

            {/* Time */}
            <span className="text-xs text-white/80 tabular-nums ml-1">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            <div className="flex-1" />

            {/* Subtitles */}
            {subtitles.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => { setShowSubMenu((p) => !p); setShowSpeedMenu(false); }}
                  className={cn('transition-colors', selectedSub ? 'text-accent' : 'text-white/70 hover:text-white')}
                >
                  <Subtitles className="w-4 h-4" />
                </button>
                {showSubMenu && (
                  <div className="absolute bottom-full right-0 mb-2 bg-card border border-border rounded-xl overflow-hidden shadow-xl min-w-[140px]">
                    <button
                      onClick={() => { setSelectedSub(null); setShowSubMenu(false); }}
                      className={cn('w-full text-left text-xs px-3 py-2 hover:bg-white/10 transition-colors', !selectedSub && 'text-primary')}
                    >
                      Off
                    </button>
                    {subtitles.map((s) => (
                      <button
                        key={s.url}
                        onClick={() => { setSelectedSub(s.url); setShowSubMenu(false); }}
                        className={cn('w-full text-left text-xs px-3 py-2 hover:bg-white/10 transition-colors', selectedSub === s.url && 'text-primary')}
                      >
                        {s.lang}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Speed */}
            <div className="relative">
              <button
                onClick={() => { setShowSpeedMenu((p) => !p); setShowSubMenu(false); }}
                className="text-xs text-white/70 hover:text-white transition-colors font-mono w-8 text-center"
              >
                {speed}x
              </button>
              {showSpeedMenu && (
                <div className="absolute bottom-full right-0 mb-2 bg-card border border-border rounded-xl overflow-hidden shadow-xl min-w-[80px]">
                  {PLAYBACK_SPEEDS.map((s) => (
                    <button
                      key={s}
                      onClick={() => { setSpeed(s); setShowSpeedMenu(false); }}
                      className={cn('w-full text-xs px-3 py-2 hover:bg-white/10 transition-colors', speed === s && 'text-primary font-semibold')}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* PiP */}
            <button onClick={handlePiP} className="text-white/70 hover:text-white transition-colors hidden sm:block">
              <PictureInPicture2 className="w-4 h-4" />
            </button>

            {/* Fullscreen */}
            <button onClick={toggleFullscreen} className="text-white hover:text-primary transition-colors">
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}