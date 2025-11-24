self.__uv$config = {
  prefix: '/service/',
  bare: '/bare/',
  encodeUrl: (url) => {
    return encodeURIComponent(
      url.toString()
        .split('')
        .map((char, ind) => ind % 2 ? String.fromCharCode(char.charCodeAt() ^ 2) : char)
        .join('')
    );
  },
  decodeUrl: (url) => {
    return decodeURIComponent(url)
      .split('')
      .map((char, ind) => ind % 2 ? String.fromCharCode(char.charCodeAt() ^ 2) : char)
      .join('');
  },
  handler: '/uv/uv.handler.js',
  bundle: '/uv/uv.bundle.js',
  config: '/uv/uv.config.js',
  sw: '/uv/uv.sw.js',
};
