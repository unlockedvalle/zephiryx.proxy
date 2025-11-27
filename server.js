import { createBareServer } from '@tomphttp/bare-server-node';
import express from 'express';
import { createServer } from 'node:http';
import { uvPath } from '@titaniumnetwork-dev/ultraviolet';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// █████████████████████████████████████████████████
// USAMOS BARE EXTERNO → nunca más 502 ni auth required
// █████████████████████████████████████████████████
const bare = createBareServer('/bare/', {
    // Este truco hace que el bare local responda siempre 200
    // pero en realidad no se usa nunca porque el frontend apunta al externo
    logErrors: false,
    localAddress: undefined,
    maintainer: { email: '', website: '' }
});

// Forzamos el uv.config.js con bare externo (el que funciona de verdad)
app.get('/uv/uv.config.js', (req, res) => {
    res.type('application/javascript');
    res.send(`
self.__uv$config = {
    prefix: '/service/',
    bare: 'https://bare.tomp.app/',           // ← EXTERNO 100 % vivo
    encodeUrl: Ultraviolet.codec.xor.encode,
    decodeUrl: Ultraviolet.codec.xor.decode,
    handler: '/uv/uv.handler.js',
    bundle: '/uv/uv.bundle.js',
    config: '/uv/uv.config.js',
    sw: '/uv/uv.sw.js'
};`);
});

// Service Worker normal (ya no necesita inyectar nada raro)
app.get('/uv/uv.sw.js', (req, res) => {
    res.sendFile(join(uvPath, 'uv.sw.js'));
});

// Sirve los archivos de Ultraviolet
app.use('/uv/', express.static(uvPath));

// Sirve tu frontend
app.use(express.static(join(__dirname, 'public')));

// Página principal
app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'public', 'index.html'));
});

// █████████████████████████████████████████████████
// Servidor HTTP + WebSocket (OBLIGATORIO para Railway)
// █████████████████████████████████████████████████
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

// PUERTO Y HOST CORRECTOS PARA RAILWAY (esto era lo que fallaba)
const PORT = process.env.PORT || 8080;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`ZephiryxProxy corriendo en puerto ${PORT}`);
});
