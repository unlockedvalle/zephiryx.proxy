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

// CORS headers - PERMITIR IFRAMES desde GitHub Pages
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  // CRÍTICO: Permitir que se cargue en iframes desde cualquier origen
  res.removeHeader('X-Frame-Options');
  res.header('Content-Security-Policy', "frame-ancestors *");
  next();
});

// Servir archivos estáticos de Ultraviolet con headers especiales
app.use('/uv/', (req, res, next) => {
  // CRÍTICO: Permitir que el Service Worker controle /service/
  if (req.path.includes('uv.sw.js')) {
    res.header('Service-Worker-Allowed', '/');
    res.header('Content-Type', 'application/javascript');
  }
  next();
}, express.static(uvPath));

// Servir el frontend (si tienes archivos en /public)
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
            z-index: 10;
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
        .logo {
            font-size: 3rem;
            margin-bottom: 1rem;
        }
    </style>
</head>
<body>
    <div id="loading">
        <div class="logo">⚡</div>
        <div class="spinner"></div>
        <p>Iniciando Zephiryx Proxy...</p>
        <p style="font-size: 0.8rem; margin-top: 1rem; opacity: 0.7;">Powered by Ultraviolet</p>
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
                const registration = await navigator.serviceWorker.register('/uv/uv.sw.js', {
                    scope: '/service/'
                });
                
                // Esperar a que esté activo
                await navigator.serviceWorker.ready;
                
                console.log('Service Worker registrado correctamente');
                
                // Obtener URL del hash
                const hash = window.location.hash;
                if (hash.startsWith('#q=')) {
                    const targetUrl = decodeURIComponent(hash.substring(3));
                    const proxyUrl = '/service/' + __uv$config.encodeUrl(targetUrl);
                    
                    console.log('Cargando:', targetUrl);
                    content.src = proxyUrl;
                    
                    // Mostrar el contenido después de un pequeño delay
                    setTimeout(() => {
                        content.style.display = 'block';
                        loading.style.display = 'none';
                    }, 1000);
                } else {
                    loading.innerHTML = '<div class="logo">⚡</div><p style="color: #fbbf24;">No se especificó URL</p><p style="font-size: 0.9rem; margin-top: 1rem;">Usa el frontend de Zephiryx para navegar</p>';
                }
            } catch (error) {
                console.error('Error:', error);
                loading.innerHTML = '<div class="logo">❌</div><p style="color: #ef4444;">Error al inicializar el proxy</p><p style="font-size: 0.8rem; margin-top: 1rem;">' + error.message + '</p>';
            }
        }
        
        // Detectar cambios en el hash para navegación
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash;
            if (hash.startsWith('#q=')) {
                loading.style.display = 'block';
                content.style.display = 'none';
                
                const targetUrl = decodeURIComponent(hash.substring(3));
                const proxyUrl = '/service/' + __uv$config.encodeUrl(targetUrl);
                
                console.log('Navegando a:', targetUrl);
                content.src = proxyUrl;
                
                setTimeout(() => {
                    content.style.display = 'block';
                    loading.style.display = 'none';
                }, 1000);
            }
        });
        
        // Manejo de errores del iframe
        content.addEventListener('error', (e) => {
            console.error('Error en iframe:', e);
            loading.innerHTML = '<div class="logo">⚠️</div><p style="color: #fbbf24;">Error al cargar el sitio</p>';
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
  console.log(`   Iframe-friendly: ✓`);
});

server.listen({ port: PORT });
