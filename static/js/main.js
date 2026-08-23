let so = [];
let sors = [];
const SAVE_KEY = "bilimcalc_v1";
const i18n = window.__ || function (key, params) { return key; };
function getSiteBase() {
    return window.location.origin + "/";
}

function hapticReset() {
    if (navigator.vibrate) navigator.vibrate([12, 60, 12]);
}

function buildShareURL() {
    const params = new URLSearchParams();
    if (so.length) params.set("so", so.join(","));
    if (sors.length) params.set("sor", sors.map(p => p[0] + "-" + p[1]).join(","));
    const sochDialed = document.getElementById("sochDialed").value;
    const sochMax = document.getElementById("sochMax").value;
    if (sochMax && Number(sochMax) > 0) params.set("soch", sochDialed + "-" + sochMax);
    const qs = params.toString();
    return getSiteBase() + (qs ? "?" + qs : "");
}

function loadFromURL() {
    try {
        const params = new URLSearchParams(window.location.search);
        if (params.has("so")) {
            const vals = params.get("so").split(",").map(Number).filter(v => v >= 1 && v <= 10);
            if (vals.length) so = vals;
        }
        if (params.has("sor")) {
            const pairs = params.get("sor").split(",").map(s => s.split("-").map(Number));
            const valid = pairs.filter(p => p.length === 2 && p[1] > 0 && p[0] <= p[1]);
            if (valid.length) sors = valid;
        }
        if (params.has("soch")) {
            const parts = params.get("soch").split("-").map(Number);
            if (parts.length === 2 && parts[1] > 0 && parts[0] <= parts[1]) {
                document.getElementById("sochDialed").value = parts[0];
                document.getElementById("sochMax").value = parts[1];
            }
        }
        return params.has("so") || params.has("sor") || params.has("soch");
    } catch (e) { }
    return false;
}

function createChip(text, onDelete) {
    const el = document.createElement("div");
    el.className = "list-item";
    el.innerHTML = `<span>${text}</span>`;

    const btn = document.createElement("button");
    btn.className = "btn delete";
    btn.innerText = "×";
    btn.style.marginLeft = "6px";
    btn.addEventListener("click", onDelete);
    el.appendChild(btn);

    requestAnimationFrame(() => el.classList.add("enter"));
    return el;
}

function renderSO() {
    const container = document.getElementById("soList");
    const empty = document.getElementById("soEmpty");

    Array.from(container.children).forEach(c => {
        if (c.id !== "soEmpty") c.remove();
    });

    so.forEach((val, idx) => {
        const chip = createChip(val, async () => {
            chip.classList.add("removing");
            await new Promise(r => setTimeout(r, 260));
            if (idx !== -1) so.splice(idx, 1);
            saveState();
            renderSO();
            calculate();
            updateTrend();
        });
        container.insertBefore(chip, empty);
    });

    if (empty) empty.style.display = so.length ? "none" : "block";

    if (so.length >= 2) {
        showTrend(true);
        if (typeof Chart !== "undefined") updateTrend();
    } else {
        showTrend(false);
    }
}

function renderSORS() {
    const container = document.getElementById("sorList");
    const empty = document.getElementById("sorEmpty");

    Array.from(container.children).forEach(c => {
        if (c.id !== "sorEmpty") c.remove();
    });

    sors.forEach((pair, idx) => {
        const [d, m] = pair;
        const chip = createChip(`${d} / ${m}`, async () => {
            chip.classList.add("removing");
            await new Promise(r => setTimeout(r, 260));
            sors.splice(idx, 1);
            saveState();
            renderSORS();
            calculate();
        });
        container.insertBefore(chip, empty);
    });

    if (empty) empty.style.display = sors.length ? "none" : "block";
}


function saveState() {
    const sochDialed = document.getElementById("sochDialed").value;
    const sochMax = document.getElementById("sochMax").value;
    const soch = (sochMax && Number(sochMax) > 0)
        ? [Number(sochDialed || 0), Number(sochMax)]
        : null;
    try {
        localStorage.setItem(SAVE_KEY, JSON.stringify({ so, sors, soch }));
    } catch (e) {
    }
}

function loadState() {
    try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (!raw) return;
        const saved = JSON.parse(raw);
        if (Array.isArray(saved.so)) so = saved.so.map(Number);
        if (Array.isArray(saved.sors)) sors = saved.sors.map(p => [Number(p[0]), Number(p[1])]);
        if (Array.isArray(saved.soch)) {
            document.getElementById("sochDialed").value = saved.soch[0];
            document.getElementById("sochMax").value = saved.soch[1];
        }
    } catch (e) {
    }
}


