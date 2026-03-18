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
        window.addEventListener('online',  function () { ob.style.display = 'none'; });
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
        var r   = t.getBoundingClientRect();
        var rip = document.createElement('span');
        rip.className = 'ripple';
        rip.style.left = (e.clientX - r.left) + 'px';
        rip.style.top  = (e.clientY - r.top)  + 'px';
        t.style.position = t.style.position || 'relative';
        t.style.overflow = 'hidden';
        t.appendChild(rip);
        rip.addEventListener('animationend', function () { rip.remove(); });
    });

    function hapticReset() {
        if (navigator.vibrate) navigator.vibrate([12, 60, 12]);
    }

    var SAVE_KEY = 'bilimexam_v2';
    var state    = { q1: null, q2: null, q3: null, q4: null, exam: null };

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

    var SITE_URL = 'https://bilimcalc.vercel.app/kalkulator-ekzamena';

    function getShareText() {
        var gradeEl = document.getElementById('examResultGrade');
        var badgeEl = document.getElementById('examGradeBadge');
        var grade   = gradeEl ? gradeEl.textContent.trim() : '—';
        var label   = badgeEl ? badgeEl.textContent.trim() : '';
        if (grade === '—' || !label || label === 'Нет данных') {
            return 'Считай итоговую оценку за год в BilimExam!';
        }
        return 'Моя итоговая оценка за год: ' + grade + ' — ' + label + '. Проверь свою на BilimExam!';
    }

    function showExamShareModal() {
        if (document.getElementById('examShareModal')) return;
        var text       = getShareText();
        var url        = SITE_URL;
        var encodedUrl = encodeURIComponent(url);
        var tgLink     = 'https://t.me/share/url?url=' + encodedUrl + '&text=' + encodeURIComponent(text);
        var waLink     = 'https://api.whatsapp.com/send?text=' + encodeURIComponent(text + '\n') + encodedUrl;

        var modal = document.createElement('div');
        modal.id  = 'examShareModal';
        modal.innerHTML =
            '<div class="esm-overlay"></div>' +
            '<div class="esm-box">' +
                '<div class="esm-title">Поделиться результатом</div>' +
                '<div class="esm-text">' + text + '</div>' +
                '<div class="esm-btns">' +
                    '<a href="' + tgLink + '" target="_blank" rel="noopener" class="esm-btn esm-btn--tg">' +
                        '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z"/></svg>' +
                        'Telegram</a>' +
                    '<a href="' + waLink + '" target="_blank" rel="noopener" class="esm-btn esm-btn--wa">' +
                        '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/><path d="M12 0C5.374 0 0 5.373 0 12c0 2.117.549 4.107 1.508 5.84L.057 23.928a.5.5 0 0 0 .614.614l6.088-1.451A11.948 11.948 0 0 0 12 24c6.627 0 12-5.374 12-12S18.627 0 12 0m0 21.96a9.923 9.923 0 0 1-5.065-1.381l-.364-.214-3.768.898.915-3.672-.236-.378A9.923 9.923 0 0 1 2.04 12C2.04 6.5 6.5 2.04 12 2.04S21.96 6.5 21.96 12 17.5 21.96 12 21.96"/></svg>' +
                        'WhatsApp</a>' +
                    '<button class="esm-btn esm-btn--copy" id="examShareCopy">' +
                        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>' +
                        'Копировать</button>' +
                '</div>' +
                '<button class="esm-close" id="examShareClose" aria-label="Закрыть">✕</button>' +
            '</div>';

        if (!document.getElementById('esmStyles')) {
            var s = document.createElement('style');
            s.id = 'esmStyles';
            s.textContent =
                '#examShareModal{position:fixed;inset:0;z-index:5000;display:flex;align-items:flex-end;justify-content:center;padding:0 0 env(safe-area-inset-bottom,0px)}' +
                '.esm-overlay{position:absolute;inset:0;background:rgba(0,0,0,0.55);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);animation:esmIn 0.22s ease}' +
                '.esm-box{position:relative;z-index:1;width:100%;max-width:480px;background:#161b22;border:1px solid rgba(255,255,255,0.08);border-radius:20px 20px 0 0;padding:22px 18px 28px;animation:esmBoxIn 0.28s cubic-bezier(.34,1.56,.64,1)}' +
                '[data-theme="light"] .esm-box{background:#fff;border-color:rgba(0,0,0,0.1)}' +
                '.esm-title{font-size:15px;font-weight:700;color:#e6edf3;text-align:center;margin-bottom:7px}' +
                '[data-theme="light"] .esm-title{color:#0f172a}' +
                '.esm-text{font-size:13px;color:#8b949e;text-align:center;margin-bottom:18px;line-height:1.5}' +
                '[data-theme="light"] .esm-text{color:#64748b}' +
                '.esm-btns{display:grid;grid-template-columns:1fr 1fr;gap:9px}' +
                '.esm-btn{display:flex;align-items:center;justify-content:center;gap:7px;padding:11px 14px;border-radius:11px;font-size:13px;font-weight:600;cursor:pointer;text-decoration:none;border:none;transition:opacity 0.15s,transform 0.1s;-webkit-tap-highlight-color:transparent}' +
                '.esm-btn:active{opacity:0.8;transform:scale(0.97)}' +
                '.esm-btn--tg{background:#2CA5E0;color:#fff}' +
                '.esm-btn--wa{background:#25D366;color:#fff}' +
                '.esm-btn--copy{background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);color:#e6edf3}' +
                '[data-theme="light"] .esm-btn--copy{background:#f1f5f9;border-color:rgba(0,0,0,0.1);color:#0f172a}' +
                '.esm-close{position:absolute;top:12px;right:14px;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.08);border-radius:7px;color:#8b949e;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:13px;cursor:pointer;-webkit-tap-highlight-color:transparent}' +
                '@keyframes esmIn{from{opacity:0}to{opacity:1}}' +
                '@keyframes esmBoxIn{from{transform:translateY(35px);opacity:0}to{transform:translateY(0);opacity:1}}' +
                '@media(min-width:601px){#examShareModal{align-items:center}.esm-box{border-radius:18px;max-width:380px}}';
            document.head.appendChild(s);
        }

        document.body.appendChild(modal);

        function closeModal() {
            var box     = modal.querySelector('.esm-box');
            var overlay = modal.querySelector('.esm-overlay');
            box.style.cssText     += ';transition:transform 0.18s ease,opacity 0.18s ease;transform:translateY(28px);opacity:0';
            overlay.style.cssText += ';transition:opacity 0.18s ease;opacity:0';
            setTimeout(function () { modal.remove(); }, 200);
        }

        document.getElementById('examShareClose').addEventListener('click', closeModal);
        modal.querySelector('.esm-overlay').addEventListener('click', closeModal);
        document.getElementById('examShareCopy').addEventListener('click', function () {
            var btn = this;
            navigator.clipboard.writeText(text + ' ' + url).then(function () {
                btn.innerHTML = '✓ Скопировано!';
                btn.style.background = 'rgba(46,160,67,0.2)';
                btn.style.color      = '#3fb950';
                setTimeout(function () { btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Копировать'; btn.style.background = ''; btn.style.color = ''; }, 2000);
            }).catch(function () {});
        });
    }

    (function initShareBtn() {
        var shareBtn = document.getElementById('examShareBtn');
        if (!shareBtn) return;
        shareBtn.addEventListener('click', function () {
            var isDesktop = window.matchMedia('(min-width: 1024px)').matches;
            var text = getShareText();
            if (navigator.share && !isDesktop) {
                navigator.share({ title: 'BilimExam — итоговая оценка', text: text, url: SITE_URL })
                    .catch(function (e) { if (e.name !== 'AbortError') showExamShareModal(); });
            } else if (isDesktop) {
                navigator.clipboard.writeText(text + ' ' + SITE_URL).then(function () {
                    var orig = shareBtn.innerHTML;
                    shareBtn.textContent = '✓ Скопировано!';
                    setTimeout(function () { shareBtn.innerHTML = orig; }, 2000);
                }).catch(function () {});
            } else {
                showExamShareModal();
            }
        });
    })();

    function getGradeLabel(g) {
        if (g === 5) return { label: 'Отлично 🎉',          badgeCls: 'badge-excellent', resCls: 'eg-5', fill: '#166534' };
        if (g === 4) return { label: 'Хорошо',              badgeCls: 'badge-good',      resCls: 'eg-4', fill: 'var(--accent)' };
        if (g === 3) return { label: 'Удовлетворительно',   badgeCls: 'badge-warning',   resCls: 'eg-3', fill: 'var(--warning)' };
        return               { label: 'Неудовлетворительно',badgeCls: 'badge-danger',    resCls: 'eg-2', fill: 'var(--danger)' };
    }

    function showNeededGrade(elId, annual, threshold, cls) {
        var el = document.getElementById(elId);
        if (!el) return;
        var needed = (threshold - annual * 0.7) / 0.3;
        if (needed <= 2) {
            el.textContent = 'любая';
            el.className   = 'need-item__grade ng-ok';
        } else if (needed > 5) {
            el.textContent = '✗';
            el.className   = 'need-item__grade ng-no';
        } else {
            el.textContent = Math.ceil(needed);
            el.className   = 'need-item__grade ' + cls;
        }
    }

    function calculate() {
        var qs = [state.q1, state.q2, state.q3, state.q4].filter(function (v) { return v !== null; });

        updateEmptyHint();

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
        var shareBtn = document.getElementById('examShareBtn');

        if (qs.length === 0) {
            resultEl.textContent  = '—';
            resultEl.className    = 'exam-result-grade eg-dash';
            badge.textContent     = 'Нет данных';
            badge.className       = 'grade-badge badge-empty';
            fillEl.style.width    = '0%';
            if (aRow)     aRow.style.display    = 'none';
            if (eRow)     eRow.style.display    = 'none';
            if (bA)       bA.textContent        = '—';
            if (bE)       bE.textContent        = '—';
            if (bF)       bF.textContent        = '—';
            if (needBox)  needBox.style.display = 'none';
            if (hint)     hint.textContent      = '';
            if (shareBtn) shareBtn.style.display = 'none';
            return;
        }

        var annual  = qs.reduce(function (a, b) { return a + b; }, 0) / qs.length;
        var hasExam = state.exam !== null;
        var raw     = hasExam ? (annual * 0.7 + state.exam * 0.3) : annual;
        var finalG  = Math.max(2, Math.min(5, Math.round(raw)));
        var info    = getGradeLabel(finalG);

        resultEl.textContent = finalG;
        resultEl.className   = 'exam-result-grade ' + info.resCls;
        badge.textContent    = info.label;
        badge.className      = 'grade-badge ' + info.badgeCls;

        var pct = ((finalG - 2) / 3) * 100;
        fillEl.style.width      = Math.min(Math.max(pct, 0), 100) + '%';
        fillEl.style.background = info.fill;

        if (aRow) aRow.style.display = 'flex';
        if (aVal) aVal.textContent   = (annual % 1 === 0) ? annual : annual.toFixed(2);

        if (hasExam) {
            if (eRow) eRow.style.display = 'flex';
            if (eVal) eVal.textContent   = state.exam;
            if (bA)   bA.textContent     = (annual * 0.7).toFixed(2);
            if (bE)   bE.textContent     = (state.exam * 0.3).toFixed(2);
            if (bF)   bF.textContent     = raw.toFixed(2);
            if (hint) hint.textContent   = annual.toFixed(2) + ' × 0.7 + ' + state.exam + ' × 0.3 = ' + raw.toFixed(2) + ' → ' + finalG;
            if (needBox) needBox.style.display = 'none';
        } else {
            if (eRow)    eRow.style.display    = 'none';
            if (bA)      bA.textContent        = annual.toFixed(2);
            if (bE)      bE.textContent        = '?';
            if (bF)      bF.textContent        = raw.toFixed(2);
            if (hint)    hint.textContent      = 'Выбери оценку за экзамен для точного результата';
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
            try { localStorage.removeItem(SAVE_KEY); } catch (ex) {}
            calculate();
        });
    }

    function saveState() {
        try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (ex) {}
    }

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
                    if (p) highlightGrade(p, state[k]);
                }
            });
            if (state.exam !== null) {
                var ep = document.querySelector('[data-q="exam"]');
                if (ep) highlightGrade(ep, state.exam);
            }
        } catch (ex) {}
    }

    loadState();
    calculate();

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function () {
            navigator.serviceWorker.register('/sw.js')
                .then(function (reg) { console.log('SW registered', reg.scope); })
                .catch(function (err) { console.warn('SW registration failed', err); });
        });
    }
})();