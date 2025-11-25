// public/uv.config.js → Versión mínima y estable para Railway 2025
// No usa referencias a Ultraviolet hasta que el bundle se cargue
self.__uv$config = {
    prefix: '/uv/service/',
    bare: '/bare/',
    encodeUrl: 'Ultraviolet.codec.xor.encode',  // ← Como string, no función directa
    decodeUrl: 'Ultraviolet.codec.xor.decode',  // ← Como string, evita crash
    handler: '/uv/uv.handler.js',
    bundle: '/uv/uv.bundle.js',
    config: '/uv/uv.config.js',
    sw: '/uv/uv.sw.js',
    scope: '/uv/'
};
