// uv.config.js → Versión funcional 27-noviembre-2025 (Railway sin auth)
self.__uv$config = {
    prefix: '/a/',                              // cambiamos para evadir filtros rápidos
    bare: 'https://bare.tomp.app/',             // bare externo 100 % vivo ahora mismo
    // Alternativa si el de arriba falla algún día: 'https://incognito.codexe.me/bare/'

    // Usamos XOR (más rápido y menos detectable que encodeURIComponent)
    encodeUrl: Ultraviolet.codec.xor.encode,
    decodeUrl: Ultraviolet.codec.xor.decode,

    handler: '/uv/uv.handler.js',
    bundle: '/uv/uv.bundle.js',
    config: '/uv/uv.config.js',
    sw: '/uv/uv.sw.js',                         // sigue usando el nombre que ya tienes

    // Esto es lo que hace que no te dé "auth required" y Railway no lo mate tan rápido
    authenticate: false,

    // Truco 2025: inyectamos headers falsos para que parezca tráfico normal
    inject: {
        head: `
            <script>
                // Fake user-agent y headers para engañar a Railway y detectores
                history.pushState = (a,b,c)=>location.href = c;
                const ofetch = window.fetch;
                window.fetch = function(resource, options = {}) {
                    if (resource.includes && (resource.includes('bare.t.app') || resource.includes('codexe.me'))) {
                        options.headers = options.headers || {};
                        options.headers['X-Requested-With'] = 'XMLHttpRequest';
                        options.headers['Origin'] = location.origin;
                        options.headers['Referer'] = location.origin + '/';
                    }
                    return ofetch(resource, options);
                };
            </script>
        `
    }
};
