'use client';

import { useState, useEffect } from 'react';
import VideoPlayer from './VideoPlayer';
import EmbedPlayer from './EmbedPlayer';
import type { StreamSubtitle, StreamTimestamp } from '@/types/stream';

interface SmartPlayerProps {
  streamUrl: string;
  subtitles?: StreamSubtitle[];
  intro?: StreamTimestamp;
  outro?: StreamTimestamp;
  onProgress?: (time: number, duration: number) => void;
  onEnded?: () => void;
  startTime?: number;
  title?: string;
  animeId?: string;
  episodeNumber?: number;
}

export default function SmartPlayer(props: SmartPlayerProps) {
  const [useEmbed, setUseEmbed] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Test if stream URL is accessible
  useEffect(() => {
    if (!props.streamUrl) return;

    const testStreamAccess = async () => {
      try {
        const proxyUrl = `/api/stream?url=${encodeURIComponent(props.streamUrl)}`;
        const res = await fetch(proxyUrl, { method: 'HEAD' });

        if (res.status === 403) {
          console.log('[SmartPlayer] Stream blocked (403), switching to embed player');
          setUseEmbed(true);
          setHasError(true);
        }
      } catch (err) {
        console.error('[SmartPlayer] Stream test failed:', err);
        setUseEmbed(true);
        setHasError(true);
      }
    };

    testStreamAccess();
  }, [props.streamUrl]);

  // If we have anime ID and episode number, use embed player
  if (useEmbed && props.animeId && props.episodeNumber) {
    return (
      <EmbedPlayer
        animeId={props.animeId}
        episodeNumber={props.episodeNumber}
        title={props.title}
      />
    );
  }

  // If error but no anime metadata, show error message
  if (hasError && (!props.animeId || !props.episodeNumber)) {
    return (
      <div className="w-full aspect-video bg-black rounded-lg flex items-center justify-center">
        <div className="text-center text-white px-4">
          <div className="text-xl font-semibold mb-2">Video Unavailable</div>
          <div className="text-sm text-white/70">
            The video stream is blocked by the CDN. Please try again later.
          </div>
        </div>
      </div>
    );
  }

  // Default: Try HLS player
  return <VideoPlayer {...props} />;
}