function showInputError(anchorEl, message) {
    const card = anchorEl.closest(".card");
    if (!card) return;

    card.querySelectorAll(".input-error-banner").forEach(b => {
        clearTimeout(b._timer);
        b.classList.add("input-error-banner--hide");
        setTimeout(() => b.remove(), 250);
    });

    anchorEl.classList.add("shake");
    anchorEl.addEventListener("animationend", () => anchorEl.classList.remove("shake"), { once: true });

    const banner = document.createElement("div");
    banner.className = "input-error-banner";
    banner.style.cssText = "width:100%;box-sizing:border-box";
    banner.innerHTML = `<span class="input-error-icon">!</span><span>${message}</span>`;

    const row = anchorEl.closest(".so-row, .sor-row, .soch-row");
    if (row && row.parentNode) {
        row.parentNode.insertBefore(banner, row.nextSibling);
    } else {
        card.appendChild(banner);
    }

    banner._timer = setTimeout(() => {
        banner.classList.add("input-error-banner--hide");
        setTimeout(() => banner.remove(), 250);
    }, 3000);
}

function clearInputError(inputEl) {
    const card = inputEl.closest(".card");
    if (card) {
        card.querySelectorAll(".input-error-banner").forEach(b => {
            clearTimeout(b._timer);
            b.classList.add("input-error-banner--hide");
            setTimeout(() => b.remove(), 250);
        });
    }
    inputEl.style.borderColor = "";
}

function validateSoch() {
    const dialedEl = document.getElementById("sochDialed");
    const maxEl = document.getElementById("sochMax");
    const d = Number(dialedEl.value);
    const m = Number(maxEl.value);

    clearInputError(dialedEl);
    clearInputError(maxEl);

    if (!dialedEl.value || !maxEl.value) return true;
    if (!Number.isFinite(m) || m <= 0) return true;

    if (d > m) {
        dialedEl.style.borderColor = "var(--danger)";
        maxEl.style.borderColor = "var(--danger)";
        showInputError(dialedEl, i18n('so_error_max'));
        return false;
    }
    return true;
}


const addForm = document.getElementById("addForm");
if (addForm) {
    addForm.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!soInput) return;

        const raw = soInput.value.trim();
        const v = Number(raw);
        if (raw === "" || !Number.isFinite(v) || v < 1 || v > 10) {
            showInputError(this, i18n('so_error_range'));
            soInput.style.borderColor = "var(--danger)";
            return;
        }

        so.push(v);
        soInput.value = "";
        clearInputError(soInput);
        saveState();
        renderSO();
        calculate();
    });
}

const sorForm = document.getElementById("sorForm");
if (sorForm) {
    sorForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const sorDialedEl = document.getElementById("sorDialed");
        const sorMaxEl = document.getElementById("sorMax");
        if (!sorDialedEl || !sorMaxEl) return;

        const d = Number(sorDialedEl.value);
        const m = Number(sorMaxEl.value);

        clearInputError(sorDialedEl);
        clearInputError(sorMaxEl);

        if (!Number.isFinite(m) || m <= 0) return;

        if (d > m) {
            sorDialedEl.style.borderColor = "var(--danger)";
            sorMaxEl.style.borderColor = "var(--danger)";
            showInputError(this, i18n('so_error_max'));
            return;
        }

        sors.push([Number(d || 0), Number(m)]);
        sorDialedEl.value = "";
        sorMaxEl.value = "";
        saveState();
        renderSORS();
        calculate();
    });
}

const clearSoBtn = document.getElementById("clearSoBtn");
if (clearSoBtn) {
    clearSoBtn.addEventListener("click", () => {
        if (!so.length) return;
        so = [];
        saveState();
        renderSO();
        calculate();
    });
}

const clearSorsBtn = document.getElementById("clearSorsBtn");
if (clearSorsBtn) {
    clearSorsBtn.addEventListener("click", () => {
        sors = [];
        const sorDialedEl = document.getElementById("sorDialed");
        const sorMaxEl = document.getElementById("sorMax");
        if (sorDialedEl) {
            sorDialedEl.value = "";
            clearInputError(sorDialedEl);
        }
        if (sorMaxEl) {
            sorMaxEl.value = "";
            clearInputError(sorMaxEl);
        }
        saveState();
        renderSORS();
        calculate();
    });
}

const clearSochBtn = document.getElementById("clearSochBtn");
if (clearSochBtn) {
    clearSochBtn.addEventListener("click", () => {
        const dialedEl = document.getElementById("sochDialed");
        const maxEl = document.getElementById("sochMax");
        if (dialedEl) dialedEl.value = "";
        if (maxEl) maxEl.value = "";
        if (dialedEl) clearInputError(dialedEl);
        if (maxEl) clearInputError(maxEl);
        saveState();
        calculate();
    });
}

