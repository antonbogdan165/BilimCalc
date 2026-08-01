(function () {
    'use strict';

    ThemeToggle.init();

    var yearEl = document.getElementById('yearGrant');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    var splash = document.getElementById('grantSplash');
    if (splash) setTimeout(function () { splash.classList.add('hidden'); }, 800);

    var ob = document.getElementById('offlineBanner');
    if (ob) {
        if (!navigator.onLine) ob.style.display = 'block';
        window.addEventListener('offline', function () { ob.style.display = 'block'; });
        window.addEventListener('online', function () { ob.style.display = 'none'; });
    }

    var PROGRAMS = {
        it: { name: 'Информационные технологии', threshold: 50, passMin: 95, passMax: 105, ruralDrop: 10 },
        pedagogy: { name: 'Педагогические науки', threshold: 75, passMin: 90, passMax: 105, ruralDrop: 10 },
        medicine: { name: 'Медицина и здравоохранение', threshold: 70, passMin: 105, passMax: 115, ruralDrop: 12 },
        law: { name: 'Право', threshold: 75, passMin: 110, passMax: 118, ruralDrop: 10 },
        agri: { name: 'Сельское хозяйство и ветеринария', threshold: 50, passMin: 60, passMax: 65, ruralDrop: 8 }
    };

    var UNI_TYPES = {
        standard: { minScore: 50, label: 'Стандартный (прочие вузы)' },
        national: { minScore: 65, label: 'Национальный вуз' }
    };

    var SAVE_KEY = 'bilimgrant_v1';
    var state = { major: 'it', uniType: 'standard', score: 66, rural: false };

    var majorEl = document.getElementById('grantMajor');
    var uniEl = document.getElementById('grantUniType');
    var scoreEl = document.getElementById('grantScore');
    var sliderEl = document.getElementById('grantScoreSlider');
    var ruralEl = document.getElementById('grantRural');
    var resetBtn = document.getElementById('grantResetBtn');

    function clampScore(val) {
        return Math.max(50, Math.min(140, val));
    }

    function applyScore(val, syncInputField) {
        state.score = val;
        if (sliderEl) sliderEl.value = val;
        if (syncInputField && scoreEl) scoreEl.value = val;
        saveState();
        calculate();
    }

    if (majorEl) majorEl.addEventListener('change', function () { state.major = majorEl.value; saveState(); calculate(); });
    if (uniEl) uniEl.addEventListener('change', function () { state.uniType = uniEl.value; saveState(); calculate(); });

    if (scoreEl) {
        scoreEl.addEventListener('input', function () {
            var raw = parseInt(scoreEl.value, 10);
            if (isNaN(raw)) return;
            applyScore(clampScore(raw), false);
        });
        scoreEl.addEventListener('blur', function () {
            var raw = parseInt(scoreEl.value, 10);
            applyScore(clampScore(isNaN(raw) ? 50 : raw), true);
        });
    }

    if (sliderEl) sliderEl.addEventListener('input', function () {
        applyScore(clampScore(parseInt(sliderEl.value, 10)), true);
    });

    if (ruralEl) ruralEl.addEventListener('change', function () { state.rural = ruralEl.checked; saveState(); calculate(); });

    function estimateProbability(score, passMin, passMax) {
        var mid = (passMin + passMax) / 2;
        var k = 0.09;
        var prob = 100 / (1 + Math.exp(-k * (score - mid)));
        return Math.round(Math.max(1, Math.min(95, prob)) * 10) / 10;
    }

    function getStatusLabel(prob, blocked, reason) {
        if (blocked) return { label: reason, cls: 'gs-blocked' };
        if (prob >= 76) return { label: 'Высокие шансы', cls: 'gs-high' };
        if (prob >= 56) return { label: 'Хорошие шансы', cls: 'gs-good' };
        if (prob >= 40) return { label: 'Средние шансы', cls: 'gs-fair' };
        if (prob >= 20) return { label: 'Низкие шансы', cls: 'gs-low' };
        return { label: 'Минимальные шансы', cls: 'gs-minimal' };
    }

    function drawGauge(prob, blocked) {
        var canvas = document.getElementById('grantGauge');
        if (!canvas) return;
        var ctx = canvas.getContext('2d');
        var w = canvas.width;
        var h = canvas.height;
        var cx = w / 2;
        var cy = h - 8;
        var r = Math.min(w, h * 2) / 2 - 12;

        ctx.clearRect(0, 0, w, h);

        var start = Math.PI;
        var end = 2 * Math.PI;
        var zones = [
            { from: 0, to: 0.20, color: '#ef4444' },
            { from: 0.20, to: 0.40, color: '#f87171' },
            { from: 0.40, to: 0.56, color: '#f59e0b' },
            { from: 0.56, to: 0.76, color: '#4ade80' },
            { from: 0.76, to: 1, color: '#22c55e' }
        ];

        ctx.lineWidth = 18;
        ctx.lineCap = 'butt';
        zones.forEach(function (z) {
            ctx.beginPath();
            ctx.strokeStyle = z.color;
            ctx.arc(cx, cy, r, start + (end - start) * z.from, start + (end - start) * z.to);
            ctx.stroke();
        });

        var needleAngle = blocked ? start + 0.05 * (end - start) : start + (prob / 100) * (end - start);
        var nx = cx + (r - 6) * Math.cos(needleAngle);
        var ny = cy + (r - 6) * Math.sin(needleAngle);

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(nx, ny);
        ctx.strokeStyle = '#e6edf3';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(cx, cy, 7, 0, 2 * Math.PI);
        ctx.fillStyle = '#e6edf3';
        ctx.fill();
    }

    function calculate() {
        var prog = PROGRAMS[state.major];
        var uni = UNI_TYPES[state.uniType];
        var score = state.score;

        var passMin = prog.passMin;
        var passMax = prog.passMax;
        if (state.rural) {
            passMin -= prog.ruralDrop;
            passMax -= prog.ruralDrop;
        }

        var blocked = false;
        var blockReason = '';

        if (score < prog.threshold) {
            blocked = true;
            blockReason = 'Ниже порога участия (' + prog.threshold + ')';
        } else if (score < uni.minScore) {
            blocked = true;
            blockReason = 'Ниже минимума для ' + (state.uniType === 'national' ? 'нац. вуза' : 'вуза') + ' (' + uni.minScore + ')';
        }

        var prob = blocked ? 0 : estimateProbability(score, passMin, passMax);
        var status = getStatusLabel(prob, blocked, blockReason);

        var probEl = document.getElementById('grantProbValue');
        var statusEl = document.getElementById('grantStatusLabel');
        var rangeEl = document.getElementById('grantPassRange');
        var threshEl = document.getElementById('grantThresholdInfo');
        var shareBtn = document.getElementById('grantShareBtn');
        var deltaEl = document.getElementById('grantScoreDelta');

        if (probEl) probEl.textContent = blocked ? '0%' : prob.toFixed(1) + '%';
        if (statusEl) {
            statusEl.textContent = status.label;
            statusEl.className = 'grant-status ' + status.cls;
        }
        if (rangeEl) rangeEl.textContent = passMin + ' – ' + passMax + (state.rural ? ' (сельская квота)' : '');
        if (threshEl) threshEl.textContent = 'Порог участия: ' + prog.threshold + ' · Мин. для вуза: ' + uni.minScore;

        if (deltaEl) {
            if (blocked) {
                deltaEl.textContent = '—';
                deltaEl.className = 'grant-delta grant-delta--neutral';
            } else if (score > passMax) {
                var above = score - passMax;
                deltaEl.textContent = '+' + above.toFixed(0) + ' выше прогноза';
                deltaEl.className = 'grant-delta grant-delta--pos';
            } else if (score >= passMin) {
                var inRange = score - passMin;
                deltaEl.textContent = '+' + inRange.toFixed(0) + ' от нижней границы';
                deltaEl.className = 'grant-delta grant-delta--pos';
            } else {
                var below = score - passMin;
                deltaEl.textContent = below.toFixed(0) + ' до нижней границы';
                deltaEl.className = 'grant-delta grant-delta--neg';
            }
        }

        if (shareBtn) shareBtn.style.display = blocked ? 'none' : 'flex';

        drawGauge(prob, blocked);
    }

    function getShareText() {
        var prog = PROGRAMS[state.major];
        var probEl = document.getElementById('grantProbValue');
        var prob = probEl ? probEl.textContent : '';
        return 'Мои шансы на грант (' + prog.name + '): ' + prob + '. Проверь свои на BilimGrant!';
    }

    function getSharePageUrl() {
        return window.location.origin + window.location.pathname;
    }

    var shareBtnEl = document.getElementById('grantShareBtn');
    if (shareBtnEl) {
        shareBtnEl.addEventListener('click', function () {
            var text = getShareText();
            var url = getSharePageUrl();
            if (navigator.share && !window.matchMedia('(min-width: 1024px)').matches) {
                navigator.share({ title: 'BilimGrant — шансы на грант', text: text, url: url }).catch(function () { });
            } else {
                navigator.clipboard.writeText(text + ' ' + url).then(function () {
                    var orig = shareBtnEl.innerHTML;
                    shareBtnEl.textContent = '✓ Скопировано!';
                    setTimeout(function () { shareBtnEl.innerHTML = orig; }, 2000);
                }).catch(function () { });
            }
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', function () {
            state = { major: 'it', uniType: 'standard', score: 66, rural: false };
            if (majorEl) majorEl.value = state.major;
            if (uniEl) uniEl.value = state.uniType;
            if (ruralEl) ruralEl.checked = false;
            applyScore(66, true);
            try { localStorage.removeItem(SAVE_KEY); } catch (ex) { }
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
            if (s.major) state.major = s.major;
            if (s.uniType) state.uniType = s.uniType;
            if (s.score !== undefined) state.score = clampScore(s.score);
            if (s.rural !== undefined) state.rural = s.rural;
            if (majorEl) majorEl.value = state.major;
            if (uniEl) uniEl.value = state.uniType;
            if (ruralEl) ruralEl.checked = state.rural;
            applyScore(state.score, true);
        } catch (ex) { }
    }

    loadState();
    calculate();

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function () {
            navigator.serviceWorker.register('/sw.js').catch(function () { });
        });
    }
})();