(function () {
    'use strict';

    ThemeToggle.init();

    var yearEl = document.getElementById('yearExam');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    var splash = document.getElementById('examSplash');
    if (splash) setTimeout(function () { splash.classList.add('hidden'); }, 800);

    var ob = document.getElementById('offlineBanner');
    if (ob) {
        if (!navigator.onLine) ob.style.display = 'block';
        window.addEventListener('offline', function () { ob.style.display = 'block'; });
        window.addEventListener('online', function () { ob.style.display = 'none'; });
    }

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

    document.addEventListener('click', function (e) {
        var t = e.target.closest('.mobile-nav__item, .btn, .grade-btn');
        if (!t) return;
        var r = t.getBoundingClientRect();
        var rip = document.createElement('span');
        rip.className = 'ripple';
        rip.style.left = (e.clientX - r.left) + 'px';
        rip.style.top = (e.clientY - r.top) + 'px';
        t.style.position = t.style.position || 'relative';
        t.style.overflow = 'hidden';
        t.appendChild(rip);
        rip.addEventListener('animationend', function () { rip.remove(); });
    });

    function hapticReset() {
        if (navigator.vibrate) navigator.vibrate([12, 60, 12]);
    }

    var SAVE_KEY = 'bilimexam_v2';
    var state = { q1: null, q2: null, q3: null, q4: null, exam: null };

    function highlightGrade(picker, val) {
        if (!picker) return;
        picker.querySelectorAll('.grade-btn').forEach(function (b) {
            b.classList.remove('active-2', 'active-3', 'active-4', 'active-5');
        });
        if (val !== null) {
            var btn = picker.querySelector('[data-val="' + val + '"]');
            if (btn) btn.classList.add('active-' + val);
        }
    }

    document.querySelectorAll('.grade-picker').forEach(function (picker) {
        var qKey = picker.dataset.q;
        picker.querySelectorAll('.grade-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var val = parseInt(btn.dataset.val, 10);
                state[qKey] = (state[qKey] === val) ? null : val;
                highlightGrade(picker, state[qKey]);
                saveState();
                calculate();
            });
        });
    });

    function updateEmptyHint() {
        var hintEl = document.getElementById('examEmptyHint');
        var qs = [state.q1, state.q2, state.q3, state.q4].filter(function (v) { return v !== null; });
        if (!hintEl) return;
        hintEl.style.display = qs.length === 0 ? 'flex' : 'none';
    }

    function getSharePageUrl() {
        return window.location.origin + window.location.pathname;
    }

    function getShareText() {
        var gradeEl = document.getElementById('examResultGrade');
        var badgeEl = document.getElementById('examGradeBadge');
        var grade = gradeEl ? gradeEl.textContent.trim() : '—';
        var label = badgeEl ? badgeEl.textContent.trim() : '';
        if (grade === '—' || !label || label === window.__('result_no_data')) {
            return window.__('share_result_exam', { result: '—', badge: window.__('result_no_data') });
        }
        return window.__('share_result_exam', { result: grade, badge: label });
    }

    function showExamShareModal() {
        window.openShareModal({
            text: getShareText(),
            url: getSharePageUrl(),
            title: window.__('share_modal_title'),
            channels: ['tg', 'wa', 'copy']
        });
    }

    (function initShareBtn() {
        var shareBtn = document.getElementById('examShareBtn');
        if (!shareBtn) return;
        shareBtn.addEventListener('click', function () {
            var isDesktop = window.matchMedia('(min-width: 1024px)').matches;
            var text = getShareText();
            var url = getSharePageUrl();
            if (navigator.share && !isDesktop) {
                navigator.share({ title: 'BilimExam — итоговая оценка', text: text, url: url })
                    .catch(function (e) { if (e.name !== 'AbortError') showExamShareModal(); });
            } else if (isDesktop) {
                navigator.clipboard.writeText(text + ' ' + url).then(function () {
                    var orig = shareBtn.innerHTML;
                    shareBtn.textContent = '✓ Скопировано!';
                    setTimeout(function () { shareBtn.innerHTML = orig; }, 2000);
                }).catch(function () { });
            } else {
                showExamShareModal();
            }
        });
    })();

    function getGradeLabel(g) {
        if (g === 5) return { label: window.__('grade_excellent'), badgeCls: 'badge-excellent', resCls: 'eg-5', fill: '#166534' };
        if (g === 4) return { label: window.__('grade_good'), badgeCls: 'badge-good', resCls: 'eg-4', fill: 'var(--accent)' };
        if (g === 3) return { label: window.__('grade_pass'), badgeCls: 'badge-warning', resCls: 'eg-3', fill: 'var(--warning)' };
        return { label: window.__('grade_fail'), badgeCls: 'badge-danger', resCls: 'eg-2', fill: 'var(--danger)' };
    }

    function showNeededGrade(elId, annual, threshold, cls) {
        var el = document.getElementById(elId);
        if (!el) return;
        var needed = (threshold - annual * 0.7) / 0.3;
        if (needed <= 2) {
            el.textContent = window.__('need_any');
            el.className = 'need-item__grade ng-ok';
        } else if (needed > 5) {
            el.textContent = '✗';
            el.className = 'need-item__grade ng-no';
        } else {
            el.textContent = Math.ceil(needed);
            el.className = 'need-item__grade ' + cls;
        }
    }

    function calculate() {
        var qs = [state.q1, state.q2, state.q3, state.q4].filter(function (v) { return v !== null; });

        updateEmptyHint();

        var resultEl = document.getElementById('examResultGrade');
        var badge = document.getElementById('examGradeBadge');
        var fillEl = document.getElementById('examProgressFill');
        var aRow = document.getElementById('annualInfoRow');
        var eRow = document.getElementById('examInfoRow');
        var aVal = document.getElementById('annualInfoVal');
        var eVal = document.getElementById('examInfoVal');
        var bA = document.getElementById('bAnnual');
        var bE = document.getElementById('bExam');
        var bF = document.getElementById('bFinal');
        var needBox = document.getElementById('needBox');
        var hint = document.getElementById('formulaHint');
        var shareBtn = document.getElementById('examShareBtn');

        if (qs.length === 0) {
            resultEl.textContent = '—';
            resultEl.className = 'exam-result-grade eg-dash';
            badge.textContent = window.__('result_no_data');
            badge.className = 'grade-badge badge-empty';
            fillEl.style.width = '0%';
            if (aRow) aRow.style.display = 'none';
            if (eRow) eRow.style.display = 'none';
            if (bA) bA.textContent = '—';
            if (bE) bE.textContent = '—';
            if (bF) bF.textContent = '—';
            if (needBox) needBox.style.display = 'none';
            if (hint) hint.textContent = '';
            if (shareBtn) shareBtn.style.display = 'none';
            return;
        }

        var annual = qs.reduce(function (a, b) { return a + b; }, 0) / qs.length;
        var hasExam = state.exam !== null;
        var raw = hasExam ? (annual * 0.7 + state.exam * 0.3) : annual;
        var finalG = Math.max(2, Math.min(5, Math.round(raw)));
        var info = getGradeLabel(finalG);

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
            if (hint) hint.textContent = window.__('choose_exam_hint');
            if (needBox) needBox.style.display = 'block';
            showNeededGrade('need5', annual, 4.5, 'ng-5');
            showNeededGrade('need4', annual, 3.5, 'ng-4');
            showNeededGrade('need3', annual, 2.5, 'ng-3');
        }

        if (shareBtn) shareBtn.style.display = 'flex';
    }

    var resetBtn = document.getElementById('examResetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', function () {
            hapticReset();
            state = { q1: null, q2: null, q3: null, q4: null, exam: null };
            document.querySelectorAll('.grade-picker').forEach(function (p) {
                highlightGrade(p, null);
            });
            try { localStorage.removeItem(SAVE_KEY); } catch (ex) { }
            calculate();
        });
    }

    function saveState() {
        try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (ex) { }
    }

    function loadState() {
        try {
            var raw = localStorage.getItem(SAVE_KEY);
            if (!raw) return;
            var s = JSON.parse(raw);
            ['q1', 'q2', 'q3', 'q4', 'exam'].forEach(function (k) {
                if (s[k] !== undefined) state[k] = s[k];
            });
            ['q1', 'q2', 'q3', 'q4'].forEach(function (k) {
                if (state[k] !== null) {
                    var p = document.querySelector('[data-q="' + k + '"]');
                    if (p) highlightGrade(p, state[k]);
                }
            });
            if (state.exam !== null) {
                var ep = document.querySelector('[data-q="exam"]');
                if (ep) highlightGrade(ep, state.exam);
            }
        } catch (ex) { }
    }

    loadState();
    calculate();

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function () {
            navigator.serviceWorker.register('/sw.js');
        });
    }
})();