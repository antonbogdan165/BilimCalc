(function () {
    'use strict';

    var API_URL = 'https://api.counterapi.dev/v1/bilimcalc-site/visits/up';
    var SESSION_KEY = 'bc_session_counted';

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
            var p   = Math.min((now - t0) / duration, 1);
            var ease = 1 - Math.pow(1 - p, 3);
            var cur  = Math.floor(startVal + (target - startVal) * ease);
            el.textContent = fmt(cur) + ' учеников';
            if (p < 1) requestAnimationFrame(tick);
            else el.textContent = fmt(target) + ' учеников';
        })(t0);
    }

    function init() {
        var badge   = document.getElementById('visitorBadge');
        var countEl = document.getElementById('visitorCount');
        if (!badge || !countEl) return;

        var alreadyCounted = sessionStorage.getItem(SESSION_KEY);
        var url = alreadyCounted
            ? API_URL.replace('/up', '')
            : API_URL;

        fetch(url)
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