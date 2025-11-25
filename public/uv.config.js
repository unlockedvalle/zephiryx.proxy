// public/uv.config.js → carga Ultraviolet desde CDN (nunca más errores)
self.__uv$config = {
    prefix: '/uv/service/',
    bare: '/bare/',
    encodeUrl: Ultraviolet.codec.xor.encode,
    decodeUrl: Ultraviolet.codec.xor.decode,

    // ← Todo desde CDN oficial (siempre disponible y actualizado)
    handler: 'https://cdn.jsdelivr.net/gh/titaniumnetwork-dev/Ultraviolet@3.2.7/dist/uv.handler.js',
    bundle: 'https://cdn.jsdelivr.net/gh/titaniumnetwork-dev/Ultraviolet@3.2.7/dist/uv.bundle.js',
    client: 'https://cdn.jsdelivr.net/gh/titaniumnetwork-dev/Ultraviolet@3.2.7/dist/uv.client.js',
    sw: 'https://cdn.jsdelivr.net/gh/titaniumnetwork-dev/Ultraviolet@3.2.7/dist/uv.sw.js',

    scope: '/uv/'
};
