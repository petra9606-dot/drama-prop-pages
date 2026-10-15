// DisolveWorks 오프라인 지원 — 한 번 열어 본 페이지는 인터넷이 끊겨도 다시 열린다.
// 온라인이면 항상 최신 내용을 먼저 가져오고(network-first), 느리거나 끊기면 저장본을 보여 준다.
const CACHE = "dw-offline-v1";
const NET_TIMEOUT = 4000;
const CDN_HOSTS = [
  "cdnjs.cloudflare.com", "cdn.jsdelivr.net", "unpkg.com", "code.jquery.com", "cdn.tailwindcss.com",
  "fonts.googleapis.com", "fonts.gstatic.com", "cdn.jsdelivr.net", "esm.sh", "ga.jspm.io"
];

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k.startsWith("dw-offline-") && k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

function sameOriginCacheable(url) {
  const p = url.pathname;
  if (p.startsWith("/admin")) return false;
  if (p === "/sw.js") return false;
  if (p.startsWith("/.netlify/functions/")) {
    return p === "/.netlify/functions/file" || p === "/.netlify/functions/catalog" || p === "/.netlify/functions/thumb";
  }
  return true;
}

async function networkFirst(req) {
  const cache = await caches.open(CACHE);
  const net = fetch(req).then((res) => {
    if (res && (res.ok || res.type === "opaque")) cache.put(req, res.clone()).catch(() => {});
    return res;
  });
  const cachedP = cache.match(req).then((r) => r || (req.mode === "navigate" ? cache.match(req, { ignoreSearch: true }) : undefined));

  // 네트워크가 느리면 저장본으로 먼저 응답 (저장본이 있을 때만)
  const timeout = new Promise((resolve) => setTimeout(resolve, NET_TIMEOUT, "timeout"));
  try {
    const first = await Promise.race([net, timeout]);
    if (first !== "timeout") return first;
    const cached = await cachedP;
    return cached || (await net);
  } catch (err) {
    const cached = await cachedP;
    if (cached) return cached;
    throw err;
  }
}

async function cacheFirst(req) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(req);
  const net = fetch(req).then((res) => {
    if (res && (res.ok || res.type === "opaque")) cache.put(req, res.clone()).catch(() => {});
    return res;
  });
  if (hit) { net.catch(() => {}); return hit; }
  return net;
}

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || req.headers.has("range")) return;
  let url;
  try { url = new URL(req.url); } catch { return; }
  if (url.origin === self.location.origin) {
    if (sameOriginCacheable(url)) e.respondWith(networkFirst(req));
    return;
  }
  if (CDN_HOSTS.includes(url.hostname)) e.respondWith(cacheFirst(req));
});
