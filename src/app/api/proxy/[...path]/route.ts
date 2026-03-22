import { NextRequest, NextResponse } from 'next/server';

const BASE = 'https://aniwatch-api-tan-psi.vercel.app';

// These endpoints change per-request — never cache them
const NO_CACHE_PATHS = ['/episode/sources', '/episode/servers'];

export async function GET(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const apiPath = '/' + params.path.join('/');
    const searchParams = req.nextUrl.searchParams.toString();
    const url = `${BASE}${apiPath}${searchParams ? '?' + searchParams : ''}`;

    const shouldCache = !NO_CACHE_PATHS.some((p) => apiPath.includes(p));

    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      // Only cache stable endpoints (home, anime info, episodes list)
      // Never cache sources/servers — they are dynamic and failures must not be cached
      cache: shouldCache ? 'force-cache' : 'no-store',
      ...(shouldCache ? { next: { revalidate: 300 } } : {}),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`[Proxy] Upstream ${res.status} for ${url}:`, text.slice(0, 200));
      return NextResponse.json(
        { success: false, error: `Upstream error: ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, {
      headers: shouldCache
        ? { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' }
        : { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    console.error('[Proxy] error:', error);
    return NextResponse.json({ success: false, error: 'Proxy request failed' }, { status: 500 });
  }
}