(function () {
    'use strict';

    var cfg = window.__YA_ADS__ || {};

    function renderBlock(blockId, containerId) {
        if (!blockId || !containerId) return;
        window.yaContextCb = window.yaContextCb || [];
        window.yaContextCb.push(function () {
            try {
                Ya.Context.AdvManager.render({ blockId: blockId, renderTo: containerId });
            } catch (e) {}
        });
    }

    function injectArticleAds() {
        var ids = cfg.article;
        if (!ids || !ids.length) return;

        var article = document.querySelector('article.article');
        if (!article) return;

        var paragraphs = Array.prototype.slice.call(
            article.querySelectorAll(':scope > p, .article__lead ~ p, h2 ~ p')
        );
        if (!paragraphs.length) {
            paragraphs = Array.prototype.slice.call(article.querySelectorAll('p'));
        }
        if (paragraphs.length < 3) return;

        var slots = [];

        if (paragraphs[1] && ids[0]) {
            slots.push({ after: paragraphs[1], blockId: ids[0], idx: 0 });
        }

        var mid = Math.floor(paragraphs.length / 2);
        if (paragraphs[mid] && ids[1] && mid > 1) {
            slots.push({ after: paragraphs[mid], blockId: ids[1], idx: 1 });
        }

        var lastIdx = paragraphs.length > 2 ? paragraphs.length - 2 : paragraphs.length - 1;
        if (paragraphs[lastIdx] && ids[2] && lastIdx !== mid && lastIdx > 1) {
            slots.push({ after: paragraphs[lastIdx], blockId: ids[2], idx: 2 });
        }

        slots.forEach(function (slot) {
            var wrap = document.createElement('div');
            wrap.className = 'ya-ad-inline';
            wrap.dataset.blockId = slot.blockId;
            wrap.dataset.containerId = 'ya_art_ad_' + slot.idx;
            wrap.innerHTML =
                '<span class="ya-ad-inline__label">Реклама</span>' +
                '<div class="ya-ad-inline__wrap" id="ya_art_ad_' + slot.idx + '"></div>';

            if (slot.after.nextSibling) {
                slot.after.parentNode.insertBefore(wrap, slot.after.nextSibling);
            } else {
                slot.after.parentNode.appendChild(wrap);
            }
        });

        observeInlineAds();
    }

    function observeInlineAds() {
        var ads = document.querySelectorAll('.ya-ad-inline');
        if (!ads.length) return;

        if (!('IntersectionObserver' in window)) {
            ads.forEach(function (el) {
                el.classList.add('ad-visible');
                renderBlock(el.dataset.blockId, el.dataset.containerId);
            });
            return;
        }

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                var el = entry.target;
                if (el.dataset.adLoaded) return;
                el.dataset.adLoaded = '1';
                el.classList.add('ad-visible');
                renderBlock(el.dataset.blockId, el.dataset.containerId);
                observer.unobserve(el);
            });
        }, { rootMargin: '0px 0px -60px 0px', threshold: 0.05 });

        ads.forEach(function (el) { observer.observe(el); });
    }

    function initFloorAd() {
        var blockId = cfg.sticky;
        if (!blockId) return;
        if (!document.getElementById('ya_sticky_content')) return;
        renderBlock(blockId, 'ya_sticky_content');
    }

    function init() {
        injectArticleAds();
        initFloorAd();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();