const resetAllBtn = document.getElementById("resetAllBtn");
if (resetAllBtn) {
    resetAllBtn.addEventListener("click", () => {
        if (!so.length && !sors.length &&
            !document.getElementById("sochDialed").value &&
            !document.getElementById("sochMax").value) return;

        hapticReset();

        so = [];
        sors = [];
        ["sochDialed", "sochMax", "sorDialed", "sorMax", "soInput"].forEach(id => {
            const el = document.getElementById(id);
            if (el) { el.value = ""; el.style.borderColor = ""; }
        });
        document.querySelectorAll(".input-error-banner").forEach(b => b.remove());
        saveState();
        renderSO();
        renderSORS();
        calculate();
    });
}


(function setupShare() {
    const shareBtn = document.getElementById("shareBtn");
    if (!shareBtn) return;

    function getShareText() {
        const result = document.getElementById("finalResult").textContent.trim();
        const badge = document.getElementById("gradeBadge").textContent.trim();
        return i18n('share_result', { result: result, badge: badge });
    }

    function openShareModal() {
        window.openShareModal({
            text: getShareText(),
            url: buildShareURL(),
            title: i18n('share_modal_title'),
            channels: ['tg', 'wa', 'vk', 'copy']
        });
    }

    shareBtn.addEventListener('click', async () => {
        const text = getShareText();
        const url = buildShareURL();
        const isDesktop = window.matchMedia('(min-width: 1024px)').matches;

        if (navigator.share && !isDesktop) {
            try {
                await navigator.share({ title: i18n('share_title_calc'), text, url });
                return;
            } catch (e) {
                if (e.name === 'AbortError') return;
            }
        }

        if (isDesktop) {
            navigator.clipboard.writeText(text + ' ' + url).then(() => {
                const orig = shareBtn.innerHTML;
                shareBtn.textContent = i18n('copied');
                setTimeout(() => { shareBtn.innerHTML = orig; }, 2000);
            }).catch(() => { });
        } else {
            openShareModal();
        }
    });
})();


function restrictToDigits(input, maxLen, maxVal, onFull) {
    input.addEventListener("keydown", function (e) {
        const nav = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "Enter", "Home", "End"];
        if (nav.includes(e.key) || e.ctrlKey || e.metaKey) return;
        if (!/^\d$/.test(e.key)) { e.preventDefault(); return; }
        if (this.value.length >= maxLen && this.selectionStart === this.selectionEnd) e.preventDefault();
    });
    input.addEventListener("input", function () {
        let v = this.value.replace(/\D/g, "").slice(0, maxLen);
        if (maxVal !== undefined && v !== "" && Number(v) > maxVal) v = String(maxVal);
        if (this.value !== v) this.value = v;
        if (onFull && v.length >= maxLen) onFull();
    });
}

const soInput = document.getElementById("soInput");
const sorDialedInput = document.getElementById("sorDialed");
const sorMaxInput = document.getElementById("sorMax");
const sochDialedInput = document.getElementById("sochDialed");
const sochMaxInput = document.getElementById("sochMax");

if (soInput) restrictToDigits(soInput, 2, 10);
if (sorDialedInput && sorMaxInput) restrictToDigits(sorDialedInput, 2, undefined, () => sorMaxInput.focus({ preventScroll: true }));
if (sorMaxInput) restrictToDigits(sorMaxInput, 2);
if (sochDialedInput && sochMaxInput) restrictToDigits(sochDialedInput, 2, undefined, () => sochMaxInput.focus({ preventScroll: true }));
if (sochMaxInput) restrictToDigits(sochMaxInput, 2);

sorMaxInput.addEventListener("keydown", function (e) {
    if (e.key === "Backspace" && !this.value) {
        sorDialedInput.focus({ preventScroll: true });
        sorDialedInput.setSelectionRange(sorDialedInput.value.length, sorDialedInput.value.length);
    }
});
sochMaxInput.addEventListener("keydown", function (e) {
    if (e.key === "Backspace" && !this.value) {
        sochDialedInput.focus({ preventScroll: true });
        sochDialedInput.setSelectionRange(sochDialedInput.value.length, sochDialedInput.value.length);
    }
});

function debounce(fn, ms) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms || 250); };
}

const debouncedCalculate = debounce(calculate, 250);

if (sochDialedInput) {
    sochDialedInput.addEventListener("input", () => { validateSoch(); saveState(); debouncedCalculate(); });
}
if (sochMaxInput) {
    sochMaxInput.addEventListener("input", () => { validateSoch(); saveState(); debouncedCalculate(); });
}


