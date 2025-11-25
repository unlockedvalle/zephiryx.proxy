import { createBareServer } from '@tomphttp/bare-server-node';
import express from 'express';
import { createServer } from 'node:http';
import { uvPath } from '@titaniumnetwork-dev/ultraviolet';
import { join } from 'node:path';
import { hostname } from 'node:os';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const bare = createBareServer('/bare/');
const app = express();

// CORS headers - IMPORTANTE para GitHub Pages
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('X-Frame-Options', 'SAMEORIGIN');
  next();
});

// Servir archivos estáticos de Ultraviolet
app.use('/uv/', express.static(uvPath));

// Servir el frontend
app.use(express.static('public'));

// Ruta principal - HTML que maneja el proxy
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Zephiryx Proxy Backend</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
            background: linear-gradient(135deg, #064e3b 0%, #115e59 100%);
            color: white;
            height: 100vh;
            overflow: hidden;
        }
        #loading {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
        }
        .spinner {
            width: 50px;
            height: 50px;
            border: 4px solid rgba(16, 185, 129, 0.3);
            border-top-color: #10b981;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        #content {
            width: 100%;
            height: 100%;
            border: none;
            display: none;
        }
    </style>
</head>
<body>
    <div id="loading">
        <div class="spinner"></div>
        <p>Iniciando Zephiryx Proxy...</p>
    </div>
    <iframe id="content"></iframe>
    
    <script src="/uv/uv.bundle.js"></script>
    <script src="/uv/uv.config.js"></script>
    <script>
        const loading = document.getElementById('loading');
        const content = document.getElementById('content');
        
        // Registrar Service Worker
        async function init() {
            try {
                await navigator.serviceWorker.register('/uv/uv.sw.js', {
                    scope: '/service/'
                });
                
                // Esperar a que esté activo
                await navigator.serviceWorker.ready;
                
                // Obtener URL del hash
                const hash = window.location.hash;
                if (hash.startsWith('#q=')) {
                    const targetUrl = decodeURIComponent(hash.substring(3));
                    const proxyUrl = '/service/' + __uv$config.encodeUrl(targetUrl);
                    
                    content.src = proxyUrl;
                    content.style.display = 'block';
                    loading.style.display = 'none';
                } else {
                    loading.innerHTML = '<p style="color: #fbbf24;">❌ No se especificó URL. Usa el frontend para navegar.</p>';
                }
            } catch (error) {
                console.error('Error:', error);
                loading.innerHTML = '<p style="color: #ef4444;">❌ Error al inicializar el proxy</p>';
            }
        }
        
        // Detectar cambios en el hash
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash;
            if (hash.startsWith('#q=')) {
                const targetUrl = decodeURIComponent(hash.substring(3));
                const proxyUrl = '/service/' + __uv$config.encodeUrl(targetUrl);
                content.src = proxyUrl;
            }
        });
        
        init();
    </script>
</body>
</html>
  `);
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
