(function () {
    'use strict';

    var brand  = window.__BRAND__ || { name: 'BilimCalc', icon: null };
    var isDark = document.documentElement.getAttribute('data-theme') !== 'light';

    var overlay = document.createElement('div');
    overlay.id = 'pageLoader';
    overlay.style.cssText =
        'position:fixed;inset:0;z-index:9999;display:flex;flex-direction:column;' +
        'align-items:center;justify-content:center;gap:16px;' +
        'background:' + (isDark ? '#0d1117' : '#f0f4f8') + ';' +
        'transition:opacity 0.3s ease,transform 0.3s ease;pointer-events:all';

    var logo = document.createElement('div');
    logo.style.cssText = 'display:flex;align-items:center;gap:10px;animation:ld-pop 0.4s cubic-bezier(.34,1.56,.64,1) both';

    if (brand.icon) {
        var iconEl = document.createElement('span');
        iconEl.style.cssText = 'font-size:36px;line-height:1';
        iconEl.textContent = brand.icon;
        logo.appendChild(iconEl);
    } else {
        var ns  = 'http://www.w3.org/2000/svg';
        var svg = document.createElementNS(ns, 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('width', '36');
        svg.setAttribute('height', '36');
        svg.setAttribute('fill', 'none');
        [
            { x:'2',  y:'2',  width:'9', height:'9', rx:'2', fill:'#3cb648' },
            { x:'13', y:'2',  width:'9', height:'9', rx:'2', fill:'#3cb648' },
            { x:'2',  y:'13', width:'9', height:'9', rx:'2', fill:'#3cb648' },
        ].forEach(function (attrs) {
            var rect = document.createElementNS(ns, 'rect');
            Object.keys(attrs).forEach(function (k) { rect.setAttribute(k, attrs[k]); });
            svg.appendChild(rect);
        });
        var path = document.createElementNS(ns, 'path');
        path.setAttribute('d', 'M15 18h4M17 16v4');
        path.setAttribute('stroke', '#3cb648');
        path.setAttribute('stroke-width', '2.2');
        path.setAttribute('stroke-linecap', 'round');
        svg.appendChild(path);
        logo.appendChild(svg);
    }

    var nameEl = document.createElement('span');
    nameEl.style.cssText =
        'font-family:Inter,Segoe UI,Roboto,Arial,sans-serif;font-size:1.75rem;font-weight:800;' +
        'letter-spacing:-0.03em;color:' + (isDark ? '#fff' : '#0f172a');

    var suffix      = brand.name.replace(/^Bilim/, '');
    var accentColor = brand.name === 'BilimExam' ? '#a78bfa' : '#3cb648';
    nameEl.innerHTML = '<span>Bilim</span><span style="color:' + accentColor + '">' + suffix + '</span>';
    logo.appendChild(nameEl);
    overlay.appendChild(logo);

    var barWrap = document.createElement('div');
    barWrap.style.cssText =
        'width:120px;height:3px;border-radius:99px;overflow:hidden;' +
        'background:' + (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)');

    var bar = document.createElement('div');
    var barGradient = brand.name === 'BilimExam'
        ? 'linear-gradient(90deg,#7c3aed,#a78bfa)'
        : 'linear-gradient(90deg,#3cb648,#58a6ff)';
    bar.style.cssText =
        'width:0%;height:100%;border-radius:99px;background:' + barGradient + ';' +
        'animation:ld-fill 1.2s 0.1s cubic-bezier(.2,.9,.25,1) forwards';
    barWrap.appendChild(bar);
    overlay.appendChild(barWrap);

    var style = document.createElement('style');
    style.textContent =
        '@keyframes ld-pop{from{opacity:0;transform:scale(.75) translateY(10px)}to{opacity:1;transform:scale(1) translateY(0)}}' +
        '@keyframes ld-fill{from{width:0%}to{width:100%}}' +
        '#pageLoader.hidden{opacity:0;transform:scale(1.02);pointer-events:none}';
    document.head.appendChild(style);

    if (document.body) {
        document.body.insertBefore(overlay, document.body.firstChild);
    } else {
        document.addEventListener('DOMContentLoaded', function () {
            document.body.insertBefore(overlay, document.body.firstChild);
        });
    }

    window.PageLoader = {
        hide: function () {
            if (!overlay) return;
            overlay.classList.add('hidden');
            setTimeout(function () {
                if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
            }, 350);
        }
    };

    window.addEventListener('load', function () {
        setTimeout(function () { window.PageLoader.hide(); }, 300);
    });

    // на всякий случай — если load не сработал
    setTimeout(function () { window.PageLoader.hide(); }, 2000);
})();