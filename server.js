import { createBareServer } from '@tomphttp/bare-server-node';
import express from 'express';
import { createServer } from 'node:http';
import { uvPath } from '@titaniumnetwork-dev/ultraviolet';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const bare = createBareServer('/bare/');

// NO SOBRESCRIBAS NADA → deja que use los archivos correctos de la carpeta uv/
app.use('/uv/', express.static(uvPath));

// Sirve los archivos estáticos del frontend
app.use(express.static(join(__dirname, 'public')));

// Ruta raíz
app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'public', 'index.html'));
});

// Servidor HTTP + Bare
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
server.listen(PORT, () => {
    console.log(`Zephiryx corriendo en puerto ${PORT}`);
});
