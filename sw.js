const CACHE = 'glassscan-v100-ai-foundation';
const ASSETS = ['./','./index.html','./styles.css','./app.js','./ai-tools.js','./manifest.webmanifest','./icon.svg'];
self.addEventListener('install', event => event.waitUntil((async()=>{
  const cache=await caches.open(CACHE);
  await cache.addAll(ASSETS);
  await self.skipWaiting();
})()));
self.addEventListener('activate', event => event.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(k=>k.startsWith('glassscan-')&&k!==CACHE).map(k=>caches.delete(k)));
  await self.clients.claim();
})()));
self.addEventListener('fetch', event=>{
  if(event.request.method!=='GET') return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin) return;
  event.respondWith((async()=>{
    const hit=await caches.match(event.request);
    if(hit) return hit;
    try {
      const response=await fetch(event.request);
      if(response.ok) caches.open(CACHE).then(c=>c.put(event.request,response.clone())).catch(()=>{});
      return response;
    } catch(e) {
      if(event.request.mode==='navigate') {
        const shell=await caches.match('./index.html');
        if(shell) return shell;
      }
      throw e;
    }
  })());
});
