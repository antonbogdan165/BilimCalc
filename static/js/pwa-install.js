(function () {
    'use strict';

    const DISMISS_KEY = 'bc_pwa_dismissed';
    const INSTALLED_KEY = 'bc_pwa_installed';
    const SHOWN_KEY = 'bc_pwa_shown_at';
    const I18N = window.APP_STRINGS || {};
    const INSTALL_LABEL = I18N.install_app || 'Установить приложение';
    const HOME_LABEL = I18N.install_on_home || 'Добавить на главный экран';
    const INSTALL_SUB_LABEL = I18N.install_sub || 'Быстрый доступ без браузера, работает офлайн';
    const WAIT_LABEL = I18N.install_wait || 'Подождите…';
    const CLOSE_LABEL = I18N.close || 'Закрыть';

    const isStandalone = () =>
        window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

    const getLocal = (key) => {
        try {
            return localStorage.getItem(key);
        } catch {
            return null;
        }
    };

    const setLocal = (key, value) => {
        try {
            localStorage.setItem(key, value);
        } catch {
        }
    };

    if (isStandalone()) {
        setLocal(INSTALLED_KEY, '1');
        return;
    }

    if (getLocal(INSTALLED_KEY)) return;

    const dismissedAt = Number(getLocal(DISMISS_KEY));
    if (dismissedAt && Date.now() - dismissedAt < 3 * 24 * 60 * 60 * 1000) return;

    const shownAt = Number(getLocal(SHOWN_KEY));
    if (shownAt && Date.now() - shownAt < 30 * 60 * 1000) return;

    let deferredPrompt = null;

    window.addEventListener('beforeinstallprompt', (event) => {
        event.preventDefault();
        deferredPrompt = event;
        setTimeout(() => showBanner('android'), 3000);
    });

    window.addEventListener('appinstalled', () => {
        setLocal(INSTALLED_KEY, '1');
        const banner = document.getElementById('pwa-banner');
        if (banner) dismissBanner(banner);
        deferredPrompt = null;
    });

    const isIOS = () => {
        const ua = navigator.userAgent;
        const isIpad = /iPad/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        const isIphone = /iPhone|iPod/.test(ua);
        const isSafari = /Safari/.test(ua) && !/Chrome|CriOS|FxiOS|EdgiOS/.test(ua);
        return (isIpad || isIphone) && isSafari;
    };

    if (isIOS()) {
        setTimeout(() => {
            const recentDismiss = Number(getLocal(DISMISS_KEY));
            if (!recentDismiss && !getLocal(INSTALLED_KEY)) {
                showBanner('ios');
            }
        }, 3000);
    }

    const translate = (key, fallback) =>
        typeof window.__ === 'function' ? window.__(key) : I18N[key] || fallback;

    const IOS_SHARE_SVG =
        '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>';

    const dismissBanner = (banner) => {
        banner.classList.remove('pwa-banner--visible');
        setLocal(DISMISS_KEY, String(Date.now()));
        setTimeout(() => {
            if (banner.parentNode) banner.parentNode.removeChild(banner);
        }, 400);
    };

    const showBanner = (platform) => {
        if (document.getElementById('pwa-banner')) return;
        setLocal(SHOWN_KEY, String(Date.now()));

        const banner = document.createElement('div');
        banner.id = 'pwa-banner';
        banner.setAttribute('role', 'dialog');
        banner.setAttribute('aria-label', INSTALL_LABEL);

        const closeIcon =
            '<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 1l8 8M9 1L1 9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';

        if (platform === 'ios') {
            banner.innerHTML = `
                <div class="pwa-banner__icon">📲</div>
                <div class="pwa-banner__body">
                    <div class="pwa-banner__title">${translate('install_on_home', HOME_LABEL)}</div>
                    <div class="pwa-banner__sub">Нажми <span class="pwa-banner__share-icon">${IOS_SHARE_SVG}</span> в Safari, затем <strong>«На экран «Домой»»</strong></div>
                </div>
                <button class="pwa-banner__close" id="pwaBannerClose" aria-label="${CLOSE_LABEL}">${closeIcon}</button>
            `;
        } else {
            banner.innerHTML = `
                <div class="pwa-banner__icon">📲</div>
                <div class="pwa-banner__body">
                    <div class="pwa-banner__title">${INSTALL_LABEL}</div>
                    <div class="pwa-banner__sub">${INSTALL_SUB_LABEL}</div>
                </div>
                <button class="pwa-banner__btn" id="pwaBannerInstall">${INSTALL_LABEL}</button>
                <button class="pwa-banner__close" id="pwaBannerClose" aria-label="${CLOSE_LABEL}">${closeIcon}</button>
            `;
        }

        document.body.appendChild(banner);

        if (!document.getElementById('pwa-share-icon-style')) {
            const style = document.createElement('style');
            style.id = 'pwa-share-icon-style';
            style.textContent = '.pwa-banner__share-icon{display:inline-flex;vertical-align:middle;margin:0 2px;color:#007aff;}';
            document.head.appendChild(style);
        }

        requestAnimationFrame(() => requestAnimationFrame(() => banner.classList.add('pwa-banner--visible')));

        document.getElementById('pwaBannerClose')?.addEventListener('click', () => dismissBanner(banner));

        const installBtn = document.getElementById('pwaBannerInstall');
        if (installBtn) {
            installBtn.addEventListener('click', () => {
                if (!deferredPrompt) return;
                installBtn.textContent = WAIT_LABEL;
                installBtn.disabled = true;

                deferredPrompt.prompt();
                deferredPrompt.userChoice.then((choice) => {
                    if (choice.outcome === 'accepted') {
                        setLocal(INSTALLED_KEY, '1');
                    }
                    dismissBanner(banner);
                    deferredPrompt = null;
                });
            });
        }

        setTimeout(() => {
            const current = document.getElementById('pwa-banner');
            if (current) dismissBanner(current);
        }, 15000);
    };
})();
