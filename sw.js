/* GlassScan V1.6 offline cache. Keep in repository root. */
const CACHE_NAME = 'glassscan-v161-chatgpt-share';
const APP_ASSETS = [
 './','./index.html','./styles.css','./app.js','./ai-tools.js','./local-ai.js',
 './site-updates.js','./manifest.webmanifest',
 './vendor/tesseract/tesseract.min.js','./vendor/tesseract/worker.min.js',
 './vendor/tesseract-core/tesseract-core.wasm.js','./vendor/tesseract-core/tesseract-core.wasm',
 './vendor/tesseract-core/tesseract-core-simd.wasm.js','./vendor/tesseract-core/tesseract-core-simd.wasm',
 './vendor/tesseract-core/tesseract-core-lstm.wasm.js','./vendor/tesseract-core/tesseract-core-lstm.wasm',
 './vendor/tesseract-core/tesseract-core-simd-lstm.wasm.js','./vendor/tesseract-core/tesseract-core-simd-lstm.wasm',
 './models/tessdata/ind.traineddata.gz'
];
self.addEventListener('install', event => {
 event.waitUntil((async () => {
  const cache = await caches.open(CACHE_NAME);
  await Promise.all(APP_ASSETS.map(async url => {
   try {
    const response = await fetch(url, {cache:'reload'});
    if (response.ok) await cache.put(url, response);
    else console.warn('[GlassScan SW] Not cached:', url, response.status);
   } catch (error) { console.warn('[GlassScan SW] Fetch failed:', url, error); }
  }));
  await self.skipWaiting();
 })());
});
self.addEventListener('activate', event => {
 event.waitUntil((async () => {
  const keys = await caches.keys();
  await Promise.all(keys.filter(k => k.startsWith('glassscan-') && k !== CACHE_NAME).map(k => caches.delete(k)));
  await self.clients.claim();
 })());
});
self.addEventListener('fetch', event => {
 const request = event.request;
 if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
 event.respondWith((async () => {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request, {ignoreSearch:true});
  if (cached) return cached;
  try {
   const response = await fetch(request);
   if (response && response.ok) cache.put(request, response.clone()).catch(()=>{});
   return response;
  } catch (_) { return cached || Response.error(); }
 })());
});
