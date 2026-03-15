(function () {
    'use strict';

    var VISIT_KEY  = 'bc_visit_count';
    var SESSION_KEY = 'bc_session_counted';

    // Засчитываем визит один раз за сессию браузера
    function countVisit() {
        try {
            if (sessionStorage.getItem(SESSION_KEY)) return;
            sessionStorage.setItem(SESSION_KEY, '1');

            var raw   = localStorage.getItem(VISIT_KEY);
            var count = raw ? parseInt(raw, 10) : 0;
            count += 1;
            localStorage.setItem(VISIT_KEY, String(count));
        } catch (e) {
            // localStorage может быть недоступен в приватном режиме
        }
    }

    function getCount() {
        try {
            var raw = localStorage.getItem(VISIT_KEY);
            return raw ? parseInt(raw, 10) : 1;
        } catch (e) {
            return 1;
        }
    }

    function fmt(n) {
        if (n >= 1000) return (Math.floor(n / 100) * 100) + '+';
        return n + '+';
    }

    function animCount(el, target) {
        var startVal = Math.max(1, target - Math.min(30, Math.floor(target * 0.15)));
        var duration = 800;
        var t0       = performance.now();

        (function tick(now) {
            var p    = Math.min((now - t0) / duration, 1);
            var ease = 1 - Math.pow(1 - p, 3);
            var cur  = Math.floor(startVal + (target - startVal) * ease);
            el.textContent = fmt(cur) + ' учеников';
            if (p < 1) requestAnimationFrame(tick);
            else        el.textContent = fmt(target) + ' учеников';
        })(t0);
    }

    function init() {
        var badge   = document.getElementById('visitorBadge');
        var countEl = document.getElementById('visitorCount');
        if (!badge || !countEl) return;

        countVisit();

        var total = getCount();
        animCount(countEl, total);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { setTimeout(init, 800); });
    } else {
        setTimeout(init, 800);
    }
})();