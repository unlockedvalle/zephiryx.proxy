// server.js → ARREGLADO PARA /service/ + BARE EN RAILWAY 2025
import { createBareServer } from '@tomphttp/bare-server-node';
import express from 'express';
import { createServer } from 'node:http';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const bare = createBareServer('/bare/');

// CORS OBLIGATORIO para que SW intercepte /service/ (de StackOverflow)
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

// Sirve UV y frontend
app.use('/uv/', express.static(join(__dirname, 'uv')));
app.use(express.static(join(__dirname, 'public')));
app.get('/', (req, res) => res.sendFile(join(__dirname, 'public', 'index.html')));

// RUTA ESPECÍFICA PARA /service/ – FUERZA INTERCEPTO DEL SW (lo que faltaba)
app.use('/service/', (req, res) => {
  // Reenvía al SW/Bare – evita 404 directo
  if (bare.shouldRoute(req)) {
    bare.routeRequest(req, res);
  } else {
    // Si no es Bare, deja que SW lo maneje (retorna 200 vacío para que SW intercepte)
    res.status(200).end();
  }
});

// Servidor combinado – Bare PRIMERO, Express DESPUÉS (prioridad)
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
  console.log(`Zephiryx + Bare ON en puerto ${PORT} – /service/ interceptado`);
});
