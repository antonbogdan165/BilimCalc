(function (window, document) {
  'use strict';

  const SESSION_KEY = 'ab_notice_dismissed';
  const DETECT_DELAY = 1500;
  const SHOW_DELAY = 600;

  const isDismissed = () => {
    try {
      return sessionStorage.getItem(SESSION_KEY) === '1';
    } catch {
      return false;
    }
  };

  const setDismissed = () => {
    try {
      sessionStorage.setItem(SESSION_KEY, '1');
    } catch {
      // ignore
    }
  };

  const translate = (key, fallback) => {
    const I18N = window.APP_STRINGS || {};
    if (typeof window.__ === 'function') {
      return window.__(key);
    }
    return I18N[key] || fallback;
  };

  const buildBanner = () => {
    const label = translate('disable_adblock_title', 'Запрос на отключение блокировщика рекламы');
    const heading = translate('disable_adblock_heading', 'Реклама помогает сайту работать бесплатно');
    const message = translate(
      'disable_adblock_text',
      'BilimCalc — бесплатный сервис для учеников Казахстана. Реклама покрывает расходы на хостинг и разработку. Пожалуйста, отключите блокировщик для этого сайта — это займёт 10 секунд 🙂'
    );
    const howBtn = translate('disable_adblock_how', 'Как отключить?');
    const skipBtn = translate('disable_adblock_continue', 'Продолжить');
    const closeLabel = translate('close', 'Закрыть');

    const el = document.createElement('div');
    el.id = 'adblock-notice';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'false');
    el.setAttribute('aria-label', label);

    el.innerHTML = `
      <span class="abn__icon" aria-hidden="true">🙏</span>
      <div class="abn__body">
        <p class="abn__title">${heading}</p>
        <p class="abn__text">${message}</p>
        <div class="abn__actions">
          <button class="abn__btn abn__btn--primary" data-abn="how">${howBtn}</button>
          <button class="abn__btn abn__btn--secondary" data-abn="skip">${skipBtn}</button>
        </div>
      </div>
      <button class="abn__close" data-abn="close" aria-label="${closeLabel}">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
          <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        </svg>
      </button>
    `;

    return el;
  };

  const showBanner = () => {
    if (isDismissed() || document.getElementById('adblock-notice')) return;

    const banner = buildBanner();
    document.body.appendChild(banner);

    requestAnimationFrame(() =>
      requestAnimationFrame(() => banner.classList.add('abn--visible'))
    );

    const dismiss = () => {
      banner.classList.remove('abn--visible');
      setDismissed();
      setTimeout(() => {
        if (banner.parentNode) banner.parentNode.removeChild(banner);
      }, 420);
    };

    banner.addEventListener('click', (event) => {
      const button = event.target.closest('[data-abn]');
      if (!button) return;
      if (button.dataset.abn === 'how') {
        setDismissed();
        window.location.href = '/disable-adblock';
        return;
      }
      dismiss();
    });

    banner.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') dismiss();
    });
  };

  const init = () => {
    if (isDismissed()) return;
    if (!window.AdblockDetector) {
      return;
    }

    setTimeout(async () => {
      try {
        const detected = await window.AdblockDetector.detect();
        if (detected) setTimeout(showBanner, SHOW_DELAY);
      } catch {
      }
    }, DETECT_DELAY);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})(window, document);
