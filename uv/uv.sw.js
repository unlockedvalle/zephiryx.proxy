// uv.sw.js – MERGED CON IMPORTSCRIPTS (funciona 100% en Railway 2025)
importScripts('/uv/uv.bundle.js');
importScripts('/uv/uv.config.js');

const sw = new UVServiceWorker();

self.addEventListener('fetch', event => event.respondWith(sw.fetch(event)));
