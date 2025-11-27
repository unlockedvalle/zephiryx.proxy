// uv.handler.js – OFICIAL DE TITANIUM NETWORK 2025 (sin importScripts externos)
const handler = new UVHandler();

self.addEventListener('fetch', event => event.respondWith(handler.fetch(event)));
