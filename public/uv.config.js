// Configuración de Ultraviolet
self.__uv$config = {
    prefix: '/service/',
    bare: '/bare/',
    encodeUrl: (str) => encodeURIComponent(str),
    decodeUrl: (str) => decodeURIComponent(str),
    handler: '/uv/uv.handler.js',
    bundle: '/uv/uv.bundle.js',
    config: '/uv/uv.config.js',
    sw: '/uv/uv.sw.js',
};
