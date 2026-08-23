(function () {
    'use strict';

    var hasStaticSplash = !!(
        document.getElementById('splash') ||
        document.getElementById('examSplash') ||
        document.getElementById('grantSplash') ||
        window.__BRAND__
    );

    if (hasStaticSplash) {
        return;
    }

    const brand = window.__BRAND__ || { name: 'BilimCalc', icon: null };
    const isDarkTheme = document.documentElement.getAttribute('data-theme') !== 'light';
    const accentColor = brand.name === 'BilimExam' ? '#a78bfa' : '#3cb648';

    const overlay = document.createElement('div');
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
        `background:${isDarkTheme ? '#0d1117' : '#f0f4f8'}`,
        'transition:opacity 0.3s ease,transform 0.3s ease',
        'pointer-events:all',
    ].join(';');

    const logo = document.createElement('div');
    logo.style.cssText = 'display:flex;align-items:center;gap:10px;animation:ld-pop 0.4s cubic-bezier(.34,1.56,.64,1) both';

    const renderLogo = () => {
        if (brand.icon) {
            const iconEl = document.createElement('span');
            iconEl.style.cssText = 'font-size:36px;line-height:1';
            iconEl.textContent = brand.icon;
            logo.appendChild(iconEl);
            return;
        }

        const ns = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(ns, 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('width', '36');
        svg.setAttribute('height', '36');
        svg.setAttribute('fill', 'none');

        [
            { x: '2', y: '2', width: '9', height: '9', rx: '2', fill: '#3cb648' },
            { x: '13', y: '2', width: '9', height: '9', rx: '2', fill: '#3cb648' },
            { x: '2', y: '13', width: '9', height: '9', rx: '2', fill: '#3cb648' },
        ].forEach((attrs) => {
            const rect = document.createElementNS(ns, 'rect');
            Object.entries(attrs).forEach(([key, value]) => rect.setAttribute(key, value));
            svg.appendChild(rect);
        });

        const path = document.createElementNS(ns, 'path');
        path.setAttribute('d', 'M15 18h4M17 16v4');
        path.setAttribute('stroke', '#3cb648');
        path.setAttribute('stroke-width', '2.2');
        path.setAttribute('stroke-linecap', 'round');
        svg.appendChild(path);
        logo.appendChild(svg);
    };

    renderLogo();

    const nameEl = document.createElement('span');
    nameEl.style.cssText = [
        'font-family:Inter,Segoe UI,Roboto,Arial,sans-serif',
        'font-size:1.75rem',
        'font-weight:800',
        'letter-spacing:-0.03em',
        `color:${isDarkTheme ? '#fff' : '#0f172a'}`,
    ].join(';');

    const suffix = brand.name.replace(/^Bilim/, '');
    nameEl.innerHTML = `<span>Bilim</span><span style="color:${accentColor}">${suffix}</span>`;
    logo.appendChild(nameEl);
    overlay.appendChild(logo);

    const barWrap = document.createElement('div');
    barWrap.style.cssText = [
        'width:120px',
        'height:3px',
        'border-radius:99px',
        'overflow:hidden',
        `background:${isDarkTheme ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
    ].join(';');

    const bar = document.createElement('div');
    const barGradient = brand.name === 'BilimExam'
        ? 'linear-gradient(90deg,#7c3aed,#a78bfa)'
        : 'linear-gradient(90deg,#3cb648,#58a6ff)';
    bar.style.cssText = `width:0%;height:100%;border-radius:99px;background:${barGradient};animation:ld-fill 1.2s 0.1s cubic-bezier(.2,.9,.25,1) forwards`;
    barWrap.appendChild(bar);
    overlay.appendChild(barWrap);

    const style = document.createElement('style');
    style.textContent = [
        '@keyframes ld-pop{from{opacity:0;transform:scale(.75) translateY(10px)}to{opacity:1;transform:scale(1) translateY(0)}}',
        '@keyframes ld-fill{from{width:0%}to{width:100%}}',
        '#pageLoader.hidden{opacity:0;transform:scale(1.02);pointer-events:none}',
    ].join('');
    document.head.appendChild(style);

    const insertOverlay = () => document.body.insertBefore(overlay, document.body.firstChild);
    if (document.body) {
        insertOverlay();
    } else {
        document.addEventListener('DOMContentLoaded', insertOverlay);
    }

    const hide = () => {
        overlay.classList.add('hidden');
        setTimeout(() => {
            if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        }, 350);
    };

    window.PageLoader = { hide };

    window.addEventListener('load', () => setTimeout(hide, 300));
    setTimeout(hide, 2000);
})();
