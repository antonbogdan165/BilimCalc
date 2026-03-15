(function () {
    var KEY         = 'bilimcalc_theme';
    var saved       = localStorage.getItem(KEY);
    var systemDark  = window.matchMedia('(prefers-color-scheme: dark)').matches;

    var theme = saved || (systemDark ? 'dark' : 'light');

    document.documentElement.setAttribute('data-theme', theme);

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
        if (!localStorage.getItem(KEY)) {
            var next = e.matches ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', next);
            if (window.ThemeToggle) window.ThemeToggle._updateBtn();
        }
    });

    window.ThemeToggle = {
        get: function () {
            return document.documentElement.getAttribute('data-theme') || 'dark';
        },
        set: function (t) {
            document.documentElement.setAttribute('data-theme', t);
            localStorage.setItem(KEY, t);
            this._updateBtn();
        },
        toggle: function () {
            this.set(this.get() === 'dark' ? 'light' : 'dark');
        },
        resetToSystem: function () {
            localStorage.removeItem(KEY);
            var s = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', s);
            this._updateBtn();
        },
        _updateBtn: function () {
            var t    = this.get();
            var icon = document.getElementById('themeIcon');
            var btn  = document.getElementById('themeBtn');
            if (icon) icon.textContent = t === 'dark' ? '☀️' : '🌙';
            if (btn)  btn.title        = t === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему';
        },
        init: function () { this._updateBtn(); }
    };
})();