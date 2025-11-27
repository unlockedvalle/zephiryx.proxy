// Estado de la aplicación
let history = [];
let favorites = JSON.parse(localStorage.getItem('zephiryx-favorites') || '[]');
let historyIndex = -1;
let swReady = false;

// Elementos DOM
const urlInput = document.getElementById('url-input');
const goBtn = document.getElementById('go-btn');
const clearBtn = document.getElementById('clear-btn');
const backBtn = document.getElementById('back-btn');
const forwardBtn = document.getElementById('forward-btn');
const refreshBtn = document.getElementById('refresh-btn');
const homeBtn = document.getElementById('home-btn');
const starBtn = document.getElementById('star-btn');
const statusText = document.getElementById('status-text');
const historyBtn = document.getElementById('history-btn');
const favoritesBtn = document.getElementById('favorites-btn');
const historySidebar = document.getElementById('history-sidebar');
const favoritesSidebar = document.getElementById('favorites-sidebar');
const closeHistory = document.getElementById('close-history');
const closeFavorites = document.getElementById('close-favorites');
const historyList = document.getElementById('history-list');
const favoritesList = document.getElementById('favorites-list');
const homePage = document.getElementById('home-page');
const loadingScreen = document.getElementById('loading-screen');
const proxyFrame = document.getElementById('proxy-frame');

// Registrar Service Worker (CORREGIDO Y OPTIMIZADO 2025)
async function registerSW() {
    if (!('serviceWorker' in navigator)) {
        statusText.textContent = 'Navegador no compatible';
        return alert('Tu navegador no soporta Service Workers');
    }

    try {
        statusText.textContent = 'Iniciando proxy...';

        // Registro con scope raíz + header forzado (funciona 100% en Railway)
        const registration = await navigator.serviceWorker.register('/uv/uv.sw.js', {
            scope: '/'  // ¡Scope en raíz! (requiere header en Railway → te lo digo abajo)
        });

        console.log('Service Worker registrado con scope /');

        // Forzar activación inmediata
        if (registration.installing) {
            console.log('Instalando SW...');
        } else if (registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }

        await navigator.serviceWorker.ready;
        swReady = true;

        statusText.textContent = 'Conectado y listo';
        goBtn.disabled = false;
        console.log('Service Worker 100% activo');

    } catch (err) {
        console.error('Error al registrar SW:', err);
        statusText.textContent = 'Error crítico';
        alert('Error fatal del proxy:\n' + err.message + '\n\nRevisa la consola (F12)');
    }
}

// Escuchar cuando el nuevo SW tome el control
navigator.serviceWorker.addEventListener('controllerchange', () => {
    console.log('Nuevo Service Worker activado');
    window.location.reload(); // Recarga para que todo use el nuevo SW
});

// Navegar
function navigate(url) {
    if (!url.trim()) return;
    if (!swReady) return alert('Espera a que el proxy termine de cargar...');

    let formatted = url.trim();
    if (!/^https?:\/\//i.test(formatted)) {
        formatted = 'https://' + formatted;
    }

    homePage.style.display = 'none';
    loadingScreen.style.display = 'flex';
    proxyFrame.style.display = 'none';

    const encoded = __uv$config.encodeUrl(formatted);
    proxyFrame.src = __uv$config.prefix + encoded;

    urlInput.value = formatted;

    // Historial
    history = history.slice(0, historyIndex + 1);
    history.push(formatted);
    historyIndex = history.length - 1;

    updateButtons();
    starBtn.style.display = 'block';
    updateStar();
    renderHistory();
}

// Resto de funciones (sin cambios, solo más limpias)
function updateButtons() {
    backBtn.disabled = historyIndex <= 0;
    forwardBtn.disabled = historyIndex >= history.length - 1;
}
function updateStar() {
    if (historyIndex === -1) return;
    starBtn.classList.toggle('active', favorites.includes(history[historyIndex]));
}
function goBack() { if (historyIndex > 0) { historyIndex--; navigate(history[historyIndex]); }}
function goForward() { if (historyIndex < history.length - 1) { historyIndex++; navigate(history[historyIndex]); }}
function refresh() { if (historyIndex >= 0) navigate(history[historyIndex]); }
function goHome() {
    homePage.style.display = 'block';
    loadingScreen.style.display = 'none';
    proxyFrame.style.display = 'none';
    proxyFrame.src = '';
    urlInput.value = '';
    starBtn.style.display = 'none';
}
function toggleFavorite() {
    if (historyIndex === -1) return;
    const url = history[historyIndex];
    const i = favorites.indexOf(url);
    if (i > -1) favorites.splice(i, 1);
    else favorites.push(url);
    localStorage.setItem('zephiryx-favorites', JSON.stringify(favorites));
    updateStar();
    renderFavorites();
}

function renderHistory() {
    historyList.innerHTML = history.length === 0
        ? '<p class="empty-message">No hay historial</p>'
        : [...history].reverse().map(url => `
            <div class="sidebar-item" onclick="navigate('${url}');historySidebar.classList.remove('active')">
                <div class="sidebar-item-text">${url}</div>
            </div>`).join('');
}

function renderFavorites() {
    favoritesList.innerHTML = favorites.length === 0
        ? '<p class="empty-message">No hay favoritos</p>'
        : favorites.map(url => `
            <div class="sidebar-item">
                <div class="sidebar-item-text" onclick="navigate('${url}');favoritesSidebar.classList.remove('active')">${url}</div>
                <button class="delete-btn" onclick="event.stopPropagation();removeFavorite('${url}')">✕</button>
            </div>`).join('');
}

function removeFavorite(url) {
    favorites = favorites.filter(f => f !== url);
    localStorage.setItem('zephiryx-favorites', JSON.stringify(favorites));
    renderFavorites();
    updateStar();
}

// Eventos
urlInput.addEventListener('keypress', e => e.key === 'Enter' && navigate(urlInput.value));
goBtn.addEventListener('click', () => navigate(urlInput.value));
clearBtn.addEventListener('click', () => { urlInput.value = ''; clearBtn.style.display = 'none'; });
backBtn.onclick = goBack;
forwardBtn.onclick = goForward;
refreshBtn.onclick = refresh;
homeBtn.onclick = goHome;
starBtn.onclick = toggleFavorite;
historyBtn.onclick = () => { historySidebar.classList.toggle('active'); favoritesSidebar.classList.remove('active'); };
favoritesBtn.onclick = () => { favoritesSidebar.classList.toggle('active'); historySidebar.classList.remove('active'); };
closeHistory.onclick = () => historySidebar.classList.remove('active');
closeFavorites.onclick = () => favoritesSidebar.classList.remove('active');

document.querySelectorAll('.site-card').forEach(card => {
    card.onclick = () => { urlInput.value = card.dataset.url; navigate(card.dataset.url); };
});

urlInput.addEventListener('input', () => clearBtn.style.display = urlInput.value ? 'block' : 'none');

proxyFrame.onload = () => {
    setTimeout(() => {
        loadingScreen.style.display = 'none';
        proxyFrame.style.display = 'block';
    }, 600);
};

// INICIAR
registerSW();
renderFavorites();
