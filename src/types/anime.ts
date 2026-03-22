export interface AnimeEpisodes {
  sub: number | null;
  dub: number | null;
}

export interface AnimeCard {
  id: string;
  name: string;
  poster: string;
  type?: string;
  rating?: string;
  duration?: string;
  episodes?: AnimeEpisodes;
  jname?: string;
  rank?: number;
}

export interface SpotlightAnime extends AnimeCard {
  description: string;
  otherInfo?: string[];
}

export interface AnimeStats {
  rating: string;
  quality: string;
  episodes: AnimeEpisodes;
  type: string;
  duration: string;
}

export interface AnimeInfo {
  id: string;
  name: string;
  poster: string;
  description: string;
  stats: AnimeStats;
  promotionalVideos?: { title?: string; source?: string; thumbnail?: string }[];
  characterVoiceActor?: {
    character: { id: string; poster: string; name: string; cast: string };
    voiceActor: { id: string; poster: string; name: string; cast: string };
  }[];
}

export interface AnimeMoreInfo {
  aired?: string;
  genres?: string[];
  status?: string;
  studios?: string;
  duration?: string;
  synonyms?: string;
  japanese?: string;
  producers?: string[];
  [key: string]: unknown;
}

export interface AnimeSeason {
  id: string;
  name: string;
  title: string;
  poster: string;
  isCurrent: boolean;
}

export interface AnimeDetailData {
  anime: {
    info: AnimeInfo;
    moreInfo: AnimeMoreInfo;
  };
  seasons?: AnimeSeason[];
  relatedAnimes?: AnimeCard[];
  recommendedAnimes?: AnimeCard[];
  mostPopularAnimes?: AnimeCard[];
}

export interface HomeData {
  genres: string[];
  spotlightAnimes: SpotlightAnime[];
  trendingAnimes: AnimeCard[];
  latestEpisodeAnimes: AnimeCard[];
  topAiringAnimes: AnimeCard[];
  topUpcomingAnimes: AnimeCard[];
  mostPopularAnimes: AnimeCard[];
  mostFavoriteAnimes: AnimeCard[];
  latestCompletedAnimes: AnimeCard[];
  top10Animes: {
    today: AnimeCard[];
    week: AnimeCard[];
    month: AnimeCard[];
  };
}

export interface SearchResult {
  animes: AnimeCard[];
  mostPopularAnimes: AnimeCard[];
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  searchQuery: string;
  searchFilters: Record<string, string[]>;
}

export interface SearchSuggestion {
  id: string;
  name: string;
  poster: string;
  jname: string;
  moreInfo: string[];
}
