(function () {
    'use strict';

    const KEY = 'bilimcalc_theme';
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    const savedTheme = localStorage.getItem(KEY);
    const theme = savedTheme || (systemPrefersDark.matches ? 'dark' : 'light');

    document.documentElement.setAttribute('data-theme', theme);

    systemPrefersDark.addEventListener('change', (event) => {
        if (localStorage.getItem(KEY)) return;
        const nextTheme = event.matches ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', nextTheme);
        if (window.ThemeToggle) window.ThemeToggle._updateBtn();
    });

    const getStrings = () => window.APP_STRINGS || {};

    window.ThemeToggle = {
        get() {
            return document.documentElement.getAttribute('data-theme') || 'dark';
        },
        set(themeValue) {
            document.documentElement.setAttribute('data-theme', themeValue);
            localStorage.setItem(KEY, themeValue);
            this._updateBtn();
        },
        toggle() {
            this.set(this.get() === 'dark' ? 'light' : 'dark');
        },
        resetToSystem() {
            localStorage.removeItem(KEY);
            const nextTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', nextTheme);
            this._updateBtn();
        },
        _updateBtn() {
            const currentTheme = this.get();
            const icon = document.getElementById('themeIcon');
            const btn = document.getElementById('themeBtn');
            if (icon) icon.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
            if (btn) {
                const strings = getStrings();
                btn.title = currentTheme === 'dark'
                    ? strings.theme_light || 'Включить светлую тему'
                    : strings.theme_dark || 'Включить тёмную тему';
            }
        },
        init() {
            this._updateBtn();
        }
    };
})();
