self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.pathname.startsWith('/proxy-segment')) {
    const target = decodeURIComponent(url.searchParams.get('url'));
    event.respondWith(
      fetch(target, {
        headers: {
          'Referer': new URL(target).origin + '/',
          'Origin': new URL(target).origin,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': '*/*',
        },
        mode: 'cors',
      })
    );
  }
});