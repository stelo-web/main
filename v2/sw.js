// sw.js

// バージョン番号。コンテンツを更新したらここを 'v2', 'v3' と書き換えてください。
const CACHE_NAME = 'site-cache-v1';

// キャッシュするリソース一覧
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    'https://unpkg.com/aos@2.3.1/dist/aos.css',
    'https://unpkg.com/aos@2.3.1/dist/aos.js',
    'https://stelo-web.github.io/main/font/Noto_Sans_JP.zip/NotoSansJP-VariableFont_wght.ttf'
];

// --- インストール時の処理 (プレキャッシュ) ---
self.addEventListener('install', (event) => {
    // 待機中のSWを強制的に有効化
    self.skipWaiting();
    
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[SW] Caching assets');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// --- 有効化時の処理 (古いキャッシュの削除) ---
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('[SW] Clearing old cache:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// --- フェッチ時の処理 (キャッシュ優先戦略) ---
self.addEventListener('fetch', (event) => {
    // GETリクエストのみ対象
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            // 1. キャッシュがあればそれを返す (ネットワーク通信なし)
            if (cachedResponse) {
                return cachedResponse;
            }

            // 2. なければネットワークへ取りに行く
            return fetch(event.request).then((networkResponse) => {
                // 有効なレスポンスでなければそのまま返す
                if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic' && networkResponse.type !== 'cors') {
                    return networkResponse;
                }

                // 3. 取得したリソースをキャッシュに保存して次回に備える
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache);
                });

                return networkResponse;
            });
        })
    );
});

