import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const urlParam = req.nextUrl.searchParams.get('url');
  if (!urlParam) return new NextResponse('Missing url param', { status: 400 });

  const decoded = decodeURIComponent(urlParam);

  try {
    const res = await fetch(decoded, {
      headers: {
        Referer: 'https://megacloud.blog/',
        Origin: 'https://megacloud.blog',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!res.ok) {
      return new NextResponse(`Upstream error: ${res.status}`, { status: res.status });
    }

    const contentType = res.headers.get('content-type') ?? '';
    const isM3U8 =
      decoded.includes('.m3u8') ||
      contentType.includes('mpegurl') ||
      contentType.includes('x-mpegURL');

    if (isM3U8) {
      const text = await res.text();
      const baseUrl = decoded.substring(0, decoded.lastIndexOf('/') + 1);

      const rewritten = text
        .split('\n')
        .map((line) => {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) return line;

          let absoluteUrl: string;
          if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
            absoluteUrl = trimmed;
          } else {
            absoluteUrl = baseUrl + trimmed;
          }

          return `/api/stream?url=${encodeURIComponent(absoluteUrl)}`;
        })
        .join('\n');

      return new NextResponse(rewritten, {
        headers: {
          'Content-Type': 'application/vnd.apple.mpegurl',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-cache',
        },
      });
    }

    // Forward binary data (ts segments, vtt subtitles, etc.)
    const buffer = await res.arrayBuffer();
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType || 'application/octet-stream',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (err) {
    console.error('Stream proxy error:', err);
    return new NextResponse('Stream proxy failed', { status: 500 });
  }
}
