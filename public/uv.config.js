// public/uv.config.js → Versión funcional en Railway 2025
self.__uv$config = {
    prefix: '/uv/service/',        // ← ahora todo queda dentro de /uv/
    bare: '/bare/',
    encodeUrl: Ultraviolet.codec.xor.encode,
    decodeUrl: Ultraviolet.codec.xor.decode,
    handler: '/uv/uv.handler.js',
    bundle: '/uv/uv.bundle.js',
    config: '/uv/uv.config.js',
    sw: '/uv/uv.sw.js',
    scope: '/uv/'                  // ← permite que el SW controle toda la carpeta /uv/
};
