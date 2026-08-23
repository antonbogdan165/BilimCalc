(function () {
    'use strict';

    ThemeToggle.init();

    var grantSplash = document.getElementById('grantSplash');
    if (grantSplash) setTimeout(function () { grantSplash.classList.add('hidden'); }, 800);

    var SAVE_KEY = 'bilimgrant_v1';
    var MIN_SCORE = 50;
    var MAX_SCORE = 140;

    var PROGRAMS = {
        it: { nameKey: 'grant_option_it', threshold: 50, passMin: 95, passMax: 105, ruralDrop: 10 },
        pedagogy: { nameKey: 'grant_option_pedagogy', threshold: 75, passMin: 90, passMax: 105, ruralDrop: 10 },
        medicine: { nameKey: 'grant_option_medicine', threshold: 70, passMin: 105, passMax: 115, ruralDrop: 12 },
        law: { nameKey: 'grant_option_law', threshold: 75, passMin: 110, passMax: 118, ruralDrop: 10 },
        agri: { nameKey: 'grant_option_agri', threshold: 50, passMin: 60, passMax: 65, ruralDrop: 8 }
    };

    var UNI_TYPES = {
        standard: { minScore: 50 },
        national: { minScore: 65 }
    };

    var elements = {
        major: document.getElementById('grantMajor'),
        uniType: document.getElementById('grantUniType'),
        scoreInput: document.getElementById('grantScore'),
        slider: document.getElementById('grantScoreSlider'),
        rural: document.getElementById('grantRural'),
        resetBtn: document.getElementById('grantResetBtn'),
        probValue: document.getElementById('grantProbValue'),
        statusLabel: document.getElementById('grantStatusLabel'),
        passRange: document.getElementById('grantPassRange'),
        thresholdInfo: document.getElementById('grantThresholdInfo'),
        scoreDelta: document.getElementById('grantScoreDelta'),
        shareBtn: document.getElementById('grantShareBtn'),
        gauge: document.getElementById('grantGauge'),
        year: document.getElementById('yearGrant'),
        offlineBanner: document.getElementById('offlineBanner')
    };

    var state = {
        major: 'it',
        uniType: 'standard',
        score: 66,
        rural: false
    };

    var translate = typeof window.__ === 'function' ? window.__.bind(window) : function (key) { return key; };

    function clampScore(value) {
        return Math.max(MIN_SCORE, Math.min(MAX_SCORE, value));
    }

    function setScore(value, syncInputs) {
        state.score = clampScore(value);
        if (elements.slider) elements.slider.value = state.score;
        if (syncInputs && elements.scoreInput) elements.scoreInput.value = state.score;
        saveState();
    }

    function updateUiInputs() {
        if (elements.slider) elements.slider.value = state.score;
        if (elements.scoreInput) elements.scoreInput.value = state.score;
        if (elements.major) elements.major.value = state.major;
        if (elements.uniType) elements.uniType.value = state.uniType;
        if (elements.rural) elements.rural.checked = state.rural;
    }

    function getProgram() {
        return PROGRAMS[state.major] || PROGRAMS.it;
    }

    function getUniversityType() {
        return UNI_TYPES[state.uniType] || UNI_TYPES.standard;
    }

    function estimateProbability(score, passMin, passMax) {
        var mid = (passMin + passMax) / 2;
        var curve = 0.09;
        var probability = 100 / (1 + Math.exp(-curve * (score - mid)));
        return Math.round(Math.max(1, Math.min(95, probability)) * 10) / 10;
    }

    function getStatusLabel(probability, blocked, blockedReason) {
        if (blocked) {
            return { label: blockedReason, cls: 'gs-blocked' };
        }

        if (probability >= 76) return { label: translate('grant_status_high'), cls: 'gs-high' };
        if (probability >= 56) return { label: translate('grant_status_good'), cls: 'gs-good' };
        if (probability >= 40) return { label: translate('grant_status_fair'), cls: 'gs-fair' };
        if (probability >= 20) return { label: translate('grant_status_low'), cls: 'gs-low' };
        return { label: translate('grant_status_minimal'), cls: 'gs-minimal' };
    }

    function drawGauge(probability, blocked) {
        if (!elements.gauge) return;
        var ctx = elements.gauge.getContext('2d');
        if (!ctx) return;

        var width = elements.gauge.width;
        var height = elements.gauge.height;
        var centerX = width / 2;
        var centerY = height - 8;
        var radius = Math.min(width, height * 2) / 2 - 12;
        var startAngle = Math.PI;
        var endAngle = 2 * Math.PI;

        ctx.clearRect(0, 0, width, height);

        var segments = [
            { from: 0, to: 0.20, color: '#ef4444' },
            { from: 0.20, to: 0.40, color: '#f87171' },
            { from: 0.40, to: 0.56, color: '#f59e0b' },
            { from: 0.56, to: 0.76, color: '#4ade80' },
            { from: 0.76, to: 1, color: '#22c55e' }
        ];

        ctx.lineWidth = 18;
        ctx.lineCap = 'butt';

        segments.forEach(function (segment) {
            ctx.beginPath();
            ctx.strokeStyle = segment.color;
            ctx.arc(
                centerX,
                centerY,
                radius,
                startAngle + (endAngle - startAngle) * segment.from,
                startAngle + (endAngle - startAngle) * segment.to
            );
            ctx.stroke();
        });

        var needleRatio = blocked ? 0.05 : probability / 100;
        var needleAngle = startAngle + needleRatio * (endAngle - startAngle);
        var needleX = centerX + (radius - 6) * Math.cos(needleAngle);
        var needleY = centerY + (radius - 6) * Math.sin(needleAngle);

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(needleX, needleY);
        ctx.strokeStyle = '#e6edf3';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(centerX, centerY, 7, 0, 2 * Math.PI);
        ctx.fillStyle = '#e6edf3';
        ctx.fill();
    }

    function renderResult() {
        var program = getProgram();
        var university = getUniversityType();
        var passMin = program.passMin;
        var passMax = program.passMax;

        if (state.rural) {
            passMin -= program.ruralDrop;
            passMax -= program.ruralDrop;
        }

        var blocked = false;
        var blockedReason = '';

        if (state.score < program.threshold) {
            blocked = true;
            blockedReason = translate('grant_block_threshold', { threshold: program.threshold });
        } else if (state.score < university.minScore) {
            blocked = true;
            blockedReason = translate(
                state.uniType === 'national' ? 'grant_block_uni_national' : 'grant_block_uni_standard',
                { minScore: university.minScore }
            );
        }

        var probability = blocked ? 0 : estimateProbability(state.score, passMin, passMax);
        var status = getStatusLabel(probability, blocked, blockedReason);

        if (elements.probValue) {
            elements.probValue.textContent = blocked ? '0%' : probability.toFixed(1) + '%';
        }

        if (elements.statusLabel) {
            elements.statusLabel.textContent = status.label;
            elements.statusLabel.className = 'grant-status ' + status.cls;
        }

        if (elements.passRange) {
            var passText = passMin + ' – ' + passMax;
            if (state.rural) passText += translate('grant_range_rural_suffix');
            elements.passRange.textContent = passText;
        }

        if (elements.thresholdInfo) {
            elements.thresholdInfo.textContent = translate('grant_thresholds_text', {
                threshold: program.threshold,
                minScore: university.minScore
            });
        }

        if (elements.scoreDelta) {
            if (blocked) {
                elements.scoreDelta.textContent = '—';
                elements.scoreDelta.className = 'grant-delta grant-delta--neutral';
                elements.scoreDelta.style.display = '';
            } else {
                if (state.score > passMax) {
                    elements.scoreDelta.textContent = translate('grant_delta_above', { diff: (state.score - passMax).toFixed(0) });
                    elements.scoreDelta.className = 'grant-delta grant-delta--pos';
                } else if (state.score >= passMin) {
                    elements.scoreDelta.textContent = translate('grant_delta_from_lower', { diff: (state.score - passMin).toFixed(0) });
                    elements.scoreDelta.className = 'grant-delta grant-delta--pos';
                } else {
                    elements.scoreDelta.textContent = translate('grant_delta_to_lower', { diff: Math.abs(state.score - passMin).toFixed(0) });
                    elements.scoreDelta.className = 'grant-delta grant-delta--neg';
                }
                elements.scoreDelta.style.display = '';
            }
        }

        if (elements.shareBtn) {
            elements.shareBtn.style.display = blocked ? 'none' : 'flex';
        }

        drawGauge(probability, blocked);
    }

    function getShareText() {
        var program = getProgram();
        var probabilityText = elements.probValue ? elements.probValue.textContent : '';
        var major = translate(program.nameKey);
        return translate('share_result_grant', { major: major, prob: probabilityText });
    }

    function getSharePageUrl() {
        return window.location.origin + window.location.pathname;
    }

    function handleShare() {
        if (!elements.shareBtn) return;

        var shareTextNode = elements.shareBtn.querySelector('.grant-share-btn__text');
        if (!shareTextNode) shareTextNode = elements.shareBtn;

        elements.shareBtn.addEventListener('click', function () {
            var text = getShareText();
            var url = getSharePageUrl();
            if (navigator.share && !window.matchMedia('(min-width: 1024px)').matches) {
                navigator.share({ title: translate('share_title_grant'), text: text, url: url }).catch(function () { });
                return;
            }

            navigator.clipboard.writeText(text + ' ' + url).then(function () {
                var originalText = shareTextNode.textContent;
                shareTextNode.textContent = translate('copied');
                setTimeout(function () {
                    shareTextNode.textContent = originalText;
                }, 2000);
            }).catch(function () { });
        });
    }

    function bindEvents() {
        if (elements.major) {
            elements.major.addEventListener('change', function () {
                state.major = elements.major.value;
                saveState();
                renderResult();
            });
        }

        if (elements.uniType) {
            elements.uniType.addEventListener('change', function () {
                state.uniType = elements.uniType.value;
                saveState();
                renderResult();
            });
        }

        if (elements.scoreInput) {
            elements.scoreInput.addEventListener('input', function () {
                var raw = Number.parseInt(elements.scoreInput.value, 10);
                if (Number.isNaN(raw)) return;
                setScore(raw, false);
                renderResult();
            });

            elements.scoreInput.addEventListener('blur', function () {
                var raw = Number.parseInt(elements.scoreInput.value, 10);
                setScore(Number.isNaN(raw) ? MIN_SCORE : raw, true);
                renderResult();
            });
        }

        if (elements.slider) {
            elements.slider.addEventListener('input', function () {
                var raw = Number.parseInt(elements.slider.value, 10);
                if (Number.isNaN(raw)) return;
                setScore(raw, true);
                renderResult();
            });
        }

        if (elements.rural) {
            elements.rural.addEventListener('change', function () {
                state.rural = elements.rural.checked;
                saveState();
                renderResult();
            });
        }

        if (elements.resetBtn) {
            elements.resetBtn.addEventListener('click', function () {
                state = {
                    major: 'it',
                    uniType: 'standard',
                    score: 66,
                    rural: false
                };
                updateUiInputs();
                saveState();
                renderResult();
                try { localStorage.removeItem(SAVE_KEY); } catch (ex) { }
            });
        }
    }

    function saveState() {
        try {
            localStorage.setItem(SAVE_KEY, JSON.stringify(state));
        } catch (ex) { }
    }

    function loadState() {
        try {
            var raw = localStorage.getItem(SAVE_KEY);
            if (!raw) return;
            var saved = JSON.parse(raw);
            if (saved.major && PROGRAMS[saved.major]) state.major = saved.major;
            if (saved.uniType && UNI_TYPES[saved.uniType]) state.uniType = saved.uniType;
            if (saved.score !== undefined) state.score = clampScore(saved.score);
            if (saved.rural !== undefined) state.rural = Boolean(saved.rural);
            updateUiInputs();
        } catch (ex) { }
    }

    function initUi() {
        if (elements.year) {
            elements.year.textContent = new Date().getFullYear();
        }

        if (elements.offlineBanner) {
            elements.offlineBanner.style.display = navigator.onLine ? 'none' : 'block';
            window.addEventListener('offline', function () { elements.offlineBanner.style.display = 'block'; });
            window.addEventListener('online', function () { elements.offlineBanner.style.display = 'none'; });
        }
    }

    function registerServiceWorker() {
        if (!('serviceWorker' in navigator)) return;
        window.addEventListener('load', function () {
            navigator.serviceWorker.register('/sw.js').catch(function () { });
        });
    }

    initUi();
    bindEvents();
    loadState();
    renderResult();
    handleShare();
    registerServiceWorker();
})();