function computeParts(soArr, sorsArr, soch) {
    let total_so = null;
    if (soArr && soArr.length > 0) {
        const avg = soArr.reduce((a, b) => a + b, 0) / soArr.length;
        total_so = (avg / 10) * 25;
    }

    let total_sor = null;
    if (sorsArr && sorsArr.length > 0) {
        const pcts = sorsArr
            .filter(([, max]) => max > 0)
            .map(([d, m]) => (d / m) * 100);
        if (pcts.length > 0) {
            const avg = pcts.reduce((a, b) => a + b, 0) / pcts.length;
            total_sor = (avg / 100) * 25;
        }
    }

    let total_soch = null;
    if (soch && soch[1] > 0) {
        total_soch = (soch[0] / soch[1]) * 50;
    }

    return { total_so, total_sor, total_soch };
}

function computeFinalPct(total_so, total_sor, total_soch) {
    if (total_so !== null && total_sor !== null && total_soch !== null) {
        return Math.round((total_so + total_sor + total_soch) * 10000) / 10000;
    }
    if (total_so !== null && total_sor !== null) {
        return Math.round((total_so + total_sor) * 2 * 10000) / 10000;
    }
    if (total_so !== null) {
        return Math.round(total_so * 4 * 10000) / 10000;
    }
    return null;
}

function updateRoundingHint(value) {
    let hint = document.getElementById("roundingHint");
    if (!hint) {
        hint = document.createElement("div");
        hint.id = "roundingHint";
        hint.style.cssText = "font-size:11px;color:var(--muted);text-align:center;margin-top:4px;font-family:'Courier New',monospace;letter-spacing:0.2px;min-height:16px;";
        const badge = document.getElementById("gradeBadge");
        if (badge && badge.parentNode) badge.parentNode.insertBefore(hint, badge.nextSibling);
    }

    if (value === null) { hint.textContent = ""; return; }

    const frac = value - Math.floor(value);
    if (frac >= 0.5) {
        hint.textContent = value.toFixed(2) + "% → " + Math.ceil(value) + "%";
    } else {
        hint.textContent = "= " + value.toFixed(2) + "%";
    }
}

let pending = false;
let pendingAgain = false;

