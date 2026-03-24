let so   = [];
let sors = [];
const SAVE_KEY = "bilimcalc_v1";
const SITE_URL_BASE = "https://bilimcalc.vercel.app/";

function hapticReset() {
    if (navigator.vibrate) navigator.vibrate([12, 60, 12]);
}

function buildShareURL() {
    const params = new URLSearchParams();
    if (so.length) params.set("so", so.join(","));
    if (sors.length) params.set("sor", sors.map(p => p[0] + "-" + p[1]).join(","));
    const sochDialed = document.getElementById("sochDialed").value;
    const sochMax    = document.getElementById("sochMax").value;
    if (sochMax && Number(sochMax) > 0) params.set("soch", sochDialed + "-" + sochMax);
    const qs = params.toString();
    return SITE_URL_BASE + (qs ? "?" + qs : "");
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
                document.getElementById("sochMax").value    = parts[1];
            }
        }
        return params.has("so") || params.has("sor") || params.has("soch");
    } catch (e) {}
    return false;
}

function createChip(text, onDelete) {
    const el  = document.createElement("div");
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
    const empty     = document.getElementById("soEmpty");

    Array.from(container.children).forEach(c => {
        if (c.id !== "soEmpty") c.remove();
    });

    so.forEach(val => {
        const chip = createChip(val, async () => {
            chip.classList.add("removing");
            await new Promise(r => setTimeout(r, 260));
            const idx = so.lastIndexOf(val);
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
    const empty     = document.getElementById("sorEmpty");

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
    const sochMax    = document.getElementById("sochMax").value;
    const soch = (sochMax && Number(sochMax) > 0)
        ? [Number(sochDialed || 0), Number(sochMax)]
        : null;
    try {
        localStorage.setItem(SAVE_KEY, JSON.stringify({ so, sors, soch }));
    } catch (e) {
        console.warn("localStorage save failed", e);
    }
}

function loadState() {
    try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (!raw) return;
        const saved = JSON.parse(raw);
        if (Array.isArray(saved.so))   so   = saved.so.map(Number);
        if (Array.isArray(saved.sors)) sors = saved.sors.map(p => [Number(p[0]), Number(p[1])]);
        if (Array.isArray(saved.soch)) {
            document.getElementById("sochDialed").value = saved.soch[0];
            document.getElementById("sochMax").value    = saved.soch[1];
        }
    } catch (e) {
        console.warn("localStorage load failed", e);
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

document.getElementById("resetAllBtn").addEventListener("click", () => {
    if (!so.length && !sors.length &&
        !document.getElementById("sochDialed").value &&
        !document.getElementById("sochMax").value) return;

    hapticReset();

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


(function setupShare() {
    const shareBtn = document.getElementById("shareBtn");
    if (!shareBtn) return;

    function getShareText() {
        const result = document.getElementById("finalResult").textContent.trim();
        const badge  = document.getElementById("gradeBadge").textContent.trim();
        return `Мой итоговый результат: ${result} — ${badge}. Посчитай свою оценку на BilimCalc!`;
    }

    function showShareModal() {
        if (document.getElementById("shareModal")) return;

        const text        = getShareText();
        const url         = buildShareURL();
        const encodedUrl  = encodeURIComponent(url);
        const encodedText = encodeURIComponent(text + "\n");

        const tgLink = `https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(text)}`;
        const waLink = `https://api.whatsapp.com/send?text=${encodedText}${encodedUrl}`;
        const vkLink = `https://vk.com/share.php?url=${encodedUrl}&title=${encodeURIComponent(text)}`;

        const modal = document.createElement("div");
        modal.id = "shareModal";
        modal.innerHTML = `
            <div class="share-modal__overlay"></div>
            <div class="share-modal__box">
                <div class="share-modal__title">Поделиться результатом</div>
                <div class="share-modal__text">${text}</div>
                <div class="share-modal__btns">
                    <a href="${tgLink}" target="_blank" rel="noopener" class="share-modal__btn share-modal__btn--tg">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z"/></svg>
                        Telegram
                    </a>
                    <a href="${waLink}" target="_blank" rel="noopener" class="share-modal__btn share-modal__btn--wa">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/><path d="M12 0C5.374 0 0 5.373 0 12c0 2.117.549 4.107 1.508 5.84L.057 23.928a.5.5 0 0 0 .614.614l6.088-1.451A11.948 11.948 0 0 0 12 24c6.627 0 12-5.374 12-12S18.627 0 12 0m0 21.96a9.923 9.923 0 0 1-5.065-1.381l-.364-.214-3.768.898.915-3.672-.236-.378A9.923 9.923 0 0 1 2.04 12C2.04 6.5 6.5 2.04 12 2.04S21.96 6.5 21.96 12 17.5 21.96 12 21.96"/></svg>
                        WhatsApp
                    </a>
                    <a href="${vkLink}" target="_blank" rel="noopener" class="share-modal__btn share-modal__btn--vk">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.864-.525-2.05-1.727-1.033-1-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.118-5.335-3.202C4.624 10.857 4.03 8.57 4.03 8.096c0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.677.863 2.49 2.303 4.675 2.896 4.675.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.204.17-.407.44-.407h2.744c.372 0 .508.203.508.643v3.473c0 .372.17.508.271.508.22 0 .407-.136.813-.542 1.254-1.406 2.151-3.574 2.151-3.574.119-.254.322-.491.763-.491h1.744c.525 0 .644.27.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.05.17.49-.085.744-.576.744z"/></svg>
                        ВКонтакте
                    </a>
                    <button class="share-modal__btn share-modal__btn--copy" id="shareCopyBtn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                        Копировать ссылку
                    </button>
                </div>
                <button class="share-modal__close" id="shareModalClose" aria-label="Закрыть">✕</button>
            </div>`;

        if (!document.getElementById("shareModalStyles")) {
            const style = document.createElement("style");
            style.id = "shareModalStyles";
            style.textContent = `
                #shareModal{position:fixed;inset:0;z-index:5000;display:flex;align-items:flex-end;justify-content:center;padding:0 0 env(safe-area-inset-bottom,0px)}
                .share-modal__overlay{position:absolute;inset:0;background:rgba(0,0,0,0.55);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);animation:smOverlayIn 0.25s ease}
                .share-modal__box{position:relative;z-index:1;width:100%;max-width:480px;background:#161b22;border:1px solid rgba(255,255,255,0.08);border-radius:20px 20px 0 0;padding:24px 20px 32px;animation:smBoxIn 0.3s cubic-bezier(.34,1.56,.64,1)}
                [data-theme="light"] .share-modal__box{background:#fff;border-color:rgba(0,0,0,0.1)}
                .share-modal__title{font-size:15px;font-weight:700;color:#e6edf3;margin-bottom:8px;text-align:center}
                [data-theme="light"] .share-modal__title{color:#0f172a}
                .share-modal__text{font-size:13px;color:#8b949e;text-align:center;margin-bottom:20px;line-height:1.5}
                [data-theme="light"] .share-modal__text{color:#64748b}
                .share-modal__btns{display:grid;grid-template-columns:1fr 1fr;gap:10px}
                .share-modal__btn{display:flex;align-items:center;justify-content:center;gap:8px;padding:12px 16px;border-radius:12px;font-size:14px;font-weight:600;cursor:pointer;text-decoration:none;border:none;transition:opacity 0.15s,transform 0.1s;-webkit-tap-highlight-color:transparent}
                .share-modal__btn:active{opacity:0.8;transform:scale(0.97)}
                .share-modal__btn--tg{background:#2CA5E0;color:#fff}
                .share-modal__btn--wa{background:#25D366;color:#fff}
                .share-modal__btn--vk{background:#4C75A3;color:#fff}
                .share-modal__btn--copy{background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);color:#e6edf3}
                [data-theme="light"] .share-modal__btn--copy{background:#f1f5f9;border-color:rgba(0,0,0,0.1);color:#0f172a}
                .share-modal__close{position:absolute;top:14px;right:16px;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.08);border-radius:8px;color:#8b949e;width:30px;height:30px;display:flex;align-items:center;justify-content:center;font-size:14px;cursor:pointer;transition:background 0.15s;-webkit-tap-highlight-color:transparent}
                .share-modal__close:hover{background:rgba(255,255,255,0.12);color:#e6edf3}
                [data-theme="light"] .share-modal__close{background:rgba(0,0,0,0.05);border-color:rgba(0,0,0,0.1);color:#64748b}
                @keyframes smOverlayIn{from{opacity:0}to{opacity:1}}
                @keyframes smBoxIn{from{transform:translateY(40px);opacity:0}to{transform:translateY(0);opacity:1}}
                @media(min-width:601px){#shareModal{align-items:center}.share-modal__box{border-radius:20px;max-width:400px}}
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(modal);

        function closeModal() {
            const box     = modal.querySelector(".share-modal__box");
            const overlay = modal.querySelector(".share-modal__overlay");
            box.style.transition     = "transform 0.2s ease, opacity 0.2s ease";
            box.style.transform      = "translateY(30px)";
            box.style.opacity        = "0";
            overlay.style.transition = "opacity 0.2s ease";
            overlay.style.opacity    = "0";
            setTimeout(() => modal.remove(), 220);
        }

        document.getElementById("shareModalClose").addEventListener("click", closeModal);
        modal.querySelector(".share-modal__overlay").addEventListener("click", closeModal);

        document.getElementById("shareCopyBtn").addEventListener("click", () => {
            navigator.clipboard.writeText(text + " " + url).then(() => {
                const btn = document.getElementById("shareCopyBtn");
                if (!btn) return;
                const orig = btn.innerHTML;
                btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg> Скопировано!`;
                btn.style.background = "rgba(46,160,67,0.2)";
                btn.style.color      = "#3fb950";
                setTimeout(() => { btn.innerHTML = orig; btn.style.background = ""; btn.style.color = ""; }, 2000);
            }).catch(() => {});
        });
    }

    shareBtn.addEventListener("click", async () => {
        const text      = getShareText();
        const url       = buildShareURL();
        const isDesktop = window.matchMedia("(min-width: 1024px)").matches;

        if (navigator.share && !isDesktop) {
            try {
                await navigator.share({ title: "BilimCalc — результат расчёта", text, url });
                return;
            } catch (e) {
                if (e.name === "AbortError") return;
            }
        }

        if (isDesktop) {
            navigator.clipboard.writeText(text + " " + url).then(() => {
                const orig = shareBtn.innerHTML;
                shareBtn.textContent = "✓ Скопировано!";
                setTimeout(() => { shareBtn.innerHTML = orig; }, 2000);
            }).catch(() => {});
        } else {
            showShareModal();
        }
    });
})();


function restrictToDigits(input, maxLen, maxVal, onFull) {
    input.addEventListener("keydown", function (e) {
        const nav = ["Backspace","Delete","ArrowLeft","ArrowRight","Tab","Enter","Home","End"];
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

const soInput         = document.getElementById("soInput");
const sorDialedInput  = document.getElementById("sorDialed");
const sorMaxInput     = document.getElementById("sorMax");
const sochDialedInput = document.getElementById("sochDialed");
const sochMaxInput    = document.getElementById("sochMax");

restrictToDigits(soInput, 2, 10);
restrictToDigits(sorDialedInput,  2, undefined, () => sorMaxInput.focus({ preventScroll: true }));
restrictToDigits(sorMaxInput,     2);
restrictToDigits(sochDialedInput, 2, undefined, () => sochMaxInput.focus({ preventScroll: true }));
restrictToDigits(sochMaxInput,    2);

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

document.getElementById("sochDialed").addEventListener("input", () => { validateSoch(); saveState(); debouncedCalculate(); });
document.getElementById("sochMax").addEventListener("input",    () => { validateSoch(); saveState(); debouncedCalculate(); });


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

        const { total_so, total_sor, total_soch } = computeParts(so, sors, soch);
        const final_result = computeFinalPct(total_so, total_sor, total_soch);

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
            const pct        = Number(final_result);
            const gradeCheck = Math.round(pct);

            const startVal = parseFloat(finalEl.innerText) || 0;
            const t0       = performance.now();
            const isWhole  = Number.isInteger(pct);
            (function tick(now) {
                const progress = Math.min((now - t0) / 500, 1);
                const eased    = 1 - Math.pow(1 - progress, 3);
                const cur      = startVal + (pct - startVal) * eased;
                finalEl.innerText = (isWhole ? Math.round(cur) : cur.toFixed(2)) + "%";
                if (progress < 1) requestAnimationFrame(tick);
            })(t0);

            fill.style.width = Math.min(Math.max(pct, 0), 100) + "%";

            if (gradeCheck < 40) {
                finalEl.classList.add("result-danger");
                fill.style.background = "var(--danger)";
                chartColor = "#da3633";
                badge.textContent = "Неудовлетворительно";
                badge.className   = "grade-badge badge-danger";
            } else if (gradeCheck < 65) {
                finalEl.classList.add("result-warning");
                fill.style.background = "var(--warning)";
                chartColor = "#d29922";
                badge.textContent = "Удовлетворительно";
                badge.className   = "grade-badge badge-warning";
            } else if (gradeCheck < 85) {
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

            updateRoundingHint(pct);

            const hintEl = document.getElementById("formulaHint");
            if (hintEl) {
                const parts = [];
                if (total_so   !== null) parts.push("ФО: "  + total_so.toFixed(2));
                if (total_sor  !== null) parts.push("СОР: " + total_sor.toFixed(2));
                if (total_soch !== null) parts.push("СОЧ: " + total_soch.toFixed(2));
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
            fill.style.width  = "0%";
            badge.textContent = "Нет данных";
            badge.className   = "grade-badge badge-empty";
            updateRoundingHint(null);
            if (shareBtn) shareBtn.style.display = "none";
            const hintEl = document.getElementById("formulaHint");
            if (hintEl) hintEl.textContent = "";
        }

        saveState();
    } catch (e) {
        console.error("calculate error", e);
    } finally {
        pending = false;
        if (pendingAgain) calculate();
    }
}


let trendChart;
let chartColor = "#58a6ff";

function showTrend(visible) {
    const box = document.querySelector(".trend-box");
    if (!box) return;
    box.classList.toggle("collapsed", !visible);
    if (!visible && trendChart) {
        try { trendChart.destroy(); } catch (e) {}
        trendChart = null;
        const acc   = document.getElementById("aiAccuracy");
        const label = document.getElementById("trendLabel");
        if (acc)   acc.textContent   = "--%";
        if (label) label.textContent = "—";
    }
}

function updateTrend() {
    if (so.length < 2) { showTrend(false); return; }
    showTrend(true);
    try {
        const data = calcTrendLine(so);
        drawTrend(data.scores, data.predictions, data.accuracy);
        if (trendChart?.resize) trendChart.resize();
    } catch (e) {
        console.error("trend error", e);
    }
}

function calcTrendLine(scores) {
    const n     = scores.length;
    const x     = Array.from({ length: n }, (_, i) => i + 1);
    const xMean = x.reduce((a, b) => a + b, 0) / n;
    const yMean = scores.reduce((a, b) => a + b, 0) / n;

    let num = 0, den = 0;
    for (let i = 0; i < n; i++) {
        num += (x[i] - xMean) * (scores[i] - yMean);
        den += (x[i] - xMean) ** 2;
    }

    const slope       = den === 0 ? 0 : num / den;
    const intercept   = yMean - slope * xMean;
    const predictions = x.map(xi => xi * slope + intercept);

    const rmse     = Math.sqrt(predictions.reduce((s, p, i) => s + (scores[i] - p) ** 2, 0) / n);
    const accuracy = Math.min(100, Math.max(0, 100 - (rmse / 10) * 100));

    return { scores, predictions, accuracy: Math.round(accuracy * 10) / 10, slope };
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

    if (typeof Chart === "undefined") {
        const container = document.getElementById("trendContainer");
        if (container && !container.querySelector(".chart-offline-msg")) {
            const msg = document.createElement("div");
            msg.className = "chart-offline-msg";
            msg.style.cssText = "display:flex;align-items:center;justify-content:center;height:100%;font-size:12px;color:#8b949e;text-align:center;line-height:1.5;padding:0 12px";
            msg.textContent = "График доступен при наличии интернета";
            container.appendChild(msg);
        }
        document.getElementById("aiAccuracy").textContent = "--%%";
        document.getElementById("trendLabel").textContent = "Нет данных";
        return;
    }

    const ctx = canvas.getContext("2d");
    if (trendChart) trendChart.destroy();

    if (!Array.isArray(scores) || !Array.isArray(predictions)) return;
    const len = Math.min(scores.length, predictions.length);
    if (!len) return;

    scores      = scores.slice(0, len).map(v => Math.min(Math.max(Number(v) || 2, 2), 10));
    predictions = predictions.slice(0, len).map(v => Math.min(Math.max(Number(v) || 2, 2), 10));

    const labels    = Array.from({ length: len }, (_, i) => "Ур." + (i + 1));
    const color     = chartColor;
    const h         = canvas.offsetHeight || 145;

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
                legend:  { display: false, labels: { generateLabels: () => [] } },
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
    let trendText;
    if      (trend >  0.6) trendText = "📈 Отличный рост! Продолжай в том же духе";
    else if (trend >  0.2) trendText = "📈 Небольшой рост";
    else if (trend < -0.6) trendText = "📉 Оценки снижаются — стоит уделить внимание";
    else if (trend < -0.2) trendText = "📉 Лёгкое снижение";
    else                   trendText = "📊 Стабильная динамика";
    document.getElementById("trendLabel").textContent = trendText;
}


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


(function () {
    const banner = document.getElementById("offlineBanner");
    if (!banner) return;
    if (!navigator.onLine) banner.style.display = "block";
    window.addEventListener("offline", () => banner.style.display = "block");
    window.addEventListener("online",  () => banner.style.display = "none");
})();


if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js")
            .then(reg => console.log("SW registered", reg.scope))
            .catch(err => console.warn("SW registration failed", err));
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