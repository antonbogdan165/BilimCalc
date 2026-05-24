(function () {
    'use strict';

    function loadYandex() {
        (function (m, e, t, r, i, k, a) {
            m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments); };
            m[i].l = 1 * new Date();
            for (var j = 0; j < document.scripts.length; j++) {
                if (document.scripts[j].src === r) { return; }
            }
            k = e.createElement(t);
            a = e.getElementsByTagName(t)[0];
            k.async = 1;
            k.src = r;
            a.parentNode.insertBefore(k, a);
        })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js?id=107236685', 'ym');
        ym(107236685, 'init', {
            webvisor: true,
            clickmap: true,
            ecommerce: 'dataLayer',
            referrer: document.referrer,
            url: location.href,
            accurateTrackBounce: true,
            trackLinks: true,
        });
    }

    function loadGtag() {
        window.dataLayer = window.dataLayer || [];
        function gtag() { window.dataLayer.push(arguments); }
        window.gtag = gtag;
        gtag('js', new Date());
        gtag('config', 'G-7S9C0KT928');
        var s = document.createElement('script');
        s.async = true;
        s.src = 'https://www.googletagmanager.com/gtag/js?id=G-7S9C0KT928';
        document.head.appendChild(s);
    }

    function run() {
        loadYandex();
        loadGtag();
    }

    if ('requestIdleCallback' in window) {
        requestIdleCallback(run, { timeout: 2500 });
    } else {
        window.addEventListener('load', run, { once: true });
    }
})();
