(function (w, d) {
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
    } catch {}
  };

  function buildBanner() {
    const el = d.createElement('div');
    el.id = 'adblock-notice';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'false');
    el.setAttribute(
      'aria-label',
      'Запрос на отключение блокировщика рекламы'
    );

    el.innerHTML =
      '<span class="abn__icon" aria-hidden="true">🙏</span>' +
      '<div class="abn__body">' +
        '<p class="abn__title">Реклама помогает сайту работать бесплатно</p>' +
        '<p class="abn__text">BilimCalc — бесплатный сервис для учеников Казахстана.' +
        ' Реклама покрывает расходы на хостинг и разработку.' +
        ' Пожалуйста, отключите блокировщик для этого сайта — это займёт 10 секунд 🙂</p>' +
        '<div class="abn__actions">' +
          '<button class="abn__btn abn__btn--primary" data-abn="how">Как отключить?</button>' +
          '<button class="abn__btn abn__btn--secondary" data-abn="skip">Продолжить</button>' +
        '</div>' +
      '</div>' +
      '<button class="abn__close" data-abn="close" aria-label="Закрыть">' +
        '<svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">' +
          '<path d="M1 1l8 8M9 1L1 9" stroke="currentColor"' +
          ' stroke-width="1.8" stroke-linecap="round"/>' +
        '</svg>' +
      '</button>';

    return el;
  }

  function show() {
    if (isDismissed() || d.getElementById('adblock-notice')) return;

    const el = buildBanner();
    d.body.appendChild(el);

    requestAnimationFrame(() =>
      requestAnimationFrame(() => el.classList.add('abn--visible'))
    );

    const dismiss = () => {
      el.classList.remove('abn--visible');
      setDismissed();
      setTimeout(() => {
        if (el.parentNode) el.remove();
      }, 420);
    };

    el.addEventListener('click', e => {
      const btn = e.target.closest('[data-abn]');
      if (!btn) return;
      if (btn.dataset.abn === 'how') {
        setDismissed();
        w.location.href = '/disable-adblock';
        return;
      }
      dismiss();
    });

    el.addEventListener('keydown', e => {
      if (e.key === 'Escape') dismiss();
    });
  }

  function init() {
    if (isDismissed()) return;
    if (!w.AdblockDetector) {
      console.warn('[AdblockUI] AdblockDetector not found. Load adblock-detector.js first.');
      return;
    }

    setTimeout(async () => {
      try {
        const detected = await w.AdblockDetector.detect();
        if (detected) setTimeout(show, SHOW_DELAY);
      } catch (e) {}
    }, DETECT_DELAY);
  }

  if (d.readyState === 'loading') {
    d.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})(window, document);