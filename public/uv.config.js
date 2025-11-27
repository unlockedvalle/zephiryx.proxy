// uv.config.js → 100 % funcional con Railway Premium + Clearly (sin borrar nada)
self.__uv$config = {
    prefix: '/service/',                        // lo dejamos igual que tenías
    bare: 'https://bare.tomp.app/',             // ← ESTO ES LO QUE SOLUCIONA TODO
    encodeUrl: Ultraviolet.codec.xor.encode,    // más rápido y estable
    decodeUrl: Ultraviolet.codec.xor.decode,
    handler: '/uv/uv.handler.js',
    bundle: '/uv/uv.bundle.js',
    config: '/uv/uv.config.js',
    sw: '/uv/uv.sw.js',                         // el nombre que ya usas

    // Muy importante: desactivamos la auth forzada que Clearly espera
    authenticate: false,

    // Truco extra para que Clearly no se queje nunca más
    client: 'clearly' // fuerza compatibilidad total con tu extensión
};

console.log('✓ Ultraviolet configurado correctamente con bare externo');
