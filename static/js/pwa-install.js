(function () {
    'use strict';

    const VISIT_KEY     = 'bc_visit_count';
    const DISMISS_KEY   = 'bc_pwa_dismissed';
    const INSTALLED_KEY = 'bc_pwa_installed';

    let visits = parseInt(localStorage.getItem(VISIT_KEY) || '0', 10) + 1;
    localStorage.setItem(VISIT_KEY, String(visits));

    if (window.matchMedia('(display-mode: standalone)').matches) {
        localStorage.setItem(INSTALLED_KEY, '1');
        return;
    }

    if (localStorage.getItem(INSTALLED_KEY)) return;
    if (visits < 2) return;

    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed && Date.now() - parseInt(dismissed, 10) < 7 * 24 * 60 * 60 * 1000) return;

    let deferredPrompt = null;

    window.addEventListener('beforeinstallprompt', function (e) {
        e.preventDefault();
        deferredPrompt = e;
        showBanner(false);
    });

    window.addEventListener('appinstalled', function () {
        localStorage.setItem(INSTALLED_KEY, '1');
        var b = document.getElementById('pwa-banner');
        if (b) dismissBanner(b);
        deferredPrompt = null;
    });

    function isIOS() {
        return /iphone|ipad|ipod/i.test(navigator.userAgent)
            && !window.MSStream
            && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
    }

    if (isIOS()) {
        setTimeout(function () {
            var d = localStorage.getItem(DISMISS_KEY);
            var alreadyDismissed = d && Date.now() - parseInt(d, 10) < 7 * 24 * 60 * 60 * 1000;
            if (!alreadyDismissed && !localStorage.getItem(INSTALLED_KEY)) {
                showBanner(true);
            }
        }, 1500);
    }

    function showBanner(isIos) {
        if (document.getElementById('pwa-banner')) return;

        var banner = document.createElement('div');
        banner.id = 'pwa-banner';
        banner.setAttribute('role', 'alert');
        banner.setAttribute('aria-live', 'polite');

        banner.innerHTML = isIos
            ? '<div class="pwa-banner__icon">📲</div>' +
              '<div class="pwa-banner__body">' +
              '<div class="pwa-banner__title">Добавить на главный экран</div>' +
              '<div class="pwa-banner__sub">Нажмите <span class="pwa-banner__share">⎋</span> → «На экран Домой»</div>' +
              '</div>' +
              '<button class="pwa-banner__close" id="pwaBannerClose" aria-label="Закрыть">✕</button>'
            : '<div class="pwa-banner__icon">📲</div>' +
              '<div class="pwa-banner__body">' +
              '<div class="pwa-banner__title">Добавить на главный экран</div>' +
              '<div class="pwa-banner__sub">Быстрый доступ без браузера</div>' +
              '</div>' +
              '<button class="pwa-banner__btn" id="pwaBannerInstall">Установить</button>' +
              '<button class="pwa-banner__close" id="pwaBannerClose" aria-label="Закрыть">✕</button>';

        document.body.appendChild(banner);

        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                banner.classList.add('pwa-banner--visible');
            });
        });

        document.getElementById('pwaBannerClose').addEventListener('click', function () {
            dismissBanner(banner);
        });

        var installBtn = document.getElementById('pwaBannerInstall');
        if (installBtn) {
            installBtn.addEventListener('click', function () {
                if (!deferredPrompt) return;
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then(function (choice) {
                    if (choice.outcome === 'accepted') {
                        localStorage.setItem(INSTALLED_KEY, '1');
                    }
                    dismissBanner(banner);
                    deferredPrompt = null;
                });
            });
        }

        setTimeout(function () {
            if (document.getElementById('pwa-banner')) {
                dismissBanner(banner);
            }
        }, 12000);
    }

    function dismissBanner(banner) {
        banner.classList.remove('pwa-banner--visible');
        localStorage.setItem(DISMISS_KEY, String(Date.now()));
        setTimeout(function () {
            if (banner.parentNode) banner.parentNode.removeChild(banner);
        }, 350);
    }

})();