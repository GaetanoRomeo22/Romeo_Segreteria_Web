let cacheName = 'Segreteria';
let filesToCache =
    [
        './index.html',
        './account.html',
        './appelli_disponibili.html',
        './appelli_prenotati.html',
        './libretto.html',
        './recupero_password.html',
        'main.js',
        './css/style.css',
        './images'
    ];

//starts the service worker and cache all the app's content
self.addEventListener('install', function(e) {
    e.waitUntil(caches.open(cacheName).then(function(cache) {
        return cache.addAll(filesToCache);
    }));
});

//serves cached content when offline
self.addEventListener('fetch', function(e) {
    e.respondWith(caches.match(e.request).then(function(response) {
        return response || fetch(e.request);
    }));
});
