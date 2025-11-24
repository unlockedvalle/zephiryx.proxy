import { createBareServer } from '@tomphttp/bare-server-node';
import express from 'express';
import { createServer } from 'node:http';
import { uvPath } from '@titaniumnetwork-dev/ultraviolet';
import { join } from 'node:path';
import { hostname } from 'node:os';

// CAMBIO AQUÍ → nueva librería oficial y segura
import { wispServer } from '@mercuryworkshop/wisp-js';

const bare = createBareServer('/bare/');
const app = express();

// CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
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
  } 
  // CAMBIO AQUÍ → nueva forma de usar wisp-js
  else if (req.url.startsWith('/wisp/')) {
    wispServer(req, socket, head);
  } 
  else {
    socket.end();
  }
});

const PORT = process.env.PORT || 8080;

server.on('listening', () => {
  const address = server.address();
  console.log(`Zephiryx Proxy Server escuchando en:`);
  console.log(` Local: http://localhost:${address.port}`);
  console.log(` Network: http://${hostname()}:${address.port}`);
  console.log(`\nBackend configurado correctamente`);
  console.log(` Bare Server: /bare/`);
  console.log(` Wisp Server: /wisp/`);
  console.log(` UV Path: /uv/`);
});

server.listen({ port: PORT });
