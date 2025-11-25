self.__uv$config = {
  prefix: '/uv/service/',
  bare: '/bare/',
  encodeUrl: Ultraviolet.codec.xor.encode,
  decodeUrl: Ultraviolet.codec.xor.decode,
  handler: 'https://uv.zephyrx.best/uv.handler.js',
  bundle: 'https://uv.zephyrx.best/uv.bundle.js',
  client: 'https://uv.zephyrx.best/uv.client.js',
  sw: 'https://uv.zephyrx.best/uv.sw.js'
};
