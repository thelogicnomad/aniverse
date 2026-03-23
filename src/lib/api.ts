import axios from 'axios';
import type { HomeData, AnimeDetailData, SearchResult, SearchSuggestion, AnimeCard, SpotlightAnime } from '@/types/anime';
import type { EpisodesData, EpisodeServersData, ScheduledAnime } from '@/types/episode';
import type { StreamData, SubDubCategory } from '@/types/stream';

const client = axios.create({
  baseURL: '/api/proxy',
  timeout: 15000,
});

function mapAnimeCard(item: Record<string, unknown>): AnimeCard {
  const tvInfo = (item.tvInfo ?? {}) as Record<string, unknown>;
  return {
    id: String(item.id ?? ''),
    name: String(item.title ?? item.name ?? ''),
    poster: String(item.poster ?? ''),
    type: String(tvInfo.showType ?? item.showType ?? ''),
    duration: String(tvInfo.duration ?? item.duration ?? ''),
    episodes: {
      sub: tvInfo.sub != null ? Number(tvInfo.sub) : null,
      dub: tvInfo.dub != null ? Number(tvInfo.dub) : null,
    },
    jname: String(item.japanese_title ?? ''),
    rank: item.number != null ? Number(item.number) : undefined,
  };
}

function mapSpotlight(item: Record<string, unknown>): SpotlightAnime {
  const tvInfo = (item.tvInfo ?? {}) as Record<string, unknown>;
  const episodeInfo = (tvInfo.episodeInfo ?? tvInfo) as Record<string, unknown>;
  return {
    id: String(item.id ?? ''),
    name: String(item.title ?? ''),
    poster: String(item.poster ?? ''),
    description: String(item.description ?? ''),
    type: String(tvInfo.showType ?? ''),
    duration: String(tvInfo.duration ?? ''),
    episodes: {
      sub: episodeInfo.sub != null ? Number(episodeInfo.sub) : null,
      dub: episodeInfo.dub != null ? Number(episodeInfo.dub) : null,
    },
    otherInfo: [
      tvInfo.showType ? String(tvInfo.showType) : '',
      tvInfo.duration ? String(tvInfo.duration) : '',
      tvInfo.releaseDate ? String(tvInfo.releaseDate) : '',
      tvInfo.quality ? String(tvInfo.quality) : '',
    ].filter(Boolean),
    jname: String(item.japanese_title ?? ''),
    rank: item.data_id != null ? Number(item.data_id) : undefined,
  };
}

export async function getHome(): Promise<HomeData> {
  const r = await client.get('/api/');
  const d = r.data.results;
  return {
    spotlightAnimes: Array.isArray(d.spotlights) ? d.spotlights.map(mapSpotlight) : [],
    trendingAnimes: Array.isArray(d.trending) ? d.trending.map(mapAnimeCard) : [],
    latestEpisodeAnimes: Array.isArray(d.latestEpisode) ? d.latestEpisode.map(mapAnimeCard) : [],
    topAiringAnimes: Array.isArray(d.topAiring) ? d.topAiring.map(mapAnimeCard) : [],
    topUpcomingAnimes: Array.isArray(d.topUpcoming) ? d.topUpcoming.map(mapAnimeCard) : [],
    mostPopularAnimes: Array.isArray(d.mostPopular) ? d.mostPopular.map(mapAnimeCard) : [],
    mostFavoriteAnimes: Array.isArray(d.mostFavorite) ? d.mostFavorite.map(mapAnimeCard) : [],
    latestCompletedAnimes: Array.isArray(d.latestCompleted) ? d.latestCompleted.map(mapAnimeCard) : [],
    top10Animes: {
      today: Array.isArray(d.topTen?.today) ? d.topTen.today.map(mapAnimeCard) : [],
      week: Array.isArray(d.topTen?.week) ? d.topTen.week.map(mapAnimeCard) : [],
      month: Array.isArray(d.topTen?.month) ? d.topTen.month.map(mapAnimeCard) : [],
    },
    genres: Array.isArray(d.genres) ? d.genres : [],
  };
}

