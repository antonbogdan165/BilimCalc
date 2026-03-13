(function () {
    'use strict';

    var LAUNCH_DATE   = new Date('2026-03-13').getTime();  
    var DAILY_VISITS  = 100;                                
    var BASE_VISITS   = 150;                               
    var SESSION_KEY   = 'bc_session_counted';

    function calcTotal() {
        var now      = Date.now();
        var days     = Math.floor((now - LAUNCH_DATE) / (1000 * 60 * 60 * 24));
        var total    = BASE_VISITS + days * DAILY_VISITS;

        var hourOfDay   = new Date().getHours();
        var intraHour   = Math.floor((now % (60 * 60 * 1000)) / 1000); 
        var realtimePct = intraHour / 3600;

        var hourWeight  = [0.3, 0.2, 0.2, 0.2, 0.2, 0.3, 0.5, 0.7, 0.8, 0.9, 1.0, 1.1,
                           1.2, 1.3, 1.4, 1.6, 1.8, 2.0, 1.9, 1.7, 1.5, 1.2, 0.8, 0.5][hourOfDay] || 1;
        var thisHour    = Math.floor(5 * hourWeight * realtimePct);
        return total + thisHour;
    }

    function fmt(n) {
        if (n >= 10000) return Math.floor(n / 1000) + ' ' + Math.floor((n % 1000) / 100) * 100 + '+';
        if (n >= 1000)  return Math.floor(n / 100) * 100 + '+';
        return n + '+';
    }

    function animCount(el, target) {
        var start     = 0;
        var duration  = 900;
        var t0        = performance.now();
        var startVal  = target - Math.floor(Math.random() * 80 + 40);

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
        var badge    = document.getElementById('visitorBadge');
        var countEl  = document.getElementById('visitorCount');
        if (!badge || !countEl) return;

        var total = calcTotal();
        animCount(countEl, total);


        function tick() {
            total++;
            countEl.textContent = fmt(total) + ' учеников';
            setTimeout(tick, 45000 + Math.random() * 45000);
        }
        setTimeout(tick, 60000 + Math.random() * 30000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { setTimeout(init, 800); });
    } else {
        setTimeout(init, 800);
    }
})();
