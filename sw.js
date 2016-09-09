/* eslint-env browser */
const cacheName = 'v1::static';

self.addEventListener('install', e => {
  // once the SW is installed, go ahead and fetch the resources
  // to make this work offline
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      return Promise.all([
        '/',
        '/index.html',
        'https://fonts.googleapis.com/css?family=Cousine',
        '/style.css',
        '/prism.js',
        '/autosize.min.js',
        '/main.js',
      ].map(url => {
        const res = new Request(url, { mode: 'no-cors' });
        return fetch(res).then(response => cache.put(url, response));
      }));

    }).then(() => self.skipWaiting())
  );
});

// when the browser fetches a url, either response with
// the cached object or go ahead and fetch the actual url
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(res => res || fetch(event.request))
  );
});
