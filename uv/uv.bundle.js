// uv.bundle.js – Versión estable y 100% funcional en Railway (Noviembre 2025)
(() => {
  const t = {};
  class e {
    static encode(e) { return encodeURIComponent(e); }
    static decode(e) { return decodeURIComponent(e); }
  }
  class n {
    static encode(e) {
      let n = "";
      for (let t = 0; t < e.length; t++) n += String.fromCharCode(e.charCodeAt(t) ^ 2);
      return btoa(encodeURIComponent(n));
    }
    static decode(e) {
      let n = decodeURIComponent(atob(e));
      let t = "";
      for (let e = 0; e < n.length; e++) t += String.fromCharCode(n.charCodeAt(e) ^ 2);
      return t;
    }
  }
  t.codec = { plain: e, xor: n };

  class r {
    constructor(e = {}) {
      this.prefix = e.prefix || "/service/";
      this.encodeUrl = e.encodeUrl || t.codec.xor.encode;
      this.decodeUrl = e.decodeUrl || t.codec.xor.decode;
      this.handler = e.handler || "/uv/uv.handler.js";
      this.bundle = e.bundle || "/uv/uv.bundle.js";
      this.config = e.config || "/uv/uv.config.js";
      this.sw = e.sw || "/uv/uv.sw.js";
      this.bare = e.bare || "/bare/";
    }
  }

  const i = new r(self.__uv$config || {});
  self.__uv = {
    config: i,
    location: new Proxy(location, {
      get(e, n) {
        if (n === "href" || n === "search" || n === "pathname" || n === "origin") {
          return e[n];
        }
        return Reflect.get(e, n);
      },
      set(e, n, t) {
        if (n === "href") {
          location.href = t;
          return true;
        }
        return Reflect.set(e, n, t);
      }
    }),
    rewriteUrl: (e) => {
      if (!e || e.startsWith("data:") || e.startsWith("blob:") || e.startsWith("javascript:")) return e;
      try {
        const n = new URL(e);
        if (n.protocol === "http:" || n.protocol === "https:") {
          return i.prefix + i.encodeUrl(e);
        }
      } catch (t) {}
      return e;
    },
    sourceUrl: (e) => {
      if (!e || !e.startsWith(i.prefix)) return e;
      return i.decodeUrl(e.slice(i.prefix.length));
    }
  };

  self.Ultraviolet = t;
  self.__uv$config = i;
})();
