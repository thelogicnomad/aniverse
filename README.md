# AniVerse 🌌

A full-featured anime streaming platform built with Next.js 14, TypeScript, Tailwind CSS, HLS.js, and Framer Motion.

## Features

- 🎬 **HLS Video Streaming** — Custom player with full controls, skip intro/outro, subtitles
- 🔍 **Search & Filter** — Search with instant suggestions, filter by genre/type/status/season
- 📺 **All Categories** — TV, Movies, OVA, ONA, Top Airing, Trending, Schedule
- 💾 **Continue Watching** — Auto-saves progress every 5 seconds to localStorage
- 📑 **Watchlist** — Add anime with status (Watching / Plan to Watch / Completed / On Hold / Dropped)
- 🕐 **History** — Auto-logs every episode you watch
- 📅 **Schedule** — Weekly airing calendar with live countdowns
- 🌙 **Dark Mode** — Default dark theme

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Run development server
npm run dev

# 3. Open http://localhost:3000
```

No `.env` needed — all API calls are proxied through `/api/proxy`.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 App Router |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| Video | HLS.js |
| State | Zustand (persisted to localStorage) |
| Data Fetching | TanStack Query v5 |
| API | aniwatch-api (proxied via /api/proxy) |

## Project Structure

```
src/
  app/
    page.tsx                    # Home
    anime/[id]/page.tsx         # Anime detail
    watch/[episodeId]/page.tsx  # Watch + video player
    search/page.tsx             # Search with filters
    genre/[genre]/page.tsx      # Genre listing
    schedule/page.tsx           # Airing schedule
    top-anime/page.tsx          # Rankings
    watchlist/page.tsx          # Your watchlist
    history/page.tsx            # Watch history
    movies/page.tsx             # Movies
    tv/page.tsx                 # TV Series
    ova/page.tsx                # OVA
    ona/page.tsx                # ONA
    api/
      proxy/[...path]/route.ts  # Proxies API (avoids CORS)
      stream/route.ts           # Proxies m3u8 + rewrites segment URLs
  components/
    layout/   Navbar, Footer
    ui/       AnimeCard, VideoPlayer, EpisodeList, Pagination, SkeletonCard
    home/     HeroCarousel, AnimeRow, ContinueWatching, GenreFilter
  hooks/      useAnime.ts (React Query wrappers)
  lib/        api.ts, utils.ts, constants.ts
  store/      progress.ts, watchlist.ts, history.ts (Zustand)
  types/      anime.ts, episode.ts, stream.ts
```

## How Streaming Works

1. Browser calls `/api/stream?url=ENCODED_M3U8_URL`
2. Server fetches the m3u8 from the CDN with correct `Referer`/`Origin` headers
3. All relative URLs in the playlist are rewritten to also go through `/api/stream`
4. HLS.js loads the proxied playlist and requests segments the same way

## Keyboard Shortcuts (Video Player)

| Key | Action |
|---|---|
| `Space` / `K` | Play / Pause |
| `F` | Toggle Fullscreen |
| `M` | Toggle Mute |
| `←` / `→` | Seek ±10s |
| `↑` / `↓` | Volume ±10% |
