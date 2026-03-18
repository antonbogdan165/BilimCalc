(function () {
    'use strict';

    if (!('ontouchstart' in window) && !navigator.maxTouchPoints) return;

    var vv = window.visualViewport;
    if (!vv) return;

    var savedInput           = null;
    var baseHeight           = vv.height;
    var scrollTimer          = null;
    var wasKeyboardOpenOnHide = false;

    function isKeyboardOpen() {
        return baseHeight - vv.height > 150;
    }

    document.addEventListener('focusin', function (e) {
        if (e.target && e.target.tagName === 'INPUT') {
            savedInput = e.target;
        }
    }, true);

    vv.addEventListener('resize', function () {
        var active = document.activeElement;
        if (!active || active.tagName !== 'INPUT') return;
        if (!isKeyboardOpen()) return;

        if (scrollTimer) clearTimeout(scrollTimer);
        scrollTimer = setTimeout(function () {
            if (document.activeElement === active && document.body.contains(active)) {
                active.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 80);
    });

    document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
            wasKeyboardOpenOnHide = isKeyboardOpen();
        } else {
            if (wasKeyboardOpenOnHide && savedInput && document.body.contains(savedInput)) {
                setTimeout(function () {
                    if (savedInput && document.body.contains(savedInput)) {
                        savedInput.focus({ preventScroll: true });
                    }
                }, 200);
            }
        }
    });

}());