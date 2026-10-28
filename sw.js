/* GlassScan V1.8.1 instant guide crop cache. Keep in repository root. */
const CACHE_NAME = 'glassscan-v181-instant-guide-crop-cache';
const OPENCV_URL = 'https://docs.opencv.org/4.13.0/opencv.js';
const APP_ASSETS = [
 './','./index.html','./styles.css','./app.js','./ai-tools.js','./local-ai.js',
 './site-updates.js','./ui-polish.js','./manifest.webmanifest',
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
  // Cache OpenCV's classic cross-origin script as an opaque response after a successful online install.
  // This allows later launches to use the browser cache while offline; first installation still needs internet.
  try {
   const existing = await cache.match(OPENCV_URL);
   if (!existing) {
    const vision = await fetch(OPENCV_URL, {mode:'no-cors', cache:'reload'});
    if (vision && (vision.type === 'opaque' || vision.ok)) {
     await cache.put(OPENCV_URL, vision);
    }
   }
  } catch (error) { console.warn('[GlassScan SW] OpenCV cache unavailable; fallback detector remains active.', error); }
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
 if (request.method !== 'GET') return;
 const url = new URL(request.url);
 const isOpenCV = url.href === OPENCV_URL;
 if (url.origin !== self.location.origin && !isOpenCV) return;
 event.respondWith((async () => {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request, {ignoreSearch:true}) || (isOpenCV ? await cache.match(OPENCV_URL) : null);
  if (cached) return cached;
  try {
   const response = await fetch(request);
   if (response && (response.ok || (isOpenCV && response.type === 'opaque'))) {
    cache.put(isOpenCV ? OPENCV_URL : request, response.clone()).catch(()=>{});
   }
   return response;
  } catch (_) { return cached || Response.error(); }
 })());
});
