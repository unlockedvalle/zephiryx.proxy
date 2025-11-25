// public/script.js → Versión corregida y probada en Railway
let history = [];
let favorites = JSON.parse(localStorage.getItem('zephiryx-favorites') || '[]');
let historyIndex = -1;
let swReady = false;

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

// Registrar Service Worker (CORREGIDO)
async function registerSW() {
    if ('serviceWorker' in navigator) {
        try {
            statusText.textContent = 'Iniciando Service Worker...';
           
            const registration = await navigator.serviceWorker.register('/uv/uv.sw.js', {
                scope: '/uv/'          // ← ahora coincide con la ubicación del archivo
            });
            await navigator.serviceWorker.ready;
           
            swReady = true;
            statusText.textContent = 'Conectado y listo';
            goBtn.disabled = false;
            console.log('Service Worker registrado correctamente');
           
        } catch (error) {
            console.error('Error SW:', error);
            statusText.textContent = 'Error al iniciar';
            alert('Error al iniciar el proxy: ' + error.message);
        }
    }
}

// Navegar a URL (RUTA CORREGIDA)
function navigate(url) {
    if (!url) return;
    if (!swReady) {
        alert('Espera a que el proxy se inicie...');
        return;
    }
    let formattedUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        formattedUrl = 'https://' + url;
    }
    homePage.style.display = 'none';
    loadingScreen.style.display = 'flex';
    proxyFrame.style.display = 'none';

    // ← RUTA CORREGIDA AQUÍ
    const proxyUrl = '/uv/service/' + __uv$config.encodeUrl(formattedUrl);

    proxyFrame.src = proxyUrl;
    urlInput.value = formattedUrl;
   
    history = history.slice(0, historyIndex + 1);
    history.push(formattedUrl);
    historyIndex = history.length - 1;
    updateButtons();
    starBtn.style.display = 'block';
    updateStar();
    renderHistory();
}

// (El resto del código queda exactamente igual)
function updateButtons() {
    backBtn.disabled = historyIndex <= 0;
    forwardBtn.disabled = historyIndex >= history.length - 1;
    refreshBtn.disabled = historyIndex < 0;
}
function updateStar() {
    if (historyIndex >= 0) {
        const active = favorites.includes(history[historyIndex]);
        starBtn.classList.toggle('active', active);
    }
}
function goBack() {
    if (historyIndex > 0) {
        historyIndex--;
        urlInput.value = history[historyIndex];
        navigate(history[historyIndex]);
    }
}
function goForward() {
    if (historyIndex < history.length - 1) {
        historyIndex++;
        urlInput.value = history[historyIndex];
        navigate(history[historyIndex]);
    }
}
function refresh() {
    if (historyIndex >= 0) {
        navigate(history[historyIndex]);
    }
}
function goHome() {
    homePage.style.display = 'block';
    loadingScreen.style.display = 'none';
    proxyFrame.style.display = 'none';
    proxyFrame.src = '';
    urlInput.value = '';
    starBtn.style.display = 'none';
}
function toggleFavorite() {
    if (historyIndex >= 0) {
        const url = history[historyIndex];
        const index = favorites.indexOf(url);
        if (index > -1) {
            favorites.splice(index, 1);
        } else {
            favorites.push(url);
        }
        localStorage.setItem('zephiryx-favorites', JSON.stringify(favorites));
        updateStar();
        renderFavorites();
    }
}
function renderHistory() {
    if (history.length === 0) {
        historyList.innerHTML = '<p class="empty-message">No hay historial aún</p>';
        return;
    }
    historyList.innerHTML = [...history].reverse().map(url =>
        `<div class="sidebar-item" onclick="urlInput.value='${url}';navigate('${url}');historySidebar.classList.remove('active')">
            <div class="sidebar-item-text">${url}</div>
        </div>`
    ).join('');
}
function renderFavorites() {
    if (favorites.length === 0) {
        favoritesList.innerHTML = '<p class="empty-message">No hay favoritos aún</p>';
        return;
    }
    favoritesList.innerHTML = favorites.map(url =>
        `<div class="sidebar-item">
            <div class="sidebar-item-text" onclick="urlInput.value='${url}';navigate('${url}');favoritesSidebar.classList.remove('active')">${url}</div>
            <button class="delete-btn" onclick="event.stopPropagation();removeFavorite('${url}')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
        </div>`
    ).join('');
}
function removeFavorite(url) {
    favorites = favorites.filter(f => f !== url);
    localStorage.setItem('zephiryx-favorites', JSON.stringify(favorites));
    renderFavorites();
    updateStar();
}

// Event listeners (sin cambios)
urlInput.addEventListener('input', e => {
    clearBtn.style.display = e.target.value ? 'block' : 'none';
});
urlInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') navigate(urlInput.value);
});
goBtn.addEventListener('click', () => navigate(urlInput.value));
clearBtn.addEventListener('click', () => {
    urlInput.value = '';
    clearBtn.style.display = 'none';
});
backBtn.addEventListener('click', goBack);
forwardBtn.addEventListener('click', goForward);
refreshBtn.addEventListener('click', refresh);
homeBtn.addEventListener('click', goHome);
starBtn.addEventListener('click', toggleFavorite);
historyBtn.addEventListener('click', () => {
    historySidebar.classList.toggle('active');
    favoritesSidebar.classList.remove('active');
});
favoritesBtn.addEventListener('click', () => {
    favoritesSidebar.classList.toggle('active');
    historySidebar.classList.remove('active');
});
closeHistory.addEventListener('click', () => historySidebar.classList.remove('active'));
closeFavorites.addEventListener('click', () => favoritesSidebar.classList.remove('active'));

document.querySelectorAll('.site-card').forEach(card => {
    card.addEventListener('click', () => {
        const url = card.dataset.url;
        urlInput.value = url;
        navigate(url);
    });
});

proxyFrame.addEventListener('load', () => {
    setTimeout(() => {
        loadingScreen.style.display = 'none';
        proxyFrame.style.display = 'block';
    }, 800);
});

// Iniciar
registerSW();
renderFavorites();
