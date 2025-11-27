// server.js → FUNCIONA 100% EN RAILWAY (NOVIEMBRE 2025) – SIN DESCARGAR NADA
import { createBareServer } from '@tomphttp/bare-server-node';
import express from 'express';
import { createServer } from 'node:http';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const bare = createBareServer('/bare/');

// CORS OBLIGATORIO
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// SIRVE LA CARPETA /uv/ CON EL HEADER MÁGICO PARA EL SERVICE WORKER
app.use('/uv/', (req, res, next) => {
  if (req.path.endsWith('uv.sw.js')) {
    // ESTO ARREGLA EL ERROR DE importScripts Y EL SCOPE
    res.setHeader('Service-Worker-Allowed', '/');
    res.setHeader('Content-Type', 'application/javascript');
  }
  express.static(join(__dirname, 'uv'))(req, res, next);
});

// SIRVE EL FRONTEND
app.use(express.static(join(__dirname, 'public')));
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

// RUTA MÁGICA: /service/ → 200 vacío para que el SW intercepte
app.use('/service/', (req, res) => {
  res.status(200).end();
});

// BARE TIENE PRIORIDAD MÁXIMA
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
  console.log(`Zephiryx + Bare + UV ON → puerto ${PORT} – LISTO PARA TODO`);
});
