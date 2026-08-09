(function () {
    'use strict';

    function translate(key, params) {
        if (typeof window.__ === 'function') return window.__(key, params);
        return key;
    }

    function ensureShareStyles() {
        if (document.getElementById('shareModalStyles')) return;

        var style = document.createElement('style');
        style.id = 'shareModalStyles';
        style.textContent = `
            #shareModal{position:fixed;inset:0;z-index:5000;display:flex;align-items:flex-end;justify-content:center;padding:0 0 env(safe-area-inset-bottom,0px)}
            .share-modal__overlay{position:absolute;inset:0;background:rgba(0,0,0,0.55);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);animation:smOverlayIn 0.25s ease}
            .share-modal__box{position:relative;z-index:1;width:100%;max-width:480px;background:#161b22;border:1px solid rgba(255,255,255,0.08);border-radius:20px 20px 0 0;padding:24px 20px 32px;animation:smBoxIn 0.3s cubic-bezier(.34,1.56,.64,1)}
            [data-theme="light"] .share-modal__box{background:#fff;border-color:rgba(0,0,0,0.1)}
            .share-modal__title{font-size:15px;font-weight:700;color:#e6edf3;margin-bottom:8px;text-align:center}
            [data-theme="light"] .share-modal__title{color:#0f172a}
            .share-modal__text{font-size:13px;color:#8b949e;text-align:center;margin-bottom:20px;line-height:1.5;white-space:pre-wrap}
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
        `.replace(/^ +/gm, '');
        document.head.appendChild(style);
    }

    function formatButton(type, text, href) {
        if (type === 'copy') {
            return '<button type="button" class="share-modal__btn share-modal__btn--copy" id="shareModalCopyBtn">' +
                '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>' +
                text +
                '</button>';
        }
        return '<a href="' + href + '" target="_blank" rel="noopener" class="share-modal__btn share-modal__btn--' + type + '">' +
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">' +
            (type === 'tg' ? '<path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z"/>' :
                type === 'wa' ? '<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/><path d="M12 0C5.374 0 0 5.373 0 12c0 2.117.549 4.107 1.508 5.84L.057 23.928a.5.5 0 0 0 .614.614l6.088-1.451A11.948 11.948 0 0 0 12 24c6.627 0 12-5.374 12-12S18.627 0 12 0m0 21.96a9.923 9.923 0 0 1-5.065-1.381l-.364-.214-3.768.898.915-3.672-.236-.378A9.923 9.923 0 0 1 2.04 12C2.04 6.5 6.5 2.04 12 2.04S21.96 6.5 21.96 12 17.5 21.96 12 21.96"/>' :
                    '<path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.864-.525-2.05-1.727-1.033-1-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.118-5.335-3.202C4.624 10.857 4.03 8.57 4.03 8.096c0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.677.863 2.49 2.303 4.675 2.896 4.675.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.204.17-.407.44-.407h2.744c.372 0 .508.203.508.643v3.473c0 .372.17.508.271.508.22 0 .407-.136.813-.542 1.254-1.406 2.151-3.574 2.151-3.574.119-.254.322-.491.763-.491h1.744c.525 0 .644.27.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.05.17.49-.085.744-.576.744"/>') +
            text +
            '</a>';
    }

    function openShareModal(options) {
        options = options || {};
        if (document.getElementById('shareModal')) return;

        var text = options.text || '';
        var url = options.url || window.location.origin + window.location.pathname;
        var title = options.title || translate('share_modal_title');
        var channels = Array.isArray(options.channels) ? options.channels : ['tg', 'wa', 'copy'];

        var encodedUrl = encodeURIComponent(url);
        var encodedText = encodeURIComponent(text);
        var encodedTextWithNewline = encodeURIComponent(text + '\n');

        var buttonsHtml = '';
        if (channels.includes('tg')) {
            buttonsHtml += formatButton('tg', translate('telegram'), 'https://t.me/share/url?url=' + encodedUrl + '&text=' + encodedText);
        }
        if (channels.includes('wa')) {
            buttonsHtml += formatButton('wa', translate('whatsapp'), 'https://api.whatsapp.com/send?text=' + encodedTextWithNewline + encodedUrl);
        }
        if (channels.includes('vk')) {
            buttonsHtml += formatButton('vk', translate('vk'), 'https://vk.com/share.php?url=' + encodedUrl + '&title=' + encodedText);
        }
        if (channels.includes('copy')) {
            buttonsHtml += formatButton('copy', translate('copy_link'));
        }

        ensureShareStyles();

        var modal = document.createElement('div');
        modal.id = 'shareModal';
        modal.innerHTML = `
            <div class="share-modal__overlay"></div>
            <div class="share-modal__box">
                <div class="share-modal__title">${title}</div>
                <div class="share-modal__text">${text}</div>
                <div class="share-modal__btns">${buttonsHtml}</div>
                <button class="share-modal__close" id="shareModalClose" aria-label="${translate('close')}">✕</button>
            </div>`;

        document.body.appendChild(modal);

        function closeModal() {
            var box = modal.querySelector('.share-modal__box');
            var overlay = modal.querySelector('.share-modal__overlay');
            if (box) {
                box.style.transition = 'transform 0.2s ease, opacity 0.2s ease';
                box.style.transform = 'translateY(30px)';
                box.style.opacity = '0';
            }
            if (overlay) {
                overlay.style.transition = 'opacity 0.2s ease';
                overlay.style.opacity = '0';
            }
            setTimeout(function () { if (modal.parentNode) modal.parentNode.removeChild(modal); }, 220);
        }

        var closeBtn = document.getElementById('shareModalClose');
        if (closeBtn) closeBtn.addEventListener('click', closeModal);

        var overlayEl = modal.querySelector('.share-modal__overlay');
        if (overlayEl) overlayEl.addEventListener('click', closeModal);

        var copyBtn = document.getElementById('shareModalCopyBtn');
        if (copyBtn) {
            copyBtn.addEventListener('click', function () {
                navigator.clipboard.writeText(text + ' ' + url).then(function () {
                    var original = copyBtn.innerHTML;
                    copyBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg> ' + translate('copied');
                    copyBtn.style.background = 'rgba(46,160,67,0.2)';
                    copyBtn.style.color = '#3fb950';
                    setTimeout(function () { copyBtn.innerHTML = original; copyBtn.style.background = ''; copyBtn.style.color = ''; }, 2000);
                }).catch(function () { });
            });
        }
    }

    window.openShareModal = openShareModal;
})();