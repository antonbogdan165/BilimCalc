(function () {
    'use strict';

    var brand = (window.__BRAND__) || { name: 'BilimCalc', icon: null };
    var isDark = document.documentElement.getAttribute('data-theme') !== 'light';

    /* ── Создаём оверлей прелоадера ── */
    var overlay = document.createElement('div');
    overlay.id = 'pageLoader';
    overlay.style.cssText = [
        'position:fixed',
        'inset:0',
        'z-index:9999',
        'display:flex',
        'flex-direction:column',
        'align-items:center',
        'justify-content:center',
        'gap:16px',
        'background:' + (isDark ? '#0d1117' : '#f0f4f8'),
        'transition:opacity 0.3s ease,transform 0.3s ease',
        'pointer-events:all'
    ].join(';');

    /* Логотип */
    var logo = document.createElement('div');
    logo.style.cssText = 'display:flex;align-items:center;gap:10px;animation:ld-pop 0.4s cubic-bezier(.34,1.56,.64,1) both';

    /* Иконка — если это BilimExam показываем emoji, иначе SVG */
    if (brand.icon) {
        var iconEl = document.createElement('span');
        iconEl.style.cssText = 'font-size:36px;line-height:1';
        iconEl.textContent = brand.icon;
        logo.appendChild(iconEl);
    } else {
        /* BilimCalc SVG иконка */
        var svgNs = 'http://www.w3.org/2000/svg';
        var svg = document.createElementNS(svgNs, 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('width', '36');
        svg.setAttribute('height', '36');
        svg.setAttribute('fill', 'none');
        [
            { tag: 'rect', attrs: { x:'2',y:'2',width:'9',height:'9',rx:'2',fill:'#3cb648' } },
            { tag: 'rect', attrs: { x:'13',y:'2',width:'9',height:'9',rx:'2',fill:'#3cb648' } },
            { tag: 'rect', attrs: { x:'2',y:'13',width:'9',height:'9',rx:'2',fill:'#3cb648' } },
        ].forEach(function(s) {
            var el = document.createElementNS(svgNs, s.tag);
            Object.keys(s.attrs).forEach(function(k){ el.setAttribute(k, s.attrs[k]); });
            svg.appendChild(el);
        });
        var path = document.createElementNS(svgNs, 'path');
        path.setAttribute('d', 'M15 18h4M17 16v4');
        path.setAttribute('stroke', '#3cb648');
        path.setAttribute('stroke-width', '2.2');
        path.setAttribute('stroke-linecap', 'round');
        svg.appendChild(path);
        logo.appendChild(svg);
    }

    /* Название */
    var nameEl = document.createElement('span');
    nameEl.style.cssText = 'font-family:Inter,Segoe UI,Roboto,Arial,sans-serif;font-size:1.75rem;font-weight:800;letter-spacing:-0.03em;color:' + (isDark ? '#fff' : '#0f172a');

    /* BilimCalc → «Bilim» белый + «Calc» зелёный */
    /* BilimExam → «Bilim» белый + «Exam» фиолетовый */
    var mainText = brand.name.replace(/^Bilim/, '');
    var accentColor = (brand.name === 'BilimExam') ? '#a78bfa' : '#3cb648';
    nameEl.innerHTML = '<span>Bilim</span><span style="color:' + accentColor + '">' + mainText + '</span>';

    logo.appendChild(nameEl);
    overlay.appendChild(logo);

    /* Прогресс-бар */
    var barWrap = document.createElement('div');
    barWrap.style.cssText = 'width:120px;height:3px;background:rgba(255,255,255,0.08);border-radius:99px;overflow:hidden';
    if (!isDark) barWrap.style.background = 'rgba(0,0,0,0.08)';

    var bar = document.createElement('div');
    bar.style.cssText = 'width:0%;height:100%;border-radius:99px;background:linear-gradient(90deg,#3cb648,#58a6ff);animation:ld-fill 1.2s 0.1s cubic-bezier(.2,.9,.25,1) forwards';
    if (brand.name === 'BilimExam') {
        bar.style.background = 'linear-gradient(90deg,#7c3aed,#a78bfa)';
    }

    barWrap.appendChild(bar);
    overlay.appendChild(barWrap);

    /* Инжектим стили */
    var style = document.createElement('style');
    style.textContent = [
        '@keyframes ld-pop{from{opacity:0;transform:scale(.75) translateY(10px)}to{opacity:1;transform:scale(1) translateY(0)}}',
        '@keyframes ld-fill{from{width:0%}to{width:100%}}',
        '#pageLoader.hidden{opacity:0;transform:scale(1.02);pointer-events:none}'
    ].join('');
    document.head.appendChild(style);

    /* Добавляем в DOM до DOMContentLoaded */
    document.addEventListener('DOMContentLoaded', function () {
        document.body.insertBefore(overlay, document.body.firstChild);
    });
    /* Либо сразу если body уже есть */
    if (document.body) document.body.insertBefore(overlay, document.body.firstChild);

    /* ── Скрываем когда страница готова ── */
    window.PageLoader = {
        hide: function () {
            if (overlay) {
                overlay.classList.add('hidden');
                setTimeout(function () {
                    if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
                }, 350);
            }
        }
    };

    /* Автоскрытие через 1.4с если никто явно не вызвал hide() */
    window.addEventListener('load', function () {
        setTimeout(function () { window.PageLoader.hide(); }, 300);
    });

    /* Fallback — скрыть через 2с в любом случае */
    setTimeout(function () { window.PageLoader.hide(); }, 2000);

})();