export async function getAnimeInfo(id: string): Promise<AnimeDetailData> {
  const r = await client.get(`/api/info?id=${encodeURIComponent(id)}`);
  const d = r.data.results;
  const data = d.data ?? {};
  const animeInfo = data.animeInfo ?? {};

  return {
    anime: {
      info: {
        id: String(data.id ?? id),
        name: String(data.title ?? ''),
        poster: String(data.poster ?? ''),
        description: String(animeInfo.Overview ?? ''),
        stats: {
          rating: String(animeInfo['MAL Score'] ?? ''),
          quality: '',
          episodes: {
            sub: null,
            dub: null,
          },
          type: String(data.showType ?? ''),
          duration: String(animeInfo.Duration ?? ''),
        },
      },
      moreInfo: {
        aired: animeInfo.Aired ?? undefined,
        genres: Array.isArray(animeInfo.Genres) ? animeInfo.Genres : undefined,
        status: animeInfo.Status ?? undefined,
        studios: animeInfo.Studios ?? undefined,
        duration: animeInfo.Duration ?? undefined,
        synonyms: animeInfo.Synonyms ?? undefined,
        japanese: animeInfo.Japanese ?? data.japanese_title ?? undefined,
        producers: Array.isArray(animeInfo.Producers) ? animeInfo.Producers : undefined,
      },
    },
    seasons: Array.isArray(d.seasons) ? d.seasons.map((s: Record<string, unknown>) => ({
      id: String(s.id ?? ''),
      name: String(s.season ?? s.title ?? ''),
      title: String(s.title ?? ''),
      poster: String(s.season_poster ?? ''),
      isCurrent: String(s.id) === String(data.id),
    })) : [],
    relatedAnimes: Array.isArray(d.related_data) ? d.related_data.flat().map(mapAnimeCard) : [],
    recommendedAnimes: Array.isArray(d.recommended_data) ? d.recommended_data.flat().map(mapAnimeCard) : [],
  };
}

export async function getEpisodes(animeId: string): Promise<EpisodesData> {
  const r = await client.get(`/api/episodes/${encodeURIComponent(animeId)}`);
  const d = r.data.results;
  const episodes = Array.isArray(d.episodes) ? d.episodes : [];
  return {
    totalEpisodes: d.totalEpisodes ?? episodes.length,
    episodes: episodes.map((ep: Record<string, unknown>) => ({
      number: Number(ep.episode_no ?? 0),
      title: String(ep.title ?? ep.jname ?? `Episode ${ep.episode_no}`),
      episodeId: String(ep.id ?? ''),
      isFiller: false,
    })),
  };
}

export async function getServers(episodeId: string): Promise<EpisodeServersData> {
  const r = await client.get(`/api/servers/${encodeURIComponent(episodeId)}`);
  const servers = r.data.results ?? [];

  const sub = servers.filter((s: Record<string, unknown>) => s.type === 'sub').map((s: Record<string, unknown>) => ({
    serverId: Number(s.server_id ?? s.data_id ?? 0),
    serverName: String(s.serverName ?? s.server_name ?? ''),
  }));
  const dub = servers.filter((s: Record<string, unknown>) => s.type === 'dub').map((s: Record<string, unknown>) => ({
    serverId: Number(s.server_id ?? s.data_id ?? 0),
    serverName: String(s.serverName ?? s.server_name ?? ''),
  }));
  const raw = servers.filter((s: Record<string, unknown>) => s.type === 'raw').map((s: Record<string, unknown>) => ({
    serverId: Number(s.server_id ?? s.data_id ?? 0),
    serverName: String(s.serverName ?? s.server_name ?? ''),
  }));

  return {
    episodeId,
    episodeNo: 0,
    sub,
    dub,
    raw,
  };
}

export async function getSources(
  episodeId: string,
  server = 'hd-1',
  category: SubDubCategory = 'sub'
): Promise<StreamData> {
  const r = await client.get(
    `/api/stream?id=${encodeURIComponent(episodeId)}&server=${encodeURIComponent(server)}&type=${encodeURIComponent(category)}`
  );
  const d = r.data.results;
  const sl = d?.streamingLink;

  const sources = sl?.link ? [{
    url: String(sl.link.file ?? ''),
    isM3U8: String(sl.link.type ?? '').toLowerCase().includes('hls') || String(sl.link.file ?? '').includes('.m3u8'),
  }] : [];

  const subtitles = Array.isArray(sl?.tracks) ? sl.tracks
    .filter((t: Record<string, unknown>) => t.kind !== 'thumbnails')
    .map((t: Record<string, unknown>) => ({
      lang: String(t.label ?? ''),
      url: String(t.file ?? ''),
    })) : [];

  return {
    sources,
    subtitles,
    intro: sl?.intro ?? undefined,
    outro: sl?.outro ?? undefined,
  };
}

