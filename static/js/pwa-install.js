(function () {
    'use strict';

    /* ── Ключи ── */
    var DISMISS_KEY   = 'bc_pwa_dismissed';
    var INSTALLED_KEY = 'bc_pwa_installed';
    var SHOWN_KEY     = 'bc_pwa_shown_at';

    /* ── Уже установлено как PWA? ── */
    if (window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true) {
        localStorage.setItem(INSTALLED_KEY, '1');
        return;
    }

    /* ── Уже установлено? ── */
    if (localStorage.getItem(INSTALLED_KEY)) return;

    /* ── Был закрыт недавно? Повтор через 3 дня ── */
    var dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed && Date.now() - parseInt(dismissed, 10) < 3 * 24 * 60 * 60 * 1000) return;

    /* ── Показывали недавно? (не чаще раза в сессию) ── */
    var shownAt = localStorage.getItem(SHOWN_KEY);
    if (shownAt && Date.now() - parseInt(shownAt, 10) < 30 * 60 * 1000) return;

    var deferredPrompt = null;

    /* ── Android / Chrome: ловим beforeinstallprompt ── */
    window.addEventListener('beforeinstallprompt', function (e) {
        e.preventDefault();
        deferredPrompt = e;

        /* Показываем через 3 сек после загрузки — не сразу */
        setTimeout(function () {
            showBanner('android');
        }, 3000);
    });

    /* ── После установки ── */
    window.addEventListener('appinstalled', function () {
        localStorage.setItem(INSTALLED_KEY, '1');
        var b = document.getElementById('pwa-banner');
        if (b) dismissBanner(b);
        deferredPrompt = null;
    });

    /* ── iOS Safari: нет beforeinstallprompt, показываем инструкцию ── */
    function isIOS() {
        var ua = navigator.userAgent;
        var isIpad = /iPad/.test(ua) ||
            (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        var isIphone = /iPhone|iPod/.test(ua);
        var isSafari = /Safari/.test(ua) && !/Chrome|CriOS|FxiOS/.test(ua);
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

    /* ── Рендер баннера ── */
    function showBanner(platform) {
        if (document.getElementById('pwa-banner')) return;

        localStorage.setItem(SHOWN_KEY, String(Date.now()));

        var banner = document.createElement('div');
        banner.id = 'pwa-banner';
        banner.setAttribute('role', 'dialog');
        banner.setAttribute('aria-label', 'Установить приложение');

        if (platform === 'ios') {
            banner.innerHTML =
                '<div class="pwa-banner__icon">📲</div>' +
                '<div class="pwa-banner__body">' +
                    '<div class="pwa-banner__title">Добавить на главный экран</div>' +
                    '<div class="pwa-banner__sub">' +
                        'Нажмите <span class="pwa-banner__share">⎋</span> внизу, затем' +
                        ' <strong>«На экран Домой»</strong>' +
                    '</div>' +
                '</div>' +
                '<button class="pwa-banner__close" id="pwaBannerClose" aria-label="Закрыть">' +
                    '<svg width="10" height="10" viewBox="0 0 10 10" fill="none">' +
                        '<path d="M1 1l8 8M9 1L1 9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>' +
                    '</svg>' +
                '</button>';
        } else {
            banner.innerHTML =
                '<div class="pwa-banner__icon">📲</div>' +
                '<div class="pwa-banner__body">' +
                    '<div class="pwa-banner__title">Установить приложение</div>' +
                    '<div class="pwa-banner__sub">Быстрый доступ без браузера, работает офлайн</div>' +
                '</div>' +
                '<button class="pwa-banner__btn" id="pwaBannerInstall">Установить</button>' +
                '<button class="pwa-banner__close" id="pwaBannerClose" aria-label="Закрыть">' +
                    '<svg width="10" height="10" viewBox="0 0 10 10" fill="none">' +
                        '<path d="M1 1l8 8M9 1L1 9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>' +
                    '</svg>' +
                '</button>';
        }

        document.body.appendChild(banner);

        /* Анимация появления — двойной rAF гарантирует что DOM отрендерен */
        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                banner.classList.add('pwa-banner--visible');
            });
        });

        /* Кнопка закрыть */
        document.getElementById('pwaBannerClose').addEventListener('click', function () {
            dismissBanner(banner);
        });

        /* Кнопка установить (Android) */
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

        /* Автозакрытие через 15 сек */
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