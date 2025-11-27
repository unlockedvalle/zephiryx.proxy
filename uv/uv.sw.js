// uv.sw.js – WRAPPER OFICIAL DE TITANIUM NETWORK 2025 (importa bundle y config PRIMERO)
importScripts('/uv/uv.bundle.js');  // ← BUNDLE PRIMERO (define UVServiceWorker)
importScripts('/uv/uv.config.js');  // ← CONFIG SEGUNDO (usa el bundle)

importScripts('/uv/uv.sw.js');  // ← IMPORTA EL SW MINIMAL DESPUÉS (de las docs)

const sw = new UVServiceWorker();  // ← AHORA SÍ ESTÁ DEFINIDO

self.addEventListener('fetch', event => event.respondWith(sw.fetch(event)));
