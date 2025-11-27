// uv.sw.js – OFICIAL DE TITANIUM NETWORK 2025 (merged con importScripts)
importScripts('/uv/uv.bundle.js');  // Carga UVServiceWorker y lógica principal
importScripts('/uv/uv.config.js');  // Carga __uv$config

const sw = new UVServiceWorker();  // Ahora sí existe

self.addEventListener('fetch', event => event.respondWith(sw.fetch(event)));
