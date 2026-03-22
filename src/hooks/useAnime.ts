import { useQuery } from '@tanstack/react-query';
import * as api from '@/lib/api';
import type { SubDubCategory } from '@/types/stream';

const STALE = 5 * 60 * 1000;

export const useHome = () =>
  useQuery({ queryKey: ['home'], queryFn: api.getHome, staleTime: STALE });

export const useAnimeInfo = (id: string) =>
  useQuery({ queryKey: ['anime', id], queryFn: () => api.getAnimeInfo(id), staleTime: STALE, enabled: !!id });

export const useEpisodes = (animeId: string) =>
  useQuery({ queryKey: ['episodes', animeId], queryFn: () => api.getEpisodes(animeId), staleTime: STALE, enabled: !!animeId });

export const useServers = (episodeId: string) =>
  useQuery({ queryKey: ['servers', episodeId], queryFn: () => api.getServers(episodeId), staleTime: 2 * 60 * 1000, enabled: !!episodeId });

export const useSources = (episodeId: string, server: string, category: SubDubCategory) =>
  useQuery({
    queryKey: ['sources', episodeId, server, category],
    queryFn: () => api.getSources(episodeId, server, category),
    staleTime: 2 * 60 * 1000,
    enabled: !!episodeId && !!server,
    retry: false, // don't retry — bad servers always fail, good ones always succeed
  });

export const useSearch = (q: string, page: number, filters: Record<string, string> = {}) =>
  useQuery({
    queryKey: ['search', q, page, filters],
    queryFn: () => api.searchAnime(q, page, filters),
    staleTime: STALE,
    enabled: !!q,
  });

export const useSearchSuggestions = (q: string) =>
  useQuery({
    queryKey: ['suggestions', q],
    queryFn: () => api.getSearchSuggestions(q),
    staleTime: 30 * 1000,
    enabled: q.length > 1,
  });

export const useGenreAnimes = (name: string, page: number) =>
  useQuery({ queryKey: ['genre', name, page], queryFn: () => api.getGenreAnimes(name, page), staleTime: STALE, enabled: !!name });

export const useCategoryAnimes = (category: string, page: number) =>
  useQuery({ queryKey: ['category', category, page], queryFn: () => api.getCategoryAnimes(category, page), staleTime: STALE, enabled: !!category });

export const useSchedule = (date: string) =>
  useQuery({ queryKey: ['schedule', date], queryFn: () => api.getSchedule(date), staleTime: 10 * 60 * 1000, enabled: !!date });
