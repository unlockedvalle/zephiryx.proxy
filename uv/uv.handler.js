// uv.handler.js – MÍNIMO Y SEGURO (sin importScripts)
self.addEventListener('fetch', event => {
  event.respondWith((async () => {
    const url = new URL(event.request.url);
    if (url.pathname.startsWith(__uv$config.prefix)) {
      const rewritten = __uv$config.decodeUrl(url.pathname.slice(__uv$config.prefix.length));
      return fetch(rewritten, event.request);
    }
    return fetch(event.request);
  })());
});
