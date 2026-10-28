const CACHE='glassscan-v070-gs070';
const ASSETS=['./','./index.html','./styles.css','./app.js','./manifest.webmanifest','./icon.svg'];
const OPENCV_URL='https://docs.opencv.org/4.13.0/opencv.js';
self.addEventListener('install',e=>e.waitUntil((async()=>{
  const c=await caches.open(CACHE);
  await c.addAll(ASSETS);
  // Cache OpenCV when online. Opaque CDN responses can be cached; if this fails,
  // installation still succeeds and the app reports fallback mode.
  try{
    const r=await fetch(OPENCV_URL,{mode:'no-cors',cache:'reload'});
    if(r && (r.type==='opaque'||r.ok)) await c.put(OPENCV_URL,r);
  }catch(err){console.warn('OpenCV cache skipped',err)}
  await self.skipWaiting();
})()));
self.addEventListener('activate',e=>e.waitUntil((async()=>{
  const ks=await caches.keys();
  await Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)));
  await self.clients.claim();
})()));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const url=e.request.url;
  if(url===OPENCV_URL){
    e.respondWith(caches.match(OPENCV_URL).then(r=>r||fetch(e.request).then(resp=>{
      caches.open(CACHE).then(c=>c.put(OPENCV_URL,resp.clone()).catch(()=>{}));
      return resp;
    })));
    return;
  }
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(resp=>{
    if(new URL(url).origin===self.location.origin){
      const copy=resp.clone();caches.open(CACHE).then(c=>c.put(e.request,copy).catch(()=>{}));
    }
    return resp;
  }).catch(()=>caches.match('./index.html'))));
});
