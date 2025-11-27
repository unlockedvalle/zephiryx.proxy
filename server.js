import { createBareServer } from '@tomphttp/bare-server-node';
import express from 'express';
import { createServer } from 'node:http';
import { uvPath } from '@titaniumnetwork-dev/ultraviolet';
import { hostname } from 'node:os';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const bare = createBareServer('/bare/');
const app = express();

// CRÍTICO: Sobrescribir /uv/uv.config.js con nuestra versión
app.get('/uv/uv.config.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.send(`// Configuración de Ultraviolet
self.__uv$config = {
    prefix: '/service/',
    bare: '/bare/',
    encodeUrl: (str) => encodeURIComponent(str),
    decodeUrl: (str) => decodeURIComponent(str),
    handler: '/uv/uv.handler.js',
    bundle: '/uv/uv.bundle.js',
    config: '/uv/uv.config.js',
    sw: '/uv/uv.sw.js',
};`);
});

// CRÍTICO: Header para permitir Service Worker en /service/
app.use((req, res, next) => {
  if (req.path.includes('uv.sw.js')) {
    res.setHeader('Service-Worker-Allowed', '/');
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  }
  next();
});

// Servir archivos del frontend PRIMERO (para que /uv.config.js sea el nuestro)
app.use(express.static(join(__dirname, 'public')));

// Servir archivos estáticos de Ultraviolet DESPUÉS
app.use('/uv/', express.static(uvPath));

// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

// Crear servidor HTTP
const server = createServer();

server.on('request', (req, res) => {
  if (bare.shouldRoute(req)) {
    bare.routeRequest(req, res);
  } else {
    app(req, res);
  }
});

server.on('upgrade', (req, socket, head) => {
  if (bare.shouldRoute(req)) {
    bare.routeUpgrade(req, socket, head);
  } else {
    socket.end();
  }
});

const PORT = process.env.PORT || 8080;

server.on('listening', () => {
  const address = server.address();
  console.log(`🚀 Zephiryx Proxy funcionando en puerto ${address.port}`);
  console.log(`✓ Backend listo`);
  console.log(`✓ Frontend listo`);
});

server.listen({ port: PORT });
