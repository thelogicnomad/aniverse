export interface StreamSource {
  url: string;
  isM3U8: boolean;
  quality?: string;
}

export interface StreamSubtitle {
  lang: string;
  url: string;
}

export interface StreamTimestamp {
  start: number;
  end: number;
}

export interface StreamData {
  headers?: Record<string, string>;
  sources: StreamSource[];
  subtitles: StreamSubtitle[];
  intro?: StreamTimestamp;
  outro?: StreamTimestamp;
  anilistID?: number | null;
  malID?: number | null;
}

export type SubDubCategory = 'sub' | 'dub' | 'raw';
