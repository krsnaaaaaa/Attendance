const CACHE='officelog-v3';
const ASSETS=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const url=e.request.url;
  if(url.includes('supabase')||url.includes('/rest/')) return;
  if(e.request.method!=='GET') return;
  e.respondWith(
    caches.match(e.request).then(r=> r || fetch(e.request).then(resp=>{
      if(resp.status===200 && url.startsWith(self.location.origin)){
        const copy=resp.clone(); caches.open(CACHE).then(c=>c.put(e.request,copy));
      }
      return resp;
    }).catch(()=> caches.match('./index.html')))
  );
});
self.addEventListener('notificationclick',e=>{
  e.notification.close();
  e.waitUntil(clients.matchAll({type:'window'}).then(cl=>{
    for(const c of cl){ if('focus' in c) return c.focus(); }
    if(clients.openWindow) return clients.openWindow('./index.html');
  }));
});
