// server.js → ÚNICO PROYECTO, FUNCIONA 100% EN RAILWAY 2025
import { createBareServer } from '@tomphttp/bare-server-node';
import express from 'express';
import { createServer } from 'node:http';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const bare = createBareServer('/bare/');  // ← Ruta del Bare

// === IMPORTANTE: CORS para que Ultraviolet no de 404 ===
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

// Sirve Ultraviolet static
app.use('/uv/', express.static(join(__dirname, 'uv')));

// Sirve el frontend
app.use(express.static(join(__dirname, 'public')));
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

// === RUTEO FINAL: Bare primero, Express después ===
const server = createServer((req, res) => {
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
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Zephiryx + Bare EN UN SOLO PROYECTO corriendo en puerto ${PORT}`);
});
