(function () {
    var KEY = 'bilimcalc_theme';
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var saved = localStorage.getItem(KEY);
    var theme = saved || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);

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
        _updateBtn: function () {
            var t    = this.get();
            var icon = document.getElementById('themeIcon');
            var btn  = document.getElementById('themeBtn');
            if (icon) icon.textContent = t === 'dark' ? '☀️' : '🌙';
            if (btn)  btn.title = t === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему';
        },
        init: function () { this._updateBtn(); }
    };
})();