import { createBareServer } from '@tomphttp/bare-server-node';
import express from 'express';
import { createServer } from 'node:http';
import { uvPath } from '@titaniumnetwork-dev/ultraviolet';
import { join } from 'node:path';
import { hostname } from 'node:os';
import { wispServer } from '@mercuryworkshop/wisp-js';

const bare = createBareServer('/bare/');
const app = express();

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Ultraviolet static files
app.use('/uv/', express.static(uvPath));

// Frontend
app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile(join(process.cwd(), 'public', 'index.html'));
});

// HTTP server
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
  } else if (req.url.startsWith('/wisp/')) {
    wispServer(req, socket, head);
  } else {
    socket.end();
  }
});

// PUERTO Y HOST FIJOS PARA RAILWAY
const PORT = process.env.PORT || 8080;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Zephiryx Proxy corriendo en el puerto ${PORT}`);
  console.log(`http://0.0.0.0:${PORT}`);
  console.log(`Bare: /bare/  •  Wisp: /wisp/  •  UV: /uv/`);
});
