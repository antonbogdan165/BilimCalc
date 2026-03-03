/* ---------- state ---------- */
let so = [];
let sors = [];
const LOCAL_KEY = "grade_calculator_v1";

/* ---------- helpers ---------- */
function makeListItem(text, onDelete) {
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

/* ---------- empty state helpers ---------- */
function updateEmptyState(listId, emptyId, items) {
    const list  = document.getElementById(listId);
    const empty = document.getElementById(emptyId);
    if (!list || !empty) return;
    // показываем placeholder только когда список пуст
    if (items.length === 0) {
        if (!document.getElementById(emptyId)) list.appendChild(empty);
        empty.style.display = "block";
    } else {
        empty.style.display = "none";
    }
}

/* ---------- renderers ---------- */
function renderSO() {
    const container = document.getElementById("soList");
    const empty     = document.getElementById("soEmpty");
    // убираем всё кроме placeholder
    Array.from(container.children).forEach(c => { if (c.id !== "soEmpty") c.remove(); });

    so.forEach((val) => {
        const item = makeListItem(val, async () => {
            item.classList.add("removing");
            await new Promise(r => setTimeout(r, 260));
            const idx = so.lastIndexOf(val);
            if (idx !== -1) so.splice(idx, 1);
            saveState();
            renderSO();
            calculate();
            updateTrend();
        });
        container.insertBefore(item, empty);
    });

    if (empty) empty.style.display = so.length ? "none" : "block";

    if (so.length >= 2) {
        toggleTrendVisibility(true);
        if (typeof Chart !== "undefined") updateTrend();
    } else {
        toggleTrendVisibility(false);
    }
}

function renderSORS() {
    const container = document.getElementById("sorList");
    const empty     = document.getElementById("sorEmpty");
    Array.from(container.children).forEach(c => { if (c.id !== "sorEmpty") c.remove(); });

    sors.forEach((pair, idx) => {
        const [d, m] = pair;
        const item = makeListItem(`${d} / ${m}`, async () => {
            item.classList.add("removing");
            await new Promise(r => setTimeout(r, 260));
            sors.splice(idx, 1);
            saveState();
            renderSORS();
            calculate();
        });
        container.insertBefore(item, empty);
    });

    if (empty) empty.style.display = sors.length ? "none" : "block";
}

/* ---------- persistence ---------- */
function saveState() {
    const sochDialed = document.getElementById("sochDialed").value;
    const sochMax    = document.getElementById("sochMax").value;
    const soch = (sochMax && Number(sochMax) > 0)
        ? [Number(sochDialed || 0), Number(sochMax)]
        : null;
    try {
        localStorage.setItem(LOCAL_KEY, JSON.stringify({ so, sors, soch }));
    } catch (e) {
        console.warn("localStorage save failed", e);
    }
}

function loadState() {
    try {
        const raw = localStorage.getItem(LOCAL_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.so))   so   = parsed.so.map(Number);
        if (Array.isArray(parsed.sors)) sors = parsed.sors.map(p => [Number(p[0]), Number(p[1])]);
        if (Array.isArray(parsed.soch)) {
            document.getElementById("sochDialed").value = parsed.soch[0];
            document.getElementById("sochMax").value    = parsed.soch[1];
        }
    } catch (e) {
        console.warn("localStorage load failed", e);
    }
}

/* ---------- input validation ---------- */
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
    } else if (anchorEl.parentNode) {
        anchorEl.parentNode.insertBefore(banner, anchorEl.nextSibling);
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
    const maxEl    = document.getElementById("sochMax");
    const d = Number(dialedEl.value);
    const m = Number(maxEl.value);

    clearInputError(dialedEl);
    clearInputError(maxEl);

    if (!dialedEl.value || !maxEl.value) return true;
    if (!Number.isFinite(m) || m <= 0)   return true;

    if (d > m) {
        dialedEl.style.borderColor = "var(--danger)";
        maxEl.style.borderColor    = "var(--danger)";
        showInputError(dialedEl, "Максимум не может быть меньше набранного");
        return false;
    }
    return true;
}

