// Versioned, network-first PWA cache. Refresh the shell after every deployment.
const CACHE='workout-tracker-phase9-nav-v1';
const SHELL=['./','./index.html','./style.css?v=9nav','./app.js?v=9nav','./phase8.js?v=9nav','./phase9-core.js?v=9nav','./phase9.js?v=9nav','./phase9-nav.js?v=9nav'];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(names=>Promise.all(names.filter(n=>n.startsWith('workout-')&&n!==CACHE).map(n=>caches.delete(n)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;
  event.respondWith(fetch(event.request).then(response=>{
    if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy)).catch(()=>{});}
    return response;
  }).catch(async()=>{
    const cached=await caches.match(event.request);
    if(cached)return cached;
    if(event.request.mode==='navigate')return (await caches.match('./index.html'))||(await caches.match('./'));
    return new Response('Offline',{status:503,statusText:'Offline'});
  }));
});
