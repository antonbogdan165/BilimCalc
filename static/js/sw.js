const CACHE_NAME = "bilimcalc-__BUILD_TIME__";

const STATIC_ASSETS = [
    "/",
    "/kak-rasschitat-so",
    "/kak-rasschitat-sor",
    "/kak-rasschitat-soch",
    "/itogovaya-ocenka-za-chetvert",
    "/metodika-rascheta-mon-rk",
    "/kalkulator-ekzamena",
    "/kak-rasschitat-itogovuyu-otsenku-za-god",
    "/kak-perevesti-procenty-v-otsenku",
    "/articles",
    "/kalkulator-sor",
    "/kalkulator-soch",

    "/static/css/style.css",
    "/static/css/article.css",
    "/static/css/page-loader.css",
    "/static/css/pwa-banner.css",
    "/static/css/bilimexam.css",
    "/static/css/additions.css",

    "/static/js/main.js",
    "/static/js/theme.js",
    "/static/js/page-loader.js",
    "/static/js/pwa-install.js",
    "/static/js/bilimexam.js",
    "/static/js/visitor-counter.js",
    "/static/js/mobile-keyboard-ux.js",

    "/site.webmanifest",
    "/static/icons/favicon-32x32.png",
    "/static/icons/web-app-manifest-192x192.png",
    "/static/icons/web-app-manifest-512x512.png",
    "/static/icons/apple-touch-icon.png",
];

const CDN_ASSETS = [
    "https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.min.js",
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache =>
            Promise.allSettled([
                ...STATIC_ASSETS.map(url =>
                    cache.add(url).catch(err =>
                        console.warn("[SW] не удалось закэшировать:", url, err)
                    )
                ),
                ...CDN_ASSETS.map(url =>
                    fetch(url).then(r => { if (r.ok) cache.put(url, r); }).catch(() => {})
                ),
            ])
        ).then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(k => k !== CACHE_NAME).map(k => {
                    console.log("[SW] удаляем старый кэш:", k);
                    return caches.delete(k);
                })
            )
        ).then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", event => {
    const url = new URL(event.request.url);

    if (url.pathname === "/calculate") {
        event.respondWith(
            fetch(event.request.clone()).then(response => {
                if (response.ok) {
                    caches.open(CACHE_NAME).then(cache =>
                        cache.put("/calculate-last", response.clone())
                    );
                }
                return response;
            }).catch(async () => {
                const cached = await caches.match("/calculate-last");
                if (cached) return cached;
                return new Response(
                    JSON.stringify({
                        total_so: null, total_sor: null,
                        total_soch: null, final_result: null, offline: true
                    }),
                    { headers: { "Content-Type": "application/json" } }
                );
            })
        );
        return;
    }

    if (url.hostname === "cdn.jsdelivr.net") {
        event.respondWith(
            fetch(event.request).then(response => {
                if (response.ok) {
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, response.clone()));
                }
                return response;
            }).catch(() => caches.match(event.request))
        );
        return;
    }

    if (url.pathname.startsWith("/static/") || STATIC_ASSETS.includes(url.pathname)) {
        event.respondWith(
            caches.match(url.pathname).then(cached => {
                if (cached) return cached;
                return fetch(event.request).then(response => {
                    if (response.ok) {
                        caches.open(CACHE_NAME).then(cache =>
                            cache.put(url.pathname, response.clone())
                        );
                    }
                    return response;
                });
            })
        );
        return;
    }

    if (event.request.mode === "navigate") {
        event.respondWith(
            fetch(event.request).catch(() =>
                caches.match(url.pathname).then(c => c || caches.match("/"))
            )
        );
        return;
    }
});