export async function searchAnime(
  q: string,
  page = 1,
  filters: Record<string, string> = {}
): Promise<SearchResult> {
  const hasFilters = Object.keys(filters).length > 0;

  let r;
  if (hasFilters) {
    r = await client.get('/api/filter', { params: { keyword: q, page, ...filters } });
    const d = r.data.results;
    const animes = Array.isArray(d?.data) ? d.data.map(mapAnimeCard) : [];
    return {
      animes,
      mostPopularAnimes: [],
      currentPage: page,
      totalPages: d?.totalPages ?? 1,
      hasNextPage: page < (d?.totalPages ?? 1),
      searchQuery: q,
      searchFilters: {},
    };
  }

  r = await client.get('/api/search', { params: { keyword: q, page } });
  const results = r.data.results;
  const animes = Array.isArray(results) ? results.map(mapAnimeCard) : (Array.isArray(results?.data) ? results.data.map(mapAnimeCard) : []);
  return {
    animes,
    mostPopularAnimes: [],
    currentPage: page,
    totalPages: results?.totalPages ?? 1,
    hasNextPage: animes.length > 0,
    searchQuery: q,
    searchFilters: {},
  };
}

export async function getSearchSuggestions(q: string): Promise<{ suggestions: SearchSuggestion[] }> {
  const r = await client.get(`/api/search/suggest?keyword=${encodeURIComponent(q)}`);
  const results = r.data.results ?? [];
  return {
    suggestions: Array.isArray(results) ? results.map((s: Record<string, unknown>) => ({
      id: String(s.id ?? ''),
      name: String(s.title ?? ''),
      poster: String(s.poster ?? ''),
      jname: String(s.japanese_title ?? ''),
      moreInfo: [
        s.showType ? String(s.showType) : '',
        s.duration ? String(s.duration) : '',
        s.releaseDate ? String(s.releaseDate) : '',
      ].filter(Boolean),
    })) : [],
  };
}

export async function getGenreAnimes(
  name: string,
  page = 1
): Promise<{ genreName: string; animes: AnimeCard[]; genres: string[]; topAiringAnimes: AnimeCard[]; currentPage: number; totalPages: number; hasNextPage: boolean }> {
  const r = await client.get(`/api/genre/${encodeURIComponent(name)}?page=${page}`);
  const d = r.data.results;
  const animes = Array.isArray(d?.data) ? d.data.map(mapAnimeCard) : [];
  return {
    genreName: name.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
    animes,
    genres: [],
    topAiringAnimes: [],
    currentPage: page,
    totalPages: d?.totalPages ?? 1,
    hasNextPage: page < (d?.totalPages ?? 1),
  };
}

export async function getCategoryAnimes(
  category: string,
  page = 1
): Promise<{ category: string; animes: AnimeCard[]; genres: string[]; currentPage: number; totalPages: number; hasNextPage: boolean }> {
  const r = await client.get(`/api/${encodeURIComponent(category)}?page=${page}`);
  const d = r.data.results;
  const animes = Array.isArray(d?.data) ? d.data.map(mapAnimeCard) : [];
  return {
    category,
    animes,
    genres: [],
    currentPage: page,
    totalPages: d?.totalPages ?? 1,
    hasNextPage: page < (d?.totalPages ?? 1),
  };
}

export async function getSchedule(date: string): Promise<{ scheduledAnimes: ScheduledAnime[] }> {
  const r = await client.get(`/api/schedule?date=${date}`);
  const results = r.data.results ?? [];
  return {
    scheduledAnimes: Array.isArray(results) ? results.map((s: Record<string, unknown>) => ({
      id: String(s.id ?? ''),
      time: String(s.time ?? ''),
      name: String(s.title ?? ''),
      jname: String(s.japanese_title ?? ''),
      airingTimestamp: 0,
      secondsUntilAiring: 0,
      episodeNumber: s.episode_no != null ? Number(s.episode_no) : undefined,
    })) : [],
  };
}
