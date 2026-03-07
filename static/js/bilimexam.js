(function () {
    'use strict';

    /* ── Инициализация темы и UI ── */
    ThemeToggle.init();

    var yearEl = document.getElementById('yearExam');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    /* ── Splash / Loader ── */
    // page-loader.js показывает BilimExam-брендованный оверлей (window.__BRAND__)
    // и скрывает его сам. Дополнительно скрываем старый #examSplash если он есть.
    var splash = document.getElementById('examSplash');
    if (splash) setTimeout(function () { splash.classList.add('hidden'); }, 800);
    if (window.PageLoader) window.PageLoader.hide();

    /* ── Offline banner ── */
    var ob = document.getElementById('offlineBanner');
    if (ob) {
        if (!navigator.onLine) ob.style.display = 'block';
        window.addEventListener('offline', function () { ob.style.display = 'block'; });
        window.addEventListener('online',  function () { ob.style.display = 'none'; });
    }

    /* ── Reveal анимация ── */
    var revItems = document.querySelectorAll('.reveal');
    if (revItems.length) {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
            });
        }, { threshold: 0.08 });
        revItems.forEach(function (el, i) {
            el.style.transitionDelay = (i * 0.06) + 's';
            io.observe(el);
        });
    }

    /* ── Ripple эффект ── */
    document.addEventListener('click', function (e) {
        var t = e.target.closest('.mobile-nav__item, .btn, .grade-btn');
        if (!t) return;
        var r = t.getBoundingClientRect();
        var rip = document.createElement('span');
        rip.className = 'ripple';
        rip.style.left = (e.clientX - r.left) + 'px';
        rip.style.top  = (e.clientY - r.top) + 'px';
        t.style.position = t.style.position || 'relative';
        t.style.overflow = 'hidden';
        t.appendChild(rip);
        rip.addEventListener('animationend', function () { rip.remove(); });
    });

    /* ══ ЛОГИКА КАЛЬКУЛЯТОРА ══ */
    var SAVE_KEY = 'bilimexam_v2';
    var state = { q1: null, q2: null, q3: null, q4: null, exam: null };

    /* Активация кнопки в пикере */
    function setPickerActive(picker, val) {
        if (!picker) return;
        picker.querySelectorAll('.grade-btn').forEach(function (b) {
            b.classList.remove('active-2', 'active-3', 'active-4', 'active-5');
        });
        if (val !== null) {
            var btn = picker.querySelector('[data-val="' + val + '"]');
            if (btn) btn.classList.add('active-' + val);
        }
    }

    /* Навешиваем обработчики на все пикеры */
    document.querySelectorAll('.grade-picker').forEach(function (picker) {
        var qKey = picker.dataset.q;
        picker.querySelectorAll('.grade-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var val = parseInt(btn.dataset.val, 10);
                /* Toggle: если уже выбрана та же оценка — снимаем */
                state[qKey] = (state[qKey] === val) ? null : val;
                setPickerActive(picker, state[qKey]);
                saveState();
                calculate();
            });
        });
    });

    /* Информация об оценке */
    function gradeInfo(g) {
        if (g === 5) return { label: 'Отлично 🎉', badgeCls: 'badge-excellent', resCls: 'eg-5', fill: '#166534' };
        if (g === 4) return { label: 'Хорошо',     badgeCls: 'badge-good',      resCls: 'eg-4', fill: 'var(--accent)' };
        if (g === 3) return { label: 'Удовлетворительно', badgeCls: 'badge-warning', resCls: 'eg-3', fill: 'var(--warning)' };
        return               { label: 'Неудовлетворительно', badgeCls: 'badge-danger', resCls: 'eg-2', fill: 'var(--danger)' };
    }

    /* Рендер "нужной оценки" */
    function renderNeed(elId, annual, threshold, cls) {
        var el = document.getElementById(elId);
        if (!el) return;
        var needed = (threshold - annual * 0.7) / 0.3;
        if (needed <= 2) {
            el.textContent = 'любая';
            el.className = 'need-item__grade ng-ok';
        } else if (needed > 5) {
            el.textContent = '✗';
            el.className = 'need-item__grade ng-no';
        } else {
            el.textContent = Math.ceil(needed);
            el.className = 'need-item__grade ' + cls;
        }
    }

    /* Основной расчёт */
    function calculate() {
        var qs = [state.q1, state.q2, state.q3, state.q4].filter(function (v) { return v !== null; });

        var resultEl = document.getElementById('examResultGrade');
        var badge    = document.getElementById('examGradeBadge');
        var fillEl   = document.getElementById('examProgressFill');
        var aRow     = document.getElementById('annualInfoRow');
        var eRow     = document.getElementById('examInfoRow');
        var aVal     = document.getElementById('annualInfoVal');
        var eVal     = document.getElementById('examInfoVal');
        var bA       = document.getElementById('bAnnual');
        var bE       = document.getElementById('bExam');
        var bF       = document.getElementById('bFinal');
        var needBox  = document.getElementById('needBox');
        var hint     = document.getElementById('formulaHint');

        if (qs.length === 0) {
            resultEl.textContent = '—';
            resultEl.className = 'exam-result-grade eg-dash';
            badge.textContent = 'Нет данных';
            badge.className = 'grade-badge badge-empty';
            fillEl.style.width = '0%';
            if (aRow) aRow.style.display = 'none';
            if (eRow) eRow.style.display = 'none';
            if (bA) bA.textContent = '—';
            if (bE) bE.textContent = '—';
            if (bF) bF.textContent = '—';
            if (needBox) needBox.style.display = 'none';
            if (hint) hint.textContent = '';
            return;
        }

        var annual = qs.reduce(function (a, b) { return a + b; }, 0) / qs.length;
        var hasExam = state.exam !== null;
        var raw = hasExam ? (annual * 0.7 + state.exam * 0.3) : annual;
        var finalG = Math.round(raw);
        /* Ограничиваем диапазон 2-5 */
        finalG = Math.max(2, Math.min(5, finalG));
        var info = gradeInfo(finalG);

        resultEl.textContent = finalG;
        resultEl.className = 'exam-result-grade ' + info.resCls;
        badge.textContent = info.label;
        badge.className = 'grade-badge ' + info.badgeCls;

        var pct = ((finalG - 2) / 3) * 100;
        fillEl.style.width = Math.min(Math.max(pct, 0), 100) + '%';
        fillEl.style.background = info.fill;

        if (aRow) aRow.style.display = 'flex';
        if (aVal) aVal.textContent = (annual % 1 === 0) ? annual : annual.toFixed(2);

        if (hasExam) {
            if (eRow) eRow.style.display = 'flex';
            if (eVal) eVal.textContent = state.exam;
            if (bA) bA.textContent = (annual * 0.7).toFixed(2);
            if (bE) bE.textContent = (state.exam * 0.3).toFixed(2);
            if (bF) bF.textContent = raw.toFixed(2);
            if (hint) hint.textContent = annual.toFixed(2) + ' × 0.7 + ' + state.exam + ' × 0.3 = ' + raw.toFixed(2) + ' → ' + finalG;
            if (needBox) needBox.style.display = 'none';
        } else {
            if (eRow) eRow.style.display = 'none';
            if (bA) bA.textContent = annual.toFixed(2);
            if (bE) bE.textContent = '?';
            if (bF) bF.textContent = raw.toFixed(2);
            if (hint) hint.textContent = 'Выбери оценку за экзамен для точного результата';
            if (needBox) needBox.style.display = 'block';
            renderNeed('need5', annual, 4.5, 'ng-5');
            renderNeed('need4', annual, 3.5, 'ng-4');
            renderNeed('need3', annual, 2.5, 'ng-3');
        }
    }

    /* Сброс */
    var resetBtn = document.getElementById('examResetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', function () {
            state = { q1: null, q2: null, q3: null, q4: null, exam: null };
            document.querySelectorAll('.grade-picker').forEach(function (p) {
                setPickerActive(p, null);
            });
            try { localStorage.removeItem(SAVE_KEY); } catch (ex) {}
            calculate();
        });
    }

    /* Сохранение */
    function saveState() {
        try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (ex) {}
    }

    /* Загрузка */
    function loadState() {
        try {
            var raw = localStorage.getItem(SAVE_KEY);
            if (!raw) return;
            var s = JSON.parse(raw);
            ['q1','q2','q3','q4','exam'].forEach(function (k) {
                if (s[k] !== undefined) state[k] = s[k];
            });
            ['q1','q2','q3','q4'].forEach(function (k) {
                if (state[k] !== null) {
                    var p = document.querySelector('[data-q="' + k + '"]');
                    if (p) setPickerActive(p, state[k]);
                }
            });
            if (state.exam !== null) {
                var ep = document.querySelector('[data-q="exam"]');
                if (ep) setPickerActive(ep, state.exam);
            }
        } catch (ex) {}
    }

    /* ── Старт ── */
    loadState();
    calculate();

    /* ── Service Worker (офлайн) ── */
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function () {
            navigator.serviceWorker.register('/sw.js')
                .then(function (reg) { console.log('SW registered', reg.scope); })
                .catch(function (err) { console.warn('SW registration failed', err); });
        });
    }
})();