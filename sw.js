const CACHE_NAME = 'chess-v2';
const ASSETS = [
  //Core Files
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/chess.js',
  '/manifest.json',
  
  //Icons (SVG)
  '/icons/icon.svg',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg',
  '/icons/icon-apple.svg',
  
  //Piece Images (SVG)
  '/pieces/wp.svg',		//(white pawn)
  '/pieces/wn.svg',		//(white knight)
  '/pieces/wb.svg',		//(white bishop)
  '/pieces/wr.svg',		//(white rook)
  '/pieces/wq.svg',		//(white queen)
  '/pieces/wk.svg',		//(white king)
  '/pieces/bp.svg',		//(black pawn)
  '/pieces/bn.svg',		//(black knight)
  '/pieces/bb.svg',		//(black bishop)
  '/pieces/br.svg',		//(black rook)
  '/pieces/bq.svg',		//(black queen)
  '/pieces/bk.svg'		//(black king)
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(ASSETS)
          .catch(err => console.log('Failed to cache:', err));
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request)
      .then(response => response || fetch(e.request))
      .catch(() => {
        // Fallback for failed requests (especially important for icons)
        if (e.request.url.includes('.svg')) {
          return caches.match('/icons/icon.svg');
        }
        return new Response('Offline - Chess Game');
      })
  );
});