function calculate() {
    if (pending) { pendingAgain = true; return; }
    pending = true;
    pendingAgain = false;

    try {
        const sochDialed = Number(document.getElementById("sochDialed").value);
        const sochMax = Number(document.getElementById("sochMax").value);
        const soch = (Number.isFinite(sochMax) && sochMax > 0 && sochDialed <= sochMax)
            ? [Number(sochDialed || 0), Number(sochMax)]
            : null;

        const { total_so, total_sor, total_soch } = computeParts(so, sors, soch);
        const final_result = computeFinalPct(total_so, total_sor, total_soch);

        const finalEl = document.getElementById("finalResult");
        const fill = document.getElementById("progressFill");
        const badge = document.getElementById("gradeBadge");
        const shareBtn = document.getElementById("shareBtn");

        document.getElementById("breakSo").innerText = total_so !== null ? total_so.toFixed(2) + "%" : "—";
        document.getElementById("breakSors").innerText = total_sor !== null ? total_sor.toFixed(2) + "%" : "—";
        document.getElementById("breakSoch").innerText = total_soch !== null ? total_soch.toFixed(2) + "%" : "—";
        document.getElementById("breakSoDetails").innerText = "";
        document.getElementById("breakSorsDetails").innerText = "";
        document.getElementById("breakSochDetails").innerText = "";

        finalEl.classList.remove("result-danger", "result-warning", "result-good", "result-excellent");

        if (final_result !== null) {
            const pct = Number(final_result);
            const gradeCheck = Math.round(pct);

            const startVal = parseFloat(finalEl.innerText) || 0;
            const t0 = performance.now();
            const isWhole = Number.isInteger(pct);
            (function tick(now) {
                const progress = Math.min((now - t0) / 500, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                const cur = startVal + (pct - startVal) * eased;
                finalEl.innerText = (isWhole ? Math.round(cur) : cur.toFixed(2)) + "%";
                if (progress < 1) requestAnimationFrame(tick);
            })(t0);

            fill.style.width = Math.min(Math.max(pct, 0), 100) + "%";

            if (gradeCheck < 40) {
                finalEl.classList.add("result-danger");
                fill.style.background = "var(--danger)";
                chartColor = "#da3633";
                badge.textContent = i18n('grade_fail');
                badge.className = "grade-badge badge-danger";
            } else if (gradeCheck < 65) {
                finalEl.classList.add("result-warning");
                fill.style.background = "var(--warning)";
                chartColor = "#d29922";
                badge.textContent = i18n('grade_pass');
                badge.className = "grade-badge badge-warning";
            } else if (gradeCheck < 85) {
                finalEl.classList.add("result-good");
                fill.style.background = "var(--success)";
                chartColor = "#2ea043";
                badge.textContent = i18n('grade_good');
                badge.className = "grade-badge badge-good";
            } else {
                finalEl.classList.add("result-excellent");
                fill.style.background = "#166534";
                chartColor = "#166534";
                badge.textContent = i18n('grade_excellent');
                badge.className = "grade-badge badge-excellent";
            }

            updateRoundingHint(pct);

            const hintEl = document.getElementById("formulaHint");
            if (hintEl) {
                const parts = [];
                if (total_so !== null) parts.push(i18n('component_so') + ": " + total_so.toFixed(2));
                if (total_sor !== null) parts.push(i18n('component_sor') + ": " + total_sor.toFixed(2));
                if (total_soch !== null) parts.push(i18n('component_soch') + ": " + total_soch.toFixed(2));
                if (parts.length) {
                    const rawSum = (total_so || 0) + (total_sor || 0) + (total_soch || 0);
                    hintEl.textContent = parts.join(" + ") + " = " + rawSum.toFixed(2) + "%";
                } else {
                    hintEl.textContent = "";
                }
            }

            if (shareBtn) shareBtn.style.display = "flex";
            if (so.length >= 2) updateTrend();
        } else {
            finalEl.innerText = "—";
            fill.style.width = "0%";
            badge.textContent = i18n('result_no_data');
            badge.className = "grade-badge badge-empty";
            updateRoundingHint(null);
            if (shareBtn) shareBtn.style.display = "none";
            const hintEl = document.getElementById("formulaHint");
            if (hintEl) hintEl.textContent = "";
        }
    } catch (e) {
    } finally {
        pending = false;
        if (pendingAgain) calculate();
    }
}


let trendChart;
let chartColor = "#58a6ff";

function showTrend(visible) {
    const box = document.querySelector(".trend-box");
    const btn = document.getElementById("trendTriggerBtn");
    if (!box) return;
    box.classList.toggle("collapsed", !visible);
    if (btn && window.innerWidth > 600) {
        btn.classList.toggle("trend-btn--active", !!visible);
        btn.title = visible ? i18n('trend_analysis') + " (" + i18n('trend_close') + ")" : i18n('trend_analysis');
    }
    if (!visible && trendChart) {
        try { trendChart.destroy(); } catch (e) { }
        trendChart = null;
        const acc = document.getElementById("aiAccuracy");
        const label = document.getElementById("trendLabel");
        if (acc) acc.textContent = "--%";
        if (label) label.textContent = "—";
    }
}

function loadChartJS() {
    if (window.Chart) return Promise.resolve(window.Chart);
    if (window._chartLoadPromise) return window._chartLoadPromise;
    var src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.min.js';
    window._chartLoadPromise = new Promise(function (resolve, reject) {
        var s = document.createElement('script');
        s.src = src;
        s.async = true;
        s.crossOrigin = 'anonymous';
        s.onload = function () { resolve(window.Chart); };
        s.onerror = function (e) { reject(e); };
        document.head.appendChild(s);
        setTimeout(function () {
            if (window.Chart) resolve(window.Chart);
        }, 3500);
    });
    return window._chartLoadPromise;
}

function updateTrend() {
    if (so.length < 2) { showTrend(false); return; }
    showTrend(true);
    try {
        const data = calcTrendLine(so);
        if (typeof Chart === 'undefined') {
            loadChartJS().then(function () {
                drawTrend(data.scores, data.predictions, data.accuracy);
                if (trendChart && trendChart.resize) trendChart.resize();
            }).catch(function () { });
            return;
        }
        drawTrend(data.scores, data.predictions, data.accuracy);
        if (trendChart && trendChart.resize) trendChart.resize();
    } catch (e) {
        console.error("trend error", e);
    }
}

function calcTrendLine(scores) {
    const n = scores.length;
    const x = Array.from({ length: n }, (_, i) => i + 1);
    const xMean = x.reduce((a, b) => a + b, 0) / n;
    const yMean = scores.reduce((a, b) => a + b, 0) / n;

    let num = 0, den = 0;
    for (let i = 0; i < n; i++) {
        num += (x[i] - xMean) * (scores[i] - yMean);
        den += (x[i] - xMean) ** 2;
    }

    const slope = den === 0 ? 0 : num / den;
    const intercept = yMean - slope * xMean;
    const predictions = x.map(xi => xi * slope + intercept);

    const rmse = Math.sqrt(predictions.reduce((s, p, i) => s + (scores[i] - p) ** 2, 0) / n);
    const accuracy = Math.min(100, Math.max(0, 100 - (rmse / 10) * 100));

    return { scores, predictions, accuracy: Math.round(accuracy * 10) / 10, slope };
}

function hexToRgba(hex, a) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${a})`;
}

function _buildTrendChartConfig(ctx, scores, predictions, color, height) {
    const sg = ctx.createLinearGradient(0, 0, 0, height);
    sg.addColorStop(0, hexToRgba(color, 0.32));
    sg.addColorStop(0.6, hexToRgba(color, 0.06));
    sg.addColorStop(1, hexToRgba(color, 0.00));

    const pg = ctx.createLinearGradient(0, 0, 0, height);
    pg.addColorStop(0, "rgba(139,148,158,0.10)");
    pg.addColorStop(1, "rgba(139,148,158,0.00)");

    const labels = Array.from({ length: scores.length }, (_, i) => i18n('level_short') + (i + 1));

    return {
        type: "line",
        data: {
            labels,
            datasets: [
                {
                    data: scores.slice(),
                    borderColor: color,
                    backgroundColor: sg,
                    borderWidth: 2.5,
                    tension: 0.45,
                    fill: true,
                    pointBackgroundColor: color,
                    pointBorderColor: "#060a10",
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 6,
                },
                {
                    data: predictions.slice(),
                    borderColor: "rgba(139,148,158,0.38)",
                    backgroundColor: pg,
                    borderWidth: 1.5,
                    borderDash: [5, 4],
                    tension: 0.35,
                    fill: true,
                    pointRadius: 0,
                    pointHoverRadius: 0,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: { padding: { top: 8, right: 6, bottom: 2, left: 2 } },
            animation: { duration: 550, easing: "easeOutQuart" },
            events: [],
            plugins: {
                legend: { display: false, labels: { generateLabels: () => [] } },
                tooltip: { enabled: false },
            },
            scales: {
                x: {
                    grid: { color: "rgba(255,255,255,0.04)", drawBorder: false },
                    border: { display: false },
                    ticks: { color: "#6e7681", font: { size: 10 }, maxRotation: 0, maxTicksLimit: 6 },
                },
                y: {
                    min: 1, max: 10,
                    grid: { color: "rgba(255,255,255,0.05)", drawBorder: false },
                    border: { display: false },
                    ticks: { color: "#6e7681", font: { size: 10 }, stepSize: 3, maxTicksLimit: 4 },
                },
            },
        },
    };
}

function drawTrend(scores, predictions, accuracy) {
    const canvas = document.getElementById("trendChart");
    if (!canvas) return;

    if (typeof Chart === "undefined") {
        const container = document.getElementById("trendContainer");
        if (container && !container.querySelector(".chart-offline-msg")) {
            const msg = document.createElement("div");
            msg.className = "chart-offline-msg";
            msg.style.cssText = "display:flex;align-items:center;justify-content:center;height:100%;font-size:12px;color:#8b949e;text-align:center;line-height:1.5;padding:0 12px";
            msg.textContent = i18n('chart_offline');
            container.appendChild(msg);
        }
        document.getElementById("aiAccuracy").textContent = "--%";
        document.getElementById("trendLabel").textContent = i18n('result_no_data');
        return;
    }

    const ctx = canvas.getContext("2d");
    const color = chartColor;
    const h = canvas.offsetHeight || 145;

    if (trendChart) {
        const sg = ctx.createLinearGradient(0, 0, 0, h);
        sg.addColorStop(0, hexToRgba(color, 0.32));
        sg.addColorStop(0.6, hexToRgba(color, 0.06));
        sg.addColorStop(1, hexToRgba(color, 0.00));

        const labels = Array.from({ length: scores.length }, (_, i) => i18n('level_short') + (i + 1));
        trendChart.data.labels = labels;
        trendChart.data.datasets[0].data = scores.slice();
        trendChart.data.datasets[0].borderColor = color;
        trendChart.data.datasets[0].backgroundColor = sg;
        trendChart.data.datasets[0].pointBackgroundColor = color;
        trendChart.data.datasets[1].data = predictions.slice();
        trendChart.update("none");
    } else {
        trendChart = new Chart(ctx, _buildTrendChartConfig(ctx, scores, predictions, color, h));
    }

    document.getElementById("aiAccuracy").textContent = accuracy + "%";

    const trend = predictions[predictions.length - 1] - predictions[0];
    let trendText;
    if (trend > 0.6) trendText = "📈 " + i18n('trend_excellent');
    else if (trend > 0.2) trendText = "📈 " + i18n('trend_small_up');
    else if (trend < -0.6) trendText = "📉 " + i18n('trend_decreasing');
    else if (trend < -0.2) trendText = "📉 " + i18n('trend_light_decrease');
    else trendText = "📊 " + i18n('trend_stable');
    document.getElementById("trendLabel").textContent = trendText;
}


function showDetailedAnalysisModal() {
    if (document.getElementById("trendModal") || so.length < 2) return;

    const data = calcTrendLine(so);
    const { scores, predictions, accuracy, slope } = data;

    const min = Math.min(...scores);
    const max = Math.max(...scores);
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const vari = scores.reduce((s, v) => s + (v - avg) ** 2, 0) / scores.length;
    const std = Math.sqrt(vari);
    const next = parseFloat(Math.min(10, Math.max(1, predictions[predictions.length - 1] + (slope || 0))).toFixed(1));

    const trend = predictions[predictions.length - 1] - predictions[0];
    let trendEmoji, trendText, trendColor;
    if (trend > 0.6) { trendEmoji = "📈"; trendText = i18n('trend_label_excellent'); trendColor = "#22c55e"; }
    else if (trend > 0.2) { trendEmoji = "📈"; trendText = i18n('trend_label_good'); trendColor = "#3fb950"; }
    else if (trend < -0.6) { trendEmoji = "📉"; trendText = i18n('trend_label_down'); trendColor = "#ff7070"; }
    else if (trend < -0.2) { trendEmoji = "📉"; trendText = i18n('trend_label_stable'); trendColor = "#e3b341"; }
    else { trendEmoji = "📊"; trendText = i18n('trend_label_stable'); trendColor = "#58a6ff"; }

    let interpretation;
    if (trend > 0.6) interpretation = i18n('trend_interpretation_high', { next: next });
    else if (trend > 0.2) interpretation = i18n('trend_interpretation_medium', { next: next });
    else if (trend < -0.6) interpretation = i18n('trend_interpretation_low', { next: next });
    else if (trend < -0.2) interpretation = i18n('trend_interpretation_mild', { next: next });
    else interpretation = i18n('trend_interpretation_stable', { next: next });

    const modal = document.createElement("div");
    modal.id = "trendModal";
    modal.innerHTML = `<div class="tm-overlay"></div>
