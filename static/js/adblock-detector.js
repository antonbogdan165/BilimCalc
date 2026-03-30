(function (w) {
  'use strict';

  const THRESHOLD = 40;
  const W = { bait: 45, ins: 35, iframe: 20, req: 25, script: 20 };
  let _score = 0;

  function baitTest() {
    return new Promise(res => {
      const el = document.createElement('div');
      el.className = 'ad ads adsbox adsbygoogle ad-unit pub_300x250 pub_728x90 text-ad textAd advertisement banner-ads sponsored';
      el.style.cssText = 'position:absolute;top:-9999px;left:-9999px;width:1px;height:1px;';
      document.body.appendChild(el);
      setTimeout(() => {
        const cs = getComputedStyle(el);
        const hit =
          !el.offsetHeight ||
          !el.offsetWidth ||
          cs.display === 'none' ||
          cs.visibility === 'hidden';
        el.remove();
        res(hit ? W.bait : 0);
      }, 150);
    });
  }

  function insTest() {
    return new Promise(res => {
      const el = document.createElement('ins');
      el.className = 'adsbygoogle';
      el.dataset.adClient = 'ca-pub-0000000000000000';
      el.dataset.adSlot = '1234567890';
      el.style.cssText =
        'display:block;position:absolute;top:-9999px;left:-9999px;width:320px;height:50px;';

      let gone = false;
      const obs = new MutationObserver(ms =>
        ms.forEach(m => m.removedNodes.forEach(n => { if (n === el) gone = true; }))
      );
      obs.observe(document.body, { childList: true });
      document.body.appendChild(el);

      setTimeout(() => {
        obs.disconnect();
        const cs = getComputedStyle(el);
        const hit = gone || !el.offsetHeight || !el.offsetWidth || cs.display === 'none';
        if (el.parentNode) el.remove();
        res(hit ? W.ins : 0);
      }, 500);
    });
  }

  function iframeTest() {
    return new Promise(res => {
      const el = document.createElement('iframe');
      el.src = 'about:blank';
      el.className = 'ads adsbox ad-slot text-ad ad-frame';
      el.style.cssText =
        'position:absolute;top:-9999px;left:-9999px;width:1px;height:1px;';
      document.body.appendChild(el);

      setTimeout(() => {
        const cs = getComputedStyle(el);
        const hit =
          !el.offsetHeight ||
          cs.display === 'none' ||
          cs.visibility === 'hidden';
        el.remove();
        res(hit ? W.iframe : 0);
      }, 300);
    });
  }

  function reqTest() {
    return fetch('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js', {
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-store',
    })
      .then(() => 0)
      .catch(() => W.req);
  }

  function scriptTest() {
    return new Promise(res => {
      const el = document.createElement('script');
      el.src =
        'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?_=' +
        Date.now();
      el.async = true;
      let tid;
      const done = v => {
        clearTimeout(tid);
        if (el.parentNode) el.remove();
        res(v);
      };
      el.onload = () => done(0);
      el.onerror = () => done(W.script);
      tid = setTimeout(() => done(W.script), 2500);
      document.head.appendChild(el);
    });
  }

  async function detect() {
    if (!document.body) {
      await new Promise(r =>
        document.addEventListener('DOMContentLoaded', r, { once: true })
      );
    }
    const results = await Promise.allSettled([
      baitTest(),
      insTest(),
      iframeTest(),
      reqTest(),
      scriptTest(),
    ]);
    _score = results.reduce(
      (s, r) => s + (r.status === 'fulfilled' ? r.value : 0),
      0
    );
    return _score >= THRESHOLD;
  }

  w.AdblockDetector = {
    detect,
    getScore: () => _score,
    THRESHOLD,
  };
})(window);
