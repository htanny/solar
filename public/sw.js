/* Service Worker for 太陽系シミュレーター
   戦略:
     - assets/* (Vite が hash 付きで出力する不変ファイル): cache-first
     - HTML / ルート: network-first (新しいデプロイ時にスタール HTML を防ぐ)
     - その他 (manifest, favicon, sw.js): stale-while-revalidate
*/

const VERSION = 'v3';
const STATIC_CACHE = 'solar-static-' + VERSION;
const RUNTIME_CACHE = 'solar-runtime-' + VERSION;
const BASE = '/solar/';
const PRECACHE = [BASE, BASE + 'index.html', BASE + 'manifest.json', BASE + 'favicon.svg'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(STATIC_CACHE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== STATIC_CACHE && k !== RUNTIME_CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

function isAsset(url) {
  return url.pathname.includes('/assets/');
}

function isHtml(req, url) {
  return req.mode === 'navigate' || req.destination === 'document' || url.pathname === BASE || url.pathname.endsWith('.html');
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (isAsset(url)) {
    /* cache-first: hash 付きファイルは内容不変 */
    e.respondWith(
      caches.match(req).then(hit => hit || fetch(req).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(RUNTIME_CACHE).then(c => c.put(req, clone));
        }
        return res;
      }))
    );
    return;
  }

  if (isHtml(req, url)) {
    /* network-first: 新しいデプロイ時に最新 HTML を取得 */
    e.respondWith(
      fetch(req).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(STATIC_CACHE).then(c => c.put(req, clone));
        }
        return res;
      }).catch(() => caches.match(req).then(hit => hit || caches.match(BASE)))
    );
    return;
  }

  /* stale-while-revalidate: その他静的ファイル */
  e.respondWith(
    caches.match(req).then(hit => {
      const network = fetch(req).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(RUNTIME_CACHE).then(c => c.put(req, clone));
        }
        return res;
      }).catch(() => hit);
      return hit || network;
    })
  );
});
