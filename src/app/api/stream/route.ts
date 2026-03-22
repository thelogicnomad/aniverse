import { NextRequest, NextResponse } from 'next/server';

// Try Node.js runtime instead of Edge - might use different IP pool
export const runtime = 'edge';  // Changed back for Cloudflare compatibility
export const maxDuration = 30; // Vercel Pro: 30s, Hobby: 10s max

export async function GET(req: NextRequest) {
  const urlParam = req.nextUrl.searchParams.get('url');
  console.log('[Stream API] Request received, url param:', urlParam ? urlParam.substring(0, 100) + '...' : 'MISSING');

  if (!urlParam) return new NextResponse('Missing url', { status: 400 });

  const decoded = decodeURIComponent(urlParam);
  const isM3U8Request = decoded.includes('.m3u8');
  const isTsSegment = decoded.includes('.ts');

  console.log('[Stream API] Decoded URL type:', isM3U8Request ? 'M3U8 playlist' : isTsSegment ? 'TS segment' : 'Other');
  console.log('[Stream API] Fetching from:', decoded.substring(0, 80) + '...');

  try {
    const startTime = Date.now();
    const res = await fetch(decoded, {
      headers: {
  'Referer': 'https://megacloud.blog/',
  'Origin': 'https://megacloud.blog',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': '*/*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Sec-Fetch-Dest': 'empty',
  'Sec-Fetch-Mode': 'cors',
  'Sec-Fetch-Site': 'cross-site',
},
    });

    const fetchDuration = Date.now() - startTime;
    console.log('[Stream API] Upstream response:', res.status, 'in', fetchDuration, 'ms');

    if (!res.ok) {
      console.error('[Stream API] Upstream FAILED:', res.status, res.statusText);
      return new NextResponse(`Upstream error: ${res.status}`, { status: res.status });
    }

    const contentType = res.headers.get('content-type') ?? '';
    const isM3U8 = decoded.includes('.m3u8') || contentType.includes('mpegurl');
    console.log('[Stream API] Content-Type:', contentType, '| isM3U8:', isM3U8);

    if (isM3U8) {
      const text = await res.text();
      const baseUrl = decoded.substring(0, decoded.lastIndexOf('/') + 1);
      console.log('[Stream API] M3U8 content length:', text.length, 'chars');

      // Check if we should proxy segments or let browser fetch directly
      // Set to false to try direct fetching (bypasses Vercel IP blocking)
      const PROXY_SEGMENTS = false;

      const rewritten = text
        .split('\n')
        .map((line) => {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) return line;
          const absolute = trimmed.startsWith('http') ? trimmed : baseUrl + trimmed;
          // If PROXY_SEGMENTS is false, return direct URLs for .ts segments
          if (!PROXY_SEGMENTS && (absolute.includes('.ts') || absolute.includes('.m4s'))) {
            return absolute; // Direct URL - browser fetches directly
          }
          return `/api/stream?url=${encodeURIComponent(absolute)}`;
        })
        .join('\n');

      console.log('[Stream API] M3U8 rewritten successfully, returning playlist');
      return new NextResponse(rewritten, {
        headers: {
          'Content-Type': 'application/vnd.apple.mpegurl',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-cache',
        },
      });
    }

    const buffer = await res.arrayBuffer();
    const bufferSizeKB = Math.round(buffer.byteLength / 1024);
    console.log('[Stream API] Binary segment size:', bufferSizeKB, 'KB');

    if (buffer.byteLength > 4 * 1024 * 1024) {
      console.warn('[Stream API] WARNING: Segment exceeds 4MB edge limit! Size:', bufferSizeKB, 'KB');
    }

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType || 'video/mp2t',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (err) {
    console.error('[Stream API] PROXY ERROR:', err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error('[Stream API] Error details:', errorMessage);
    return new NextResponse(`Stream proxy failed: ${errorMessage}`, { status: 500 });
  }
}