import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const urlParam = req.nextUrl.searchParams.get('url');
  if (!urlParam) return new NextResponse('Missing url', { status: 400 });

  const decoded = decodeURIComponent(urlParam);

  try {
    const res = await fetch(decoded, {
      headers: {
        'Referer': 'https://megacloud.blog/',
        'Origin': 'https://megacloud.blog',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'cross-site',
      },
    });

    if (!res.ok) {
      return new NextResponse(`Upstream error: ${res.status}`, { status: res.status });
    }

    const contentType = res.headers.get('content-type') ?? '';
    const isM3U8 = decoded.includes('.m3u8') || contentType.includes('mpegurl');

    if (isM3U8) {
      const text = await res.text();
      const baseUrl = decoded.substring(0, decoded.lastIndexOf('/') + 1);

      const rewritten = text
        .split('\n')
        .map((line) => {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) return line;
          const absolute = trimmed.startsWith('http') ? trimmed : baseUrl + trimmed;
          return `/api/stream?url=${encodeURIComponent(absolute)}`;
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

    const buffer = await res.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType || 'video/mp2t',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return new NextResponse(`Stream proxy failed: ${errorMessage}`, { status: 500 });
  }
}