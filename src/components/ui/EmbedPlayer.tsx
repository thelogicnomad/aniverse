'use client';

import { useState } from 'react';
import { AlertCircle, ExternalLink } from 'lucide-react';

interface EmbedPlayerProps {
  animeId: string;
  episodeNumber: number;
  title?: string;
}

// Embed providers that work without proxy
const EMBED_PROVIDERS = [
  {
    name: 'VidSrc',
    getUrl: (id: string, ep: number) => `https://vidsrc.to/embed/tv/${id}/${ep}`,
  },
  {
    name: '2Embed',
    getUrl: (id: string, ep: number) => `https://www.2embed.cc/embed/${id}/${ep}`,
  },
  {
    name: 'AutoEmbed',
    getUrl: (id: string, ep: number) => `https://autoembed.co/tv/tmdb/${id}/${ep}`,
  },
];

export default function EmbedPlayer({ animeId, episodeNumber, title }: EmbedPlayerProps) {
  const [selectedProvider, setSelectedProvider] = useState(0);

  const currentUrl = EMBED_PROVIDERS[selectedProvider].getUrl(animeId, episodeNumber);

  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
      {/* Info Banner */}
      <div className="absolute top-0 left-0 right-0 bg-yellow-500/90 text-black text-xs px-3 py-2 z-10 flex items-center gap-2">
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
        <span>Using external player due to proxy limitations. Video quality may vary.</span>
      </div>

      {/* Embed iframe */}
      <iframe
        src={currentUrl}
        className="w-full h-full"
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        title={title || 'Video Player'}
      />

      {/* Provider Switcher */}
      <div className="absolute bottom-4 left-4 z-10 flex gap-2">
        {EMBED_PROVIDERS.map((provider, idx) => (
          <button
            key={provider.name}
            onClick={() => setSelectedProvider(idx)}
            className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
              selectedProvider === idx
                ? 'bg-primary text-white'
                : 'bg-black/70 text-white/70 hover:bg-black/90 hover:text-white'
            }`}
          >
            {provider.name}
          </button>
        ))}
      </div>

      {/* External Link */}
      <a
        href={currentUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-4 right-4 z-10 bg-black/70 hover:bg-black/90 text-white p-2 rounded-lg transition-colors"
        title="Open in new tab"
      >
        <ExternalLink className="w-4 h-4" />
      </a>
    </div>
  );
}
