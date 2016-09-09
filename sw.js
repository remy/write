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
        'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.18.2/codemirror.min.css',
        '/main.js',
        '/style.css',
        '/autosize.js',
        '/mobile.js',
        'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.18.2/codemirror.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.18.2/addon/mode/overlay.js',
        'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.18.2/mode/xml/xml.js',
        'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.18.2/mode/markdown/markdown.js',
        'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.18.2/mode/gfm/gfm.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.18.2/mode/javascript/javascript.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.18.2/mode/css/css.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.18.2/mode/htmlmixed/htmlmixed.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.18.2/mode/clike/clike.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.18.2/mode/meta.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.18.2/addon/edit/closebrackets.min.js'
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
