// public/uv.config.js → 100 % funcional (copia y pega tal cual)
self.__uv$config = {
    prefix: '/uv/service/',
    bare: '/bare/',
    encodeUrl: Ultraviolet.codec.xor.encode,
    decodeUrl: Ultraviolet.codec.xor.decode,
    handler: '/uv/uv.handler.js',
    bundle: '/uv/uv.bundle.js',
    client: '/uv/uv.client.js',
    config: '/uv/uv.config.js',
    sw: '/uv/uv.sw.js',
    scope: '/uv/'
};
