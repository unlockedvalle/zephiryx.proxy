// server.js → UN SOLO PROYECTO, ARREGLADO PARA /service/ + BARE (noviembre 2025)
import { createBareServer } from '@tomphttp/bare-server-node';
import express from 'express';
import { createServer } from 'node:http';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// CORS OBLIGATORIO PARA UV + SW (evita 404 en /service/)
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

// Sirve UV static (con header para SW)
app.use('/uv/', (req, res, next) => {
  if (req.url === '/uv.sw.js') {
    res.setHeader('Service-Worker-Allowed', '/');
  }
  express.static(join(__dirname, 'uv'))(req, res, next);
});

// Sirve frontend static
app.use(express.static(join(__dirname, 'public')));

// Ruta raíz
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

// RUTA CRÍTICA PARA /service/ – RETORNA 200 VACÍO PARA QUE SW INTERCEPTE (lo que faltaba)
app.use('/service/', (req, res) => {
  res.status(200).end();  // SW de UV lo maneja, no Express
});

// Catch-all para otros 404 (opcional, pero bueno para debug)
app.use((req, res) => {
  res.status(404).send('404 - Ruta no encontrada');
});

const bare = createBareServer('/bare/');

// Servidor combinado: BARE PRIMERO (prioridad), Express DESPUÉS
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
  console.log(`Zephiryx + Bare ON en puerto ${PORT} – SW intercepta /service/`);
});