<div class="tm-box">
    <div class="tm-header">
        <div class="tm-title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            ${i18n('trend_analysis')}
        </div>
        <span class="tm-accuracy">${i18n('trend_accuracy')}: ${accuracy}%</span>
        <button class="tm-close" id="trendModalClose" aria-label="${i18n('close')}">✕</button>
    </div>
    <div class="tm-chart-wrap">
        <canvas id="trendModalChart" style="display:block;width:100%;height:100%"></canvas>
    </div>
    <div class="tm-trend-badge" style="color:${trendColor};border-color:${trendColor}44;background:${trendColor}18">
        ${trendEmoji} ${trendText}
    </div>
    <div class="tm-stats">
        <div class="tm-stat"><span class="tm-stat__label">${i18n('stats_average')}</span><span class="tm-stat__val">${avg.toFixed(1)}</span></div>
        <div class="tm-stat"><span class="tm-stat__label">${i18n('stats_min')}</span><span class="tm-stat__val">${min}</span></div>
        <div class="tm-stat"><span class="tm-stat__label">${i18n('stats_max')}</span><span class="tm-stat__val">${max}</span></div>
        <div class="tm-stat"><span class="tm-stat__label">${i18n('stats_std')}</span><span class="tm-stat__val">${std.toFixed(2)}</span></div>
        <div class="tm-stat"><span class="tm-stat__label">${i18n('stats_forecast')}</span><span class="tm-stat__val" style="color:${trendColor}">${next}</span></div>
        <div class="tm-stat"><span class="tm-stat__label">${i18n('stats_work_count')}</span><span class="tm-stat__val">${scores.length}</span></div>
    </div>
    <p class="tm-interpretation">${interpretation}</p>
