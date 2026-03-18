(function () {
    'use strict';

    var savedInput    = null;
    var savedScrollY  = 0;
    var shouldRestore = false;
    var blurTimer     = null;

    document.addEventListener('mousedown', function (e) {
        if (e.target && e.target.tagName === 'INPUT') {
            savedScrollY = window.scrollY;
        }
    }, true);

    document.addEventListener('touchstart', function (e) {
        if (e.target && e.target.tagName === 'INPUT') {
            savedScrollY = window.scrollY;
        }
    }, { passive: true });

    document.addEventListener('focusin', function (e) {
        var t = e.target;
        if (!t || t.tagName !== 'INPUT') return;

        savedInput    = t;
        shouldRestore = true;
        if (blurTimer) clearTimeout(blurTimer);

        requestAnimationFrame(function () {
            window.scrollTo(0, savedScrollY);
        });
    }, true);

    document.addEventListener('focusout', function () {
        blurTimer = setTimeout(function () {
            if (!document.hidden) shouldRestore = false;
        }, 400);
    }, true);

    document.addEventListener('visibilitychange', function () {
        if (!document.hidden && shouldRestore && savedInput && document.body.contains(savedInput)) {
            if (blurTimer) clearTimeout(blurTimer);
            setTimeout(function () {
                if (savedInput && document.body.contains(savedInput)) {
                    savedInput.focus({ preventScroll: true });
                }
            }, 300);
        }
    });

}());