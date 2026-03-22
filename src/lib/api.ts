import axios from 'axios';
import type { HomeData, AnimeDetailData, SearchResult, SearchSuggestion, AnimeCard } from '@/types/anime';
import type { EpisodesData, EpisodeServersData, ScheduledAnime } from '@/types/episode';
import type { StreamData, SubDubCategory } from '@/types/stream';

const client = axios.create({
  baseURL: '/api/proxy',
  timeout: 15000,
});

// ─── Home ──────────────────────────────────────────────────────────────────
export async function getHome(): Promise<HomeData> {
  const r = await client.get('/api/v2/hianime/home');
  return r.data.data;
}

// ─── Anime Info ────────────────────────────────────────────────────────────
export async function getAnimeInfo(id: string): Promise<AnimeDetailData> {
  const r = await client.get(`/api/v2/hianime/anime/${encodeURIComponent(id)}`);
  return r.data.data;
}

// ─── Episodes ──────────────────────────────────────────────────────────────
export async function getEpisodes(animeId: string): Promise<EpisodesData> {
  const r = await client.get(`/api/v2/hianime/anime/${encodeURIComponent(animeId)}/episodes`);
  return r.data.data;
}

// ─── Episode Servers ───────────────────────────────────────────────────────
export async function getServers(episodeId: string): Promise<EpisodeServersData> {
  const r = await client.get(`/api/v2/hianime/episode/servers?animeEpisodeId=${encodeURIComponent(episodeId)}`);
  return r.data.data;
}

// ─── Stream Sources ────────────────────────────────────────────────────────
export async function getSources(
  episodeId: string,
  server = 'hd-1',
  category: SubDubCategory = 'sub'
): Promise<StreamData> {
  const r = await client.get(
    `/api/v2/hianime/episode/sources?animeEpisodeId=${encodeURIComponent(episodeId)}?server=${server}&category=${category}`
  );
  return r.data.data;
}
// ─── Search ────────────────────────────────────────────────────────────────
export async function searchAnime(
  q: string,
  page = 1,
  filters: Record<string, string> = {}
): Promise<SearchResult> {
  const r = await client.get('/api/v2/hianime/search', { params: { q, page, ...filters } });
  return r.data.data;
}

export async function getSearchSuggestions(q: string): Promise<{ suggestions: SearchSuggestion[] }> {
  const r = await client.get(`/api/v2/hianime/search/suggestion?q=${encodeURIComponent(q)}`);
  return r.data.data;
}

// ─── Genre ─────────────────────────────────────────────────────────────────
export async function getGenreAnimes(
  name: string,
  page = 1
): Promise<{ genreName: string; animes: AnimeCard[]; genres: string[]; topAiringAnimes: AnimeCard[]; currentPage: number; totalPages: number; hasNextPage: boolean }> {
  const r = await client.get(`/api/v2/hianime/genre/${encodeURIComponent(name)}?page=${page}`);
  return r.data.data;
}

// ─── Category ──────────────────────────────────────────────────────────────
export async function getCategoryAnimes(
  category: string,
  page = 1
): Promise<{ category: string; animes: AnimeCard[]; genres: string[]; currentPage: number; totalPages: number; hasNextPage: boolean }> {
  const r = await client.get(`/api/v2/hianime/category/${encodeURIComponent(category)}?page=${page}`);
  return r.data.data;
}

// ─── Schedule ──────────────────────────────────────────────────────────────
export async function getSchedule(date: string): Promise<{ scheduledAnimes: ScheduledAnime[] }> {
  const r = await client.get(`/api/v2/hianime/schedule?date=${date}`);
  return r.data.data;
}
