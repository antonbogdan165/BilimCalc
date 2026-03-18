(function () {
    'use strict';
    var lastInput = null;

    document.addEventListener('focusin', function (e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            lastInput = e.target;
        }
    }, true);

    document.addEventListener('visibilitychange', function () {
        if (!document.hidden && lastInput && document.body.contains(lastInput)) {
            setTimeout(function () {
                lastInput.focus({ preventScroll: true });
            }, 100);
        }
    });
}());