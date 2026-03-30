(function () {
    'use strict';

    var STORAGE_KEY = 'adblock_notice_dismissed';
    var RESHOW_DAYS = 14;

    function isDismissed() {
        try {
            var val = localStorage.getItem(STORAGE_KEY);
            if (!val) return false;
            var ts = parseInt(val, 10);
            return Date.now() - ts < RESHOW_DAYS * 864e5;
        } catch (e) { return false; }
    }

    function setDismissed() {
        try { localStorage.setItem(STORAGE_KEY, Date.now()); } catch (e) {}
    }

    function detectAdBlock(cb) {
        var trap = document.createElement('div');
        trap.className = 'ad-unit ads adsbox pub_300x250 text-ad';
        trap.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;';
        document.body.appendChild(trap);
        setTimeout(function () {
            var blocked =
                trap.offsetWidth === 0 ||
                trap.offsetHeight === 0 ||
                getComputedStyle(trap).display === 'none' ||
                getComputedStyle(trap).visibility === 'hidden';
            trap.remove();
            cb(blocked);
        }, 150);
    }

    function buildNotice() {
        var el = document.createElement('div');
        el.id = 'adblock-notice';
        el.setAttribute('role', 'dialog');
        el.setAttribute('aria-label', 'Просьба отключить блокировщик рекламы');
        el.innerHTML =
            '<span class="adblock-notice__icon">🙏</span>' +
            '<div class="adblock-notice__body">' +
                '<p class="adblock-notice__title">Реклама помогает сайту работать бесплатно</p>' +
                '<p class="adblock-notice__text">BilimCalc — бесплатный сервис. Если вы используете блокировщик рекламы, пожалуйста, отключите его для этого сайта. Это займёт 10 секунд и очень помогает 🙂</p>' +
                '<div class="adblock-notice__actions">' +
                    '<button class="adblock-notice__btn adblock-notice__btn--primary" id="adblock-how-btn">Как отключить?</button>' +
                    '<button class="adblock-notice__btn adblock-notice__btn--secondary" id="adblock-skip-btn">Не сейчас</button>' +
                '</div>' +
            '</div>' +
            '<button class="adblock-notice__close" id="adblock-close-btn" aria-label="Закрыть">✕</button>';
        return el;
    }

    function showNotice() {
        var notice = buildNotice();
        document.body.appendChild(notice);

        // Анимация появления
        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                notice.classList.add('is-visible');
            });
        });

        function dismiss() {
            notice.classList.remove('is-visible');
            setDismissed();
            setTimeout(function () { notice.remove(); }, 400);
        }

        document.getElementById('adblock-close-btn').addEventListener('click', dismiss);
        document.getElementById('adblock-skip-btn').addEventListener('click', dismiss);
        document.getElementById('adblock-how-btn').addEventListener('click', function () {
            window.open(
                'https://help.adblockplus.org/hc/ru/articles/360062733293',
                '_blank',
                'noopener'
            );
            dismiss();
        });
    }

    function init() {
        if (isDismissed()) return;
        setTimeout(function () {
            detectAdBlock(function (blocked) {
                if (blocked) showNotice();
            });
        }, 2000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
