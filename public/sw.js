self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (!url.pathname.startsWith('/proxy-segment')) return;

  const target = decodeURIComponent(url.searchParams.get('url'));
  let referer = 'https://megacloud.blog/';
  try { const u = new URL(target); referer = `${u.protocol}//${u.hostname}/`; } catch {}

  event.respondWith((async () => {
    const res = await fetch(target, {
      headers: {
        'Referer': referer,
        'Origin': referer.replace(/\/$/, ''),
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': '*/*',
      },
      mode: 'cors',
    });

    const contentType = res.headers.get('content-type') ?? '';
    const isM3U8 = target.includes('.m3u8') || contentType.includes('mpegurl');

    if (!isM3U8) return res;

    // Rewrite m3u8 so all segments also go through SW
    const text = await res.text();
    const baseUrl = target.substring(0, target.lastIndexOf('/') + 1);
    const rewritten = text.split('\n').map(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return line;
      const absolute = trimmed.startsWith('http') ? trimmed : baseUrl + trimmed;
      return `/proxy-segment?url=${encodeURIComponent(absolute)}`;
    }).join('\n');

    return new Response(rewritten, {
      headers: {
        'Content-Type': 'application/vnd.apple.mpegurl',
        'Access-Control-Allow-Origin': '*',
      },
    });
  })());
});