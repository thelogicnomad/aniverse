export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const urlParam = req.nextUrl.searchParams.get('url');
  if (!urlParam) return new NextResponse('Missing url', { status: 400 });
  const decoded = decodeURIComponent(urlParam);

  let referer = 'https://megacloud.blog/';
  try { const u = new URL(decoded); referer = `${u.protocol}//${u.hostname}/`; } catch {}

  const res = await fetch(decoded, {
    headers: {
      'Referer': referer,
      'Origin': referer.replace(/\/$/, ''),
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': '*/*',
    },
  });

  if (!res.ok) return new NextResponse(`Upstream error: ${res.status}`, { status: res.status });

  const contentType = res.headers.get('content-type') ?? '';
  const isM3U8 = decoded.includes('.m3u8') || contentType.includes('mpegurl');

  if (isM3U8) {
    const text = await res.text();
    const baseUrl = decoded.substring(0, decoded.lastIndexOf('/') + 1);

    const rewritten = text.split('\n').map(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return line;
      const absolute = trimmed.startsWith('http') ? trimmed : baseUrl + trimmed;
      // .ts segments → Service Worker handles in browser
      // nested .m3u8 → still goes through server proxy
      if (absolute.includes('.m3u8')) {
        return `/api/stream?url=${encodeURIComponent(absolute)}`;
      }
      return `/proxy-segment?url=${encodeURIComponent(absolute)}`;
    }).join('\n');

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
    },
  });
}