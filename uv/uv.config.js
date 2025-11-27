// uv.config.js → Versión FUNCIONAL 100% (Noviembre 2025)
self.__uv$config = {
    prefix: '/service/',                    // ← Correcto y estándar actual
    bare: 'https://zephiryx-bare-production.up.railway.app/bare/',                         // ← Cambia si tu bare está en otro dominio
    encodeUrl: Ultraviolet.codec.xor.encode, // ← ESTE ES EL ÚNICO QUE FUNCIONA BIEN HOY
    decodeUrl: Ultraviolet.codec.xor.decode, // ← Obligatorio para Discord, YouTube, etc.
    handler: '/uv/uv.handler.js',
    bundle: '/uv/uv.bundle.js',
    config: '/uv/uv.config.js',
    sw: '/uv/uv.sw.js',
};
