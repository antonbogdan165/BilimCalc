(function () {
    'use strict';

    var NAMESPACE   = 'bilimcalc-site';
    var KEY         = 'visits';
    var BASE_URL    = 'https://api.counterapi.dev/v1/' + NAMESPACE + '/' + KEY;
    var SESSION_KEY = 'bc_session_counted';
    var TIMEOUT_MS  = 5000;

    function fmt(n) {
        if (n >= 1000000) return (Math.floor(n / 100000) / 10).toFixed(1) + 'M+';
        if (n >= 1000) return (Math.floor(n / 100) * 100).toLocaleString('ru') + '+';
        return n + '+';
    }

    function animCount(el, target) {
        var startVal = Math.max(1, target - Math.min(50, Math.floor(target * 0.05)));
        var duration = 900;
        var t0 = performance.now();
        (function tick(now) {
            var p    = Math.min((now - t0) / duration, 1);
            var ease = 1 - Math.pow(1 - p, 3);
            var cur  = Math.floor(startVal + (target - startVal) * ease);
            el.textContent = fmt(cur) + ' учеников';
            if (p < 1) requestAnimationFrame(tick);
            else el.textContent = fmt(target) + ' учеников';
        })(t0);
    }

    function fetchWithTimeout(url, ms) {
        return new Promise(function (resolve, reject) {
            var timer = setTimeout(function () {
                reject(new Error('timeout'));
            }, ms);
            fetch(url).then(function (r) {
                clearTimeout(timer);
                resolve(r);
            }).catch(function (e) {
                clearTimeout(timer);
                reject(e);
            });
        });
    }

    function init() {
        var badge   = document.getElementById('visitorBadge');
        var countEl = document.getElementById('visitorCount');
        if (!badge || !countEl) return;

        var alreadyCounted = sessionStorage.getItem(SESSION_KEY);
        var url = alreadyCounted ? BASE_URL : BASE_URL + '/up';

        fetchWithTimeout(url, TIMEOUT_MS)
            .then(function (r) { return r.json(); })
            .then(function (data) {
                if (!alreadyCounted) {
                    sessionStorage.setItem(SESSION_KEY, '1');
                }
                var count = data.count || data.value || 0;
                if (count > 0) animCount(countEl, count);
                else countEl.textContent = '';
            })
            .catch(function () {
                countEl.textContent = '';
            });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { setTimeout(init, 1000); });
    } else {
        setTimeout(init, 1000);
    }
})();