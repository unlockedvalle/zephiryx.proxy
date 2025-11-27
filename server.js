// server.js → VERSIÓN FINAL QUE NUNCA FALLA EN RAILWAY (2025)
import { createBareServer } from '@tomphttp/bare-server-node';
import express from 'express';
import { createServer } from 'node:http';
import { join, dirname } from 'node:path';        // ← AQUÍ ESTABA EL ERROR
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);          // ← ahora sí existe dirname

const app = express();
const bare = createBareServer('/bare/');

// Sirve Ultraviolet (usa la carpeta uv/ que bajaste con ultraviolet-static)
app.use('/uv/', express.static(join(__dirname, 'uv')));

// Sirve tu frontend
app.use(express.static(join(__dirname, 'public')));

// Ruta raíz
app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'public', 'index.html'));
});

// Servidor combinado Bare + Express
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

// ← ESTO ES LO QUE NECESITA RAILWAY PARA NO DAR "failed to respond"
const PORT = process.env.PORT || 8080;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Zephiryx corriendo en el puerto ${PORT}`);
});
