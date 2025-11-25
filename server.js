import { createBareServer } from '@tomphttp/bare-server-node';
import express from 'express';
import { createServer } from 'node:http';
import { uvPath } from '@titaniumnetwork-dev/ultraviolet';
import { join } from 'node:path';
import { hostname } from 'node:os';

const bare = createBareServer('/bare/');
const app = express();

// CORS headers - IMPORTANTE para GitHub Pages
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Service-Worker');
  res.header('Service-Worker-Allowed', '/');
  res.header('Cross-Origin-Embedder-Policy', 'require-corp');
  res.header('Cross-Origin-Opener-Policy', 'same-origin');
  
  // Para Service Workers desde GitHub Pages
  if (req.path.includes('uv.sw.js')) {
    res.header('Content-Type', 'application/javascript');
    res.header('Service-Worker-Allowed', '/');
  }
  
  next();
});

// Servir archivos estáticos de Ultraviolet
app.use('/uv/', express.static(uvPath));

// Servir el frontend
app.use(express.static('public'));

// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(join(process.cwd(), 'public', 'index.html'));
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
  console.log(`🚀 Zephiryx Proxy Server escuchando en:`);
  console.log(`   Local:   http://localhost:${address.port}`);
  console.log(`   Network: http://${hostname()}:${address.port}`);
  console.log(`\n✨ Backend configurado correctamente`);
  console.log(`   Bare Server: /bare/`);
  console.log(`   UV Path: /uv/`);
});

server.listen({ port: PORT });