</div>`;

    if (!document.getElementById("tmStyles")) {
        const s = document.createElement("style");
        s.id = "tmStyles";
        s.textContent = `
#trendModal{position:fixed;inset:0;z-index:5000;display:flex;align-items:center;justify-content:center;padding:20px}
.tm-overlay{position:absolute;inset:0;background:rgba(0,0,0,0.65);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);animation:tmOvIn 0.2s ease}
.tm-box{position:relative;z-index:1;background:#0d1117;border:1px solid rgba(255,255,255,0.08);border-radius:18px;padding:20px;width:100%;max-width:460px;animation:tmBxIn 0.28s cubic-bezier(.34,1.56,.64,1)}
[data-theme="light"] .tm-box{background:#fff;border-color:rgba(0,0,0,0.09)}
.tm-header{display:flex;align-items:center;gap:10px;margin-bottom:14px}
.tm-title{display:flex;align-items:center;gap:7px;font-size:14px;font-weight:700;color:#e6edf3;flex:1}
[data-theme="light"] .tm-title{color:#0f172a}
.tm-accuracy{font-size:11px;font-weight:700;color:var(--accent);background:rgba(88,166,255,0.1);border:1px solid rgba(88,166,255,0.2);border-radius:6px;padding:3px 8px;white-space:nowrap}
.tm-close{width:28px;height:28px;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:7px;color:#8b949e;cursor:pointer;font-size:13px;-webkit-tap-highlight-color:transparent;transition:background 0.15s;-webkit-appearance:none;appearance:none}
.tm-close:hover{background:rgba(255,255,255,0.1);color:#e6edf3}
[data-theme="light"] .tm-close{background:rgba(0,0,0,0.04);border-color:rgba(0,0,0,0.09);color:#64748b}
.tm-chart-wrap{height:170px;border-radius:10px;overflow:hidden;background:#070b11;border:1px solid rgba(255,255,255,0.05);margin-bottom:12px;position:relative}
[data-theme="light"] .tm-chart-wrap{background:#f8fafc;border-color:rgba(0,0,0,0.06)}
.tm-trend-badge{display:inline-flex;align-items:center;gap:7px;font-size:13px;font-weight:600;padding:7px 14px;border-radius:9px;border:1px solid;margin-bottom:12px}
.tm-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-bottom:12px}
.tm-stat{background:rgba(255,255,255,0.025);border:1px solid rgba(255,255,255,0.05);border-radius:9px;padding:8px 10px;display:flex;flex-direction:column;align-items:center;gap:3px}
[data-theme="light"] .tm-stat{background:rgba(0,0,0,0.02);border-color:rgba(0,0,0,0.06)}
.tm-stat__label{font-size:10px;font-weight:600;color:#6e7681;text-transform:uppercase;letter-spacing:0.4px}
.tm-stat__val{font-size:19px;font-weight:800;color:#e6edf3;line-height:1.1}
[data-theme="light"] .tm-stat__val{color:#0f172a}
.tm-interpretation{font-size:13px;color:#8b949e;line-height:1.65;text-align:center;margin:0}
[data-theme="light"] .tm-interpretation{color:#64748b}
@keyframes tmOvIn{from{opacity:0}to{opacity:1}}
@keyframes tmBxIn{from{opacity:0;transform:scale(0.93) translateY(12px)}to{opacity:1;transform:scale(1) translateY(0)}}`;
        document.head.appendChild(s);
    }

    document.body.appendChild(modal);

    const mc = document.getElementById("trendModalChart");
    if (mc) {
        (function renderModalChart() {
            function create() {
                const ctx2 = mc.getContext("2d");
                const clr = chartColor;
                const h2 = 170;
                const cfg = _buildTrendChartConfig(ctx2, scores, predictions, clr, h2);
                cfg.options.layout.padding = { top: 10, right: 10, bottom: 4, left: 4 };
                cfg.options.animation.duration = 500;
                try { new Chart(ctx2, cfg); } catch (e) { console.warn('chart create failed', e); }
            }
            if (typeof Chart === 'undefined') {
                loadChartJS().then(create).catch(function () { });
            } else create();
        })();
    }

    function closeModal() {
        const box = modal.querySelector(".tm-box");
        const ov = modal.querySelector(".tm-overlay");
        box.style.cssText += ";transition:transform 0.18s ease,opacity 0.18s ease;transform:scale(0.95);opacity:0";
        ov.style.cssText += ";transition:opacity 0.18s ease;opacity:0";
        setTimeout(() => modal.remove(), 200);
    }

    document.getElementById("trendModalClose").addEventListener("click", closeModal);
    modal.querySelector(".tm-overlay").addEventListener("click", closeModal);
    document.addEventListener("keydown", function kh(e) {
        if (e.key === "Escape") { closeModal(); document.removeEventListener("keydown", kh); }
    });
}

(function setupTrendDesktop() {
    const btn = document.getElementById("trendTriggerBtn");
    if (!btn) return;
    btn.addEventListener("click", function () {
        if (window.innerWidth <= 600) return;
        showDetailedAnalysisModal();
    });
})();


document.querySelectorAll(".faq-q").forEach(btn => {
    btn.addEventListener("click", function () {
        const item = this.closest(".faq-item");
        const isOpen = item.classList.contains("open");
        document.querySelectorAll(".faq-item.open").forEach(i => {
            i.classList.remove("open");
            i.querySelector(".faq-q").setAttribute("aria-expanded", "false");
        });
        if (!isOpen) {
            item.classList.add("open");
            this.setAttribute("aria-expanded", "true");
        }
    });
});


(function () {
    const banner = document.getElementById("offlineBanner");
    if (!banner) return;
    if (!navigator.onLine) banner.style.display = "block";
    window.addEventListener("offline", () => banner.style.display = "block");
    window.addEventListener("online", () => banner.style.display = "none");
})();


if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js");
    });
}


(function init() {
    const loadedFromURL = loadFromURL();
    if (!loadedFromURL) {
        loadState();
    }
    renderSO();
    renderSORS();
    setTimeout(() => {
        calculate();
        if (so.length >= 2) updateTrend();
        else showTrend(false);
    }, 120);
    document.getElementById("year").textContent = new Date().getFullYear();
})();