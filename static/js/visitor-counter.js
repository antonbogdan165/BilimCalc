(function () {
    'use strict';

    const SESSION_KEY = 'bc_session_counted';
    const TIMEOUT_MS = 5000;
    const TEXT_STRINGS = window.APP_STRINGS || {};

    const formatCount = (value) => {
        if (value >= 1000000) return `${(Math.floor(value / 100000) / 10).toFixed(1)}M+`;
        if (value >= 1000) return `${Math.floor(value / 100) * 100}`.toLocaleString('ru') + '+';
        return `${value}+`;
    };

    const animateCount = (element, target) => {
        const start = Math.max(1, target - Math.min(50, Math.floor(target * 0.05)));
        const duration = 900;
        const suffix = TEXT_STRINGS.students ? ` ${TEXT_STRINGS.students}` : ' учеников';
        const startTime = performance.now();

        const tick = (now) => {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(start + (target - start) * eased);
            element.textContent = formatCount(current) + suffix;
            if (progress < 1) {
                requestAnimationFrame(tick);
            } else {
                element.textContent = formatCount(target) + suffix;
            }
        };

        requestAnimationFrame(tick);
    };

    const fetchWithTimeout = (url, options = {}, timeout = TIMEOUT_MS) =>
        new Promise((resolve, reject) => {
            const timer = setTimeout(() => reject(new Error('timeout')), timeout);
            fetch(url, options)
                .then((response) => {
                    clearTimeout(timer);
                    resolve(response);
                })
                .catch((error) => {
                    clearTimeout(timer);
                    reject(error);
                });
        });

    const init = () => {
        const badge = document.getElementById('visitorBadge');
        const countEl = document.getElementById('visitorCount');
        if (!badge || !countEl) return;

        const alreadyCounted = sessionStorage.getItem(SESSION_KEY);
        const url = alreadyCounted ? '/api/visits' : '/api/visits/increment';
        const options = alreadyCounted ? {} : { method: 'POST' };

        fetchWithTimeout(url, options)
            .then((response) => response.json())
            .then((data) => {
                const count = data?.count || 0;
                if (count > 0) animateCount(countEl, count);
                if (!alreadyCounted) {
                    sessionStorage.setItem(SESSION_KEY, '1');
                }
            })
            .catch(() => {
                countEl.textContent = '';
            });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(init, 1000));
    } else {
        setTimeout(init, 1000);
    }
})();
