(function () {
    if (window.innerWidth > 600) return;

    var origShowTrend = window.showTrend;

    window.showTrend = function (visible) {
        var btn = document.getElementById('trendTriggerBtn');
        var box = document.querySelector('.trend-box');

        if (btn) btn.classList.toggle('m-visible', !!visible);

        if (box) {
            box.classList.toggle('collapsed', !visible);
            if (!visible) closeSheet();
        }

        if (!visible && window.trendChart) {
            try { window.trendChart.destroy(); } catch (e) {}
            window.trendChart = null;
            var acc = document.getElementById('aiAccuracy');
            var lbl = document.getElementById('trendLabel');
            if (acc) acc.textContent = '--%';
            if (lbl) lbl.textContent = '—';
        }
    };

    function openSheet() {
        var box = document.querySelector('.trend-box');
        var bd = document.getElementById('trendBackdrop');
        if (!box || box.classList.contains('collapsed')) return;
        box.classList.add('m-sheet-open');
        if (bd) bd.classList.add('m-visible');
        document.body.style.overflow = 'hidden';
        setTimeout(function () {
            if (window.trendChart && window.trendChart.resize) window.trendChart.resize();
        }, 370);
    }

    function closeSheet() {
        var box = document.querySelector('.trend-box');
        var bd = document.getElementById('trendBackdrop');
        if (box) box.classList.remove('m-sheet-open');
        if (bd) bd.classList.remove('m-visible');
        document.body.style.overflow = '';
    }

    var triggerBtn = document.getElementById('trendTriggerBtn');
    if (triggerBtn) triggerBtn.addEventListener('click', openSheet);

    var bd = document.getElementById('trendBackdrop');
    if (bd) bd.addEventListener('click', closeSheet);

    var startY = 0;
    var box = document.querySelector('.trend-box');
    if (box) {
        box.addEventListener('touchstart', function (e) {
            startY = e.touches[0].clientY;
        }, { passive: true });
        box.addEventListener('touchend', function (e) {
            if (e.changedTouches[0].clientY - startY > 55) closeSheet();
        }, { passive: true });
    }
})();
