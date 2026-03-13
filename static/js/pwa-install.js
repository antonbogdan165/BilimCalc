(function () {
    'use strict';

    var DISMISS_KEY   = 'bc_pwa_dismissed';
    var INSTALLED_KEY = 'bc_pwa_installed';
    var SHOWN_KEY     = 'bc_pwa_shown_at';

    // уже запущено как PWA
    if (window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true) {
        localStorage.setItem(INSTALLED_KEY, '1');
        return;
    }

    if (localStorage.getItem(INSTALLED_KEY)) return;

    // закрыли баннер менее 3 дней назад — не показываем
    var dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed && Date.now() - parseInt(dismissed, 10) < 3 * 24 * 60 * 60 * 1000) return;

    // в этой сессии уже показывали (не чаще раза в 30 минут)
    var shownAt = localStorage.getItem(SHOWN_KEY);
    if (shownAt && Date.now() - parseInt(shownAt, 10) < 30 * 60 * 1000) return;

    var deferredPrompt = null;

    window.addEventListener('beforeinstallprompt', function (e) {
        e.preventDefault();
        deferredPrompt = e;
        setTimeout(function () { showBanner('android'); }, 3000);
    });

    window.addEventListener('appinstalled', function () {
        localStorage.setItem(INSTALLED_KEY, '1');
        var b = document.getElementById('pwa-banner');
        if (b) dismissBanner(b);
        deferredPrompt = null;
    });

    function isIOS() {
        var ua = navigator.userAgent;
        var isIpad   = /iPad/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        var isIphone = /iPhone|iPod/.test(ua);
        var isSafari = /Safari/.test(ua) && !/Chrome|CriOS|FxiOS|EdgiOS/.test(ua);
        return (isIpad || isIphone) && isSafari;
    }

    if (isIOS()) {
        setTimeout(function () {
            var d = localStorage.getItem(DISMISS_KEY);
            var recentDismiss = d && Date.now() - parseInt(d, 10) < 3 * 24 * 60 * 60 * 1000;
            if (!recentDismiss && !localStorage.getItem(INSTALLED_KEY)) {
                showBanner('ios');
            }
        }, 3000);
    }

    var IOS_SHARE_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>';

    function showBanner(platform) {
        if (document.getElementById('pwa-banner')) return;

        localStorage.setItem(SHOWN_KEY, String(Date.now()));

        var banner = document.createElement('div');
        banner.id = 'pwa-banner';
        banner.setAttribute('role', 'dialog');
        banner.setAttribute('aria-label', 'Установить приложение');

        var closeIcon = '<svg width="10" height="10" viewBox="0 0 10 10" fill="none">' +
            '<path d="M1 1l8 8M9 1L1 9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';

        if (platform === 'ios') {
            banner.innerHTML =
                '<div class="pwa-banner__icon">📲</div>' +
                '<div class="pwa-banner__body">' +
                    '<div class="pwa-banner__title">Добавить на главный экран</div>' +
                    '<div class="pwa-banner__sub">Нажми ' +
                        '<span class="pwa-banner__share-icon">' + IOS_SHARE_SVG + '</span>' +
                        ' в Safari, затем <strong>«На экран «Домой»»</strong></div>' +
                '</div>' +
                '<button class="pwa-banner__close" id="pwaBannerClose" aria-label="Закрыть">' + closeIcon + '</button>';
        } else {
            banner.innerHTML =
                '<div class="pwa-banner__icon">📲</div>' +
                '<div class="pwa-banner__body">' +
                    '<div class="pwa-banner__title">Установить приложение</div>' +
                    '<div class="pwa-banner__sub">Быстрый доступ без браузера, работает офлайн</div>' +
                '</div>' +
                '<button class="pwa-banner__btn" id="pwaBannerInstall">Установить</button>' +
                '<button class="pwa-banner__close" id="pwaBannerClose" aria-label="Закрыть">' + closeIcon + '</button>';
        }

        document.body.appendChild(banner);

        var styleId = 'pwa-share-icon-style';
        if (!document.getElementById(styleId)) {
            var s = document.createElement('style');
            s.id = styleId;
            s.textContent = '.pwa-banner__share-icon{display:inline-flex;vertical-align:middle;margin:0 2px;color:#007aff;}';
            document.head.appendChild(s);
        }

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
                installBtn.textContent = 'Подождите…';
                installBtn.disabled = true;

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
            var b = document.getElementById('pwa-banner');
            if (b) dismissBanner(b);
        }, 15000);
    }

    function dismissBanner(banner) {
        banner.classList.remove('pwa-banner--visible');
        localStorage.setItem(DISMISS_KEY, String(Date.now()));
        setTimeout(function () {
            if (banner.parentNode) banner.parentNode.removeChild(banner);
        }, 400);
    }
})();