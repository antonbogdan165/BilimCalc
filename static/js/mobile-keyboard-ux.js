(function () {
    'use strict';

    if (!('ontouchstart' in window) && !navigator.maxTouchPoints) return;

    var vv             = window.visualViewport;
    var savedInput     = null;
    var scrollAtFocus  = 0;
    var shouldRestore  = false;
    var kbOpen         = false;
    var scrollTimer    = null;
    var lockTimer      = null;
    var scrollLocked   = false;

    var KEYBOARD_THRESHOLD = 120;

    function getVVHeight() { return vv ? vv.height : window.innerHeight; }
    var baseVVHeight = getVVHeight();
    
    function lockScroll() {
        scrollLocked = true;
        if (lockTimer) clearTimeout(lockTimer);
        lockTimer = setTimeout(function () { scrollLocked = false; }, 400);
    }

    function restoreScroll() {
        document.documentElement.style.scrollBehavior = 'auto';
        document.body.style.scrollBehavior = 'auto';
        window.scrollTo(0, scrollAtFocus);
        requestAnimationFrame(function () {
            document.documentElement.style.scrollBehavior = '';
            document.body.style.scrollBehavior = '';
        });
    }

    function centerInput(el) {
        if (!el || !document.body.contains(el)) return;
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    document.addEventListener('focusin', function (e) {
        var t = e.target;
        if (!t || t.tagName !== 'INPUT') return;
        savedInput    = t;
        shouldRestore = true;
        scrollAtFocus = window.scrollY;
    }, true);

    document.addEventListener('focusout', function () {
        setTimeout(function () {
            if (!document.hidden && !kbOpen) shouldRestore = false;
        }, 500);
    }, true);

    if (vv) {
        vv.addEventListener('resize', function () {
            var h  = getVVHeight();
            var dh = baseVVHeight - h;

            if (dh > KEYBOARD_THRESHOLD) {
                kbOpen = true;
                lockScroll();
                restoreScroll();
                if (scrollTimer) clearTimeout(scrollTimer);
                scrollTimer = setTimeout(function () {
                    centerInput(document.activeElement && document.activeElement.tagName === 'INPUT'
                        ? document.activeElement : savedInput);
                }, 80);
            } else if (dh < 30) {
                kbOpen = false;
                baseVVHeight = h;
                shouldRestore = false;
            }
        });
    }

    window.addEventListener('scroll', function () {
        if (scrollLocked) {
            document.documentElement.style.scrollBehavior = 'auto';
            document.body.style.scrollBehavior = 'auto';
            window.scrollTo(0, scrollAtFocus);
            requestAnimationFrame(function () {
                document.documentElement.style.scrollBehavior = '';
                document.body.style.scrollBehavior = '';
            });
        }
    }, { passive: false });

    var forms = document.querySelectorAll('form');
    forms.forEach(function (form) {
        form.addEventListener('submit', function () {
            if (kbOpen) {
                scrollAtFocus = window.scrollY;
                lockScroll();
            }
        });
    });

    document.addEventListener('click', function (e) {
        if (kbOpen && e.target && e.target.closest && e.target.closest('.btn.delete')) {
            scrollAtFocus = window.scrollY;
            lockScroll();
        }
    }, true);

    document.addEventListener('visibilitychange', function () {
        if (!document.hidden && shouldRestore && savedInput && document.body.contains(savedInput)) {
            setTimeout(function () {
                if (savedInput && document.body.contains(savedInput)) {
                    savedInput.focus({ preventScroll: true });
                }
            }, 300);
        }
    });

}());