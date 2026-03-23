export interface Episode {
  number: number;
  title: string;
  episodeId: string;
  isFiller: boolean;
}

export interface EpisodesData {
  totalEpisodes: number;
  episodes: Episode[];
}

export interface EpisodeServer {
  serverId: number;
  serverName: string;
}

export interface EpisodeServersData {
  episodeId: string;
  episodeNo: number;
  sub: EpisodeServer[];
  dub: EpisodeServer[];
  raw: EpisodeServer[];
}

export interface ScheduledAnime {
  id: string;
  time: string;
  name: string;
  jname: string;
  airingTimestamp: number;
  secondsUntilAiring: number;
  episodeNumber?: number;
}
