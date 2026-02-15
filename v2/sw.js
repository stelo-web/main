// sw.js
const CACHE_NAME = 'font-cache-v1';
const FONT_URL = 'https://stelo-web.github.io/main/font/NotoSansJP-VariableFont_wght.ttf';

self.addEventListener('install', (event) => {
    // Service Workerインストール時にフォントをキャッシュ
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.add(FONT_URL);
        })
    );
});

self.addEventListener('fetch', (event) => {
    // フォントへのリクエストならキャッシュから返す
    if (event.request.url === FONT_URL) {
        event.respondWith(
            caches.match(event.request).then((response) => {
                return response || fetch(event.request).then((response) => {
                    return caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, response.clone());
                        return response;
                    });
                });
            })
        );
    } else {
        // それ以外は通常通り
        event.respondWith(fetch(event.request));
    }
});