/* ---------- event listeners ---------- */
document.getElementById("addForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const raw = soInput.value.trim();
    const v   = Number(raw);
    if (raw === "" || !Number.isFinite(v) || v < 1 || v > 10) {
        showInputError(this, "Введите значение от 1 до 10");
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

document.getElementById("sorForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const sorDialedEl = document.getElementById("sorDialed");
    const sorMaxEl    = document.getElementById("sorMax");
    const d = Number(sorDialedEl.value);
    const m = Number(sorMaxEl.value);

    clearInputError(sorDialedEl);
    clearInputError(sorMaxEl);

    if (!Number.isFinite(m) || m <= 0) return;

    if (d > m) {
        sorDialedEl.style.borderColor = "var(--danger)";
        sorMaxEl.style.borderColor    = "var(--danger)";
        showInputError(this, "Максимум не может быть меньше набранного");
        return;
    }

    sors.push([Number(d || 0), Number(m)]);
    sorDialedEl.value = "";
    sorMaxEl.value    = "";
    saveState();
    renderSORS();
    calculate();
});

document.getElementById("clearSoBtn").addEventListener("click", () => {
    if (!so.length) return;
    so = [];
    saveState();
    renderSO();
    calculate();
});

document.getElementById("clearSorsBtn").addEventListener("click", () => {
    sors = [];
    const sorDialedEl = document.getElementById("sorDialed");
    const sorMaxEl    = document.getElementById("sorMax");
    sorDialedEl.value = "";
    sorMaxEl.value    = "";
    clearInputError(sorDialedEl);
    clearInputError(sorMaxEl);
    saveState();
    renderSORS();
    calculate();
});

document.getElementById("clearSochBtn").addEventListener("click", () => {
    const dialedEl = document.getElementById("sochDialed");
    const maxEl    = document.getElementById("sochMax");
    dialedEl.value = "";
    maxEl.value    = "";
    clearInputError(dialedEl);
    clearInputError(maxEl);
    saveState();
    calculate();
});

/* ---------- Reset All ---------- */
document.getElementById("resetAllBtn").addEventListener("click", () => {
    if (!so.length && !sors.length &&
        !document.getElementById("sochDialed").value &&
        !document.getElementById("sochMax").value) return;

    so   = [];
    sors = [];
    ["sochDialed","sochMax","sorDialed","sorMax","soInput"].forEach(id => {
        const el = document.getElementById(id);
        if (el) { el.value = ""; el.style.borderColor = ""; }
    });
    document.querySelectorAll(".input-error-banner").forEach(b => b.remove());
    saveState();
    renderSO();
    renderSORS();
    calculate();
});

/* ---------- Share ---------- */
(function setupShare() {
    const shareBtn = document.getElementById("shareBtn");
    if (!shareBtn) return;

    shareBtn.addEventListener("click", async () => {
        const result = document.getElementById("finalResult").textContent;
        const badge  = document.getElementById("gradeBadge").textContent;
        const text   = `Мой результат в BilimCalc: ${result} — ${badge}\nhttps://bilimcalc.vercel.app`;

        if (navigator.share) {
            try {
                await navigator.share({ title: "BilimCalc", text });
            } catch (e) {
                if (e.name !== "AbortError") copyToClipboard(text, shareBtn);
            }
        } else {
            copyToClipboard(text, shareBtn);
        }
    });

    function copyToClipboard(text, btn) {
        navigator.clipboard.writeText(text).then(() => {
            const orig = btn.innerHTML;
            btn.textContent = "✓ Скопировано!";
            setTimeout(() => { btn.innerHTML = orig; }, 2000);
        }).catch(() => {});
    }
})();

const debouncedCalculate = debounce(calculate, 250);

document.getElementById("sochDialed").addEventListener("input", () => { validateSoch(); saveState(); debouncedCalculate(); });
document.getElementById("sochMax").addEventListener("input",    () => { validateSoch(); saveState(); debouncedCalculate(); });

/* ---------- digits-only input ---------- */
function makeDigitsOnly(input, maxLen, maxVal, onFull) {
    input.addEventListener("keydown", function (e) {
        const allowed = ["Backspace","Delete","ArrowLeft","ArrowRight","Tab","Enter","Home","End"];
        if (allowed.includes(e.key) || e.ctrlKey || e.metaKey) return;
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

const soInput         = document.getElementById("soInput");
const sorDialedInput  = document.getElementById("sorDialed");
const sorMaxInput     = document.getElementById("sorMax");
const sochDialedInput = document.getElementById("sochDialed");
const sochMaxInput    = document.getElementById("sochMax");

makeDigitsOnly(soInput, 2, 10);
makeDigitsOnly(sorDialedInput, 2, undefined, () => sorMaxInput.focus());
makeDigitsOnly(sorMaxInput, 2);
makeDigitsOnly(sochDialedInput, 2, undefined, () => sochMaxInput.focus());
makeDigitsOnly(sochMaxInput, 2);

sorMaxInput.addEventListener("keydown", function (e) {
    if (e.key === "Backspace" && !this.value) {
        sorDialedInput.focus();
        sorDialedInput.setSelectionRange(sorDialedInput.value.length, sorDialedInput.value.length);
    }
});
sochMaxInput.addEventListener("keydown", function (e) {
    if (e.key === "Backspace" && !this.value) {
        sochDialedInput.focus();
        sochDialedInput.setSelectionRange(sochDialedInput.value.length, sochDialedInput.value.length);
    }
});

/* ---------- utilities ---------- */
function debounce(fn, ms = 250) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

function animatePercentage(element, start, end, duration = 500) {
    const startTime  = performance.now();
    const difference = end - start;
    function update(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased    = 1 - Math.pow(1 - progress, 3);
        element.innerText = (start + difference * eased).toFixed(2) + "%";
        if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
}

/* ═══════════════════════════════════════════════════════
   ЛОГИКА РАСЧЁТА (офлайн)
   ═══════════════════════════════════════════════════════ */

function calculateParts(so, sors, soch) {
    let total_so = null;
    if (so && so.length > 0) {
        const avg = so.reduce((a, b) => a + b, 0) / so.length;
        total_so = (avg / 10) * 25;
    }

    let total_sor = null;
    if (sors && sors.length > 0) {
        const pcts = sors
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

function calculateFinal(total_so, total_sor, total_soch) {
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

/* ═══════════════════════════════════════════════════════
   ML АНАЛИЗ (офлайн)
   ═══════════════════════════════════════════════════════ */

function linearRegression(scores) {
    const n = scores.length;
    const x = Array.from({ length: n }, (_, i) => i + 1);
    const y = scores;

    const xMean = x.reduce((a, b) => a + b, 0) / n;
    const yMean = y.reduce((a, b) => a + b, 0) / n;

    let num = 0, den = 0;
    for (let i = 0; i < n; i++) {
        num += (x[i] - xMean) * (y[i] - yMean);
        den += (x[i] - xMean) ** 2;
    }

    const slope     = den === 0 ? 0 : num / den;
    const intercept = yMean - slope * xMean;
    const predictions = x.map(xi => xi * slope + intercept);

    const rmse = Math.sqrt(
        predictions.reduce((sum, p, i) => sum + (y[i] - p) ** 2, 0) / n
    );
    const accuracy = Math.min(100, Math.max(0, 100 - (rmse / 10) * 100));

    return { scores, predictions, accuracy: Math.round(accuracy * 10) / 10, slope };
}

/* ---------- calculate ---------- */
let pending      = false;
let pendingAgain = false;

function calculate() {
    if (pending) { pendingAgain = true; return; }
    pending      = true;
    pendingAgain = false;

    try {
        const sochDialed = Number(document.getElementById("sochDialed").value);
        const sochMax    = Number(document.getElementById("sochMax").value);
        const soch = (Number.isFinite(sochMax) && sochMax > 0 && sochDialed <= sochMax)
            ? [Number(sochDialed || 0), Number(sochMax)]
            : null;

        const { total_so, total_sor, total_soch } = calculateParts(so, sors, soch);
        const final_result = calculateFinal(total_so, total_sor, total_soch);

        const finalEl  = document.getElementById("finalResult");
        const fill     = document.getElementById("progressFill");
        const badge    = document.getElementById("gradeBadge");
        const shareBtn = document.getElementById("shareBtn");

        document.getElementById("breakSo").innerText    = total_so   !== null ? total_so.toFixed(2)   + "%" : "—";
        document.getElementById("breakSors").innerText  = total_sor  !== null ? total_sor.toFixed(2)  + "%" : "—";
        document.getElementById("breakSoch").innerText  = total_soch !== null ? total_soch.toFixed(2) + "%" : "—";
        document.getElementById("breakSoDetails").innerText   = "";
        document.getElementById("breakSorsDetails").innerText = "";
        document.getElementById("breakSochDetails").innerText = "";

        finalEl.classList.remove("result-danger", "result-warning", "result-good", "result-excellent");

        if (final_result !== null) {
            const pct = Number(final_result);
            animatePercentage(finalEl, parseFloat(finalEl.innerText) || 0, pct);
            fill.style.width = Math.min(Math.max(pct, 0), 100) + "%";

            if (pct < 40) {
                finalEl.classList.add("result-danger");
                fill.style.background = "var(--danger)";
                chartColor = "#da3633";
                badge.textContent = "Неудовлетворительно";
                badge.className   = "grade-badge badge-danger";
            } else if (pct < 65) {
                finalEl.classList.add("result-warning");
                fill.style.background = "var(--warning)";
                chartColor = "#d29922";
                badge.textContent = "Удовлетворительно";
                badge.className   = "grade-badge badge-warning";
            } else if (pct < 85) {
                finalEl.classList.add("result-good");
                fill.style.background = "var(--success)";
                chartColor = "#2ea043";
                badge.textContent = "Хорошо";
                badge.className   = "grade-badge badge-good";
            } else {
                finalEl.classList.add("result-excellent");
                fill.style.background = "#166534";
                chartColor = "#166534";
                badge.textContent = "Отлично 🎉";
                badge.className   = "grade-badge badge-excellent";
            }

            // показываем кнопку поделиться
            if (shareBtn) shareBtn.style.display = "flex";

            if (so.length >= 2) updateTrend();
        } else {
            finalEl.innerText = "—";
            fill.style.width  = "0%";
            badge.textContent = "Нет данных";
            badge.className   = "grade-badge badge-empty";
            if (shareBtn) shareBtn.style.display = "none";
        }

        saveState();
    } catch (e) {
        console.error("calculate error", e);
    } finally {
        pending = false;
        if (pendingAgain) calculate();
    }
}

/* ---------- trend chart ---------- */
let trendChart;
let chartColor = "#58a6ff";

function toggleTrendVisibility(show) {
    const box = document.querySelector(".trend-box");
    if (!box) return;
    box.classList.toggle("collapsed", !show);
    if (!show && trendChart) {
        try { trendChart.destroy(); } catch (e) {}
        trendChart = null;
        const acc = document.getElementById("aiAccuracy");
        if (acc) acc.textContent = "--%";
        const label = document.getElementById("trendLabel");
        if (label) label.textContent = "—";
    }
}

function updateTrend() {
    if (so.length < 2) { toggleTrendVisibility(false); return; }
    toggleTrendVisibility(true);
    try {
        const data = linearRegression(so);
        drawTrend(data.scores, data.predictions, data.accuracy);
        if (trendChart?.resize) trendChart.resize();
    } catch (e) {
        console.error("trend error", e);
    }
}

function hexToRgba(hex, a) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${a})`;
}

function drawTrend(scores, predictions, accuracy) {
    const canvas = document.getElementById("trendChart");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (trendChart) trendChart.destroy();

    if (!Array.isArray(scores) || !Array.isArray(predictions)) return;
    const len = Math.min(scores.length, predictions.length);
    if (!len) return;

    scores      = scores.slice(0, len).map(v => Math.min(Math.max(Number(v) || 2, 2), 10));
    predictions = predictions.slice(0, len).map(v => Math.min(Math.max(Number(v) || 2, 2), 10));

    const labels = Array.from({ length: len }, (_, i) => "Ур." + (i + 1));
    const color  = chartColor;
    const h      = canvas.offsetHeight || 145;

    const scoreGrad = ctx.createLinearGradient(0, 0, 0, h);
    scoreGrad.addColorStop(0,    hexToRgba(color, 0.30));
    scoreGrad.addColorStop(0.65, hexToRgba(color, 0.06));
    scoreGrad.addColorStop(1,    hexToRgba(color, 0.00));

    const predGrad = ctx.createLinearGradient(0, 0, 0, h);
    predGrad.addColorStop(0, "rgba(139,148,158,0.12)");
    predGrad.addColorStop(1, "rgba(139,148,158,0.00)");

    trendChart = new Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets: [
                {
                    data: scores,
                    borderColor: color,
                    backgroundColor: scoreGrad,
                    borderWidth: 2.5,
                    tension: 0.42,
                    fill: true,
                    pointBackgroundColor: color,
                    pointBorderColor: "#060a10",
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 5,
                },
                {
                    data: predictions,
                    borderColor: "rgba(139,148,158,0.45)",
                    backgroundColor: predGrad,
                    borderWidth: 1.5,
                    borderDash: [5, 4],
                    tension: 0.3,
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
            animation: { duration: 550, easing: "easeOutCubic" },
            events: [],
            plugins: {
                    legend: { display: false, labels: { generateLabels: () => [] } },
                    tooltip: { enabled: false },
                },
            scales: {
                x: {
                    grid:   { color: "rgba(255,255,255,0.04)", drawBorder: false },
                    border: { display: false },
                    ticks:  { color: "#6e7681", font: { size: 10 }, maxRotation: 0, maxTicksLimit: 6 },
                },
                y: {
                    min: 1, max: 10,
                    grid:   { color: "rgba(255,255,255,0.05)", drawBorder: false },
                    border: { display: false },
                    ticks:  { color: "#6e7681", font: { size: 10 }, stepSize: 3, maxTicksLimit: 4 },
                },
            },
        },
    });

    document.getElementById("aiAccuracy").textContent = accuracy + "%";

    const trend = predictions[predictions.length - 1] - predictions[0];
    let text;
    if      (trend >  0.6) text = "📈 Отличный рост! Продолжай в том же духе";
    else if (trend >  0.2) text = "📈 Небольшой рост";
    else if (trend < -0.6) text = "📉 Оценки снижаются — стоит уделить внимание";
    else if (trend < -0.2) text = "📉 Лёгкое снижение";
    else                   text = "📊 Стабильная динамика";
    document.getElementById("trendLabel").textContent = text;
}

/* ---------- FAQ accordion ---------- */
document.querySelectorAll(".faq-q").forEach(btn => {
    btn.addEventListener("click", function () {
        const item   = this.closest(".faq-item");
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

/* ---------- service worker ---------- */
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js")
            .then(reg => console.log("SW registered", reg.scope))
            .catch(err => console.warn("SW registration failed", err));
    });
}

/* ---------- offline banner ---------- */
(function () {
    const banner = document.getElementById("offlineBanner");
    if (!banner) return;
    const show = () => banner.style.display = "block";
    const hide = () => banner.style.display = "none";
    if (!navigator.onLine) show();
    window.addEventListener("offline", show);
    window.addEventListener("online",  hide);
})();

/* ---------- init ---------- */
(function init() {
    loadState();
    renderSO();
    renderSORS();
    setTimeout(() => {
        calculate();
        if (so.length >= 2) updateTrend();
        else toggleTrendVisibility(false);
    }, 120);
    document.getElementById("year").textContent = new Date().getFullYear();
})();