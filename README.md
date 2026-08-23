<h1 align="center">BilimCalc</h1>

<p align="center">
  A free grade calculator for Kazakhstani schools, built around the official MoES (МОН РК) criteria-based assessment formula
</p>

<p align="center">
  <a href="https://bilimcalc.asia">bilimcalc.asia</a> · <a href="README.ru.md">Русская версия</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-1.8.3-22c55e?style=flat-square" alt="Version">
  <img src="https://img.shields.io/badge/python-3.11-3b82f6?style=flat-square&logo=python&logoColor=white" alt="Python">
  <img src="https://img.shields.io/badge/flask-3.0-black?style=flat-square&logo=flask" alt="Flask">
  <img src="https://img.shields.io/badge/vercel-deploy-black?style=flat-square&logo=vercel" alt="Vercel">
  <img src="https://img.shields.io/badge/pwa-ready-8b5cf6?style=flat-square" alt="PWA">
</p>

---

## What this is

I started BilimCalc because doing the math for ФО/СОР/СОЧ by hand (or in a plain calculator app) every time a quarter ended was annoying, and every "calculator" I could find online was either broken, full of popups, or just wrong. So I built one that follows the actual МОН РК methodology and doesn't ask you to sign up for anything.

It grew into three small apps that share one codebase:

- **BilimCalc** — the original: enter your ФО, СОР and СОЧ scores, get your quarter grade instantly, with an AI-ish trend chart if you have enough ФО entries.
- **BilimExam** — for 9th and 11th graders. Takes your four quarter grades plus your exam grade and applies the 70/30 formula used for the year-end mark that goes on the certificate.
- **BilimGrant** — a rough probability estimator for ENT grant chances, based on program thresholds, university type, and the rural quota.

All three are static-feeling single-page tools served through a small Flask backend, deployed on Vercel.

## Why it's not just a form with a formula

A handful of things I cared about while building this:

- **It has to work offline.** There's a service worker that caches the app shell and pages, so if a student is on spotty school wifi it still loads and calculates locally.
- **It has to work on a cracked Android phone from 2019.** No frameworks, no build step, vanilla JS. The mobile layout was tuned by hand, not just "responsive by default."
- **It remembers your inputs.** Everything is saved to `localStorage` so you don't lose your numbers on refresh — nothing is sent to a server.
- **It's bilingual.** Full Russian and Kazakh translations, with a locale banner that offers to switch based on browser language, and URL-based locale routing (`/kk/...`).
- **It's installable.** PWA manifest + install prompts for both Android (`beforeinstallprompt`) and iOS (manual "Add to Home Screen" instructions, since Safari doesn't support the API).

## The blog

There's also a small set of long-form articles (methodology explainer, how ФО/СОР/СОЧ are calculated, the 70/30 formula, ENT grant thresholds, profile subject combinations, a fact-check on the 12-year education rumors) — written to actually be useful, with schema.org markup, an RSS feed, a sitemap, and an `llms.txt` file for anyone's AI crawler that wants a clean summary instead of scraping HTML.

## How it pays for itself

The site runs on Yandex ad units (article inline slots, a sticky footer banner, a couple of desktop side rails) plus Yandex Metrika and GA4 for basic traffic numbers. There's a lightweight, honest adblock-detection script — five different heuristics voting together — that shows a small banner asking people to whitelist the site, with a step-by-step "how to disable your blocker" page if they want to help out. If they don't, the site still works exactly the same; nothing is paywalled.

## Stack

**Backend**
- Python 3.11, Flask, Gunicorn
- Jinja2 templates, server-side i18n (no client-side translation library)
- Supabase for one thing only: a visitor counter

**Frontend**
- Vanilla JS, no build tooling
- Chart.js (lazy-loaded) for the trend graphs
- Hand-written CSS, dark/light theme with `prefers-color-scheme` fallback

**Infra**
- Vercel for hosting
- Service worker for offline caching
- IndexNow pings on deploy so search engines pick up changes fast

## Running it locally

```bash
git clone https://github.com/antonbogdan165/BilimCalc.git
cd BilimCalc
pip install -r requirements.txt
python app.py
```

Then open `http://127.0.0.1:5000`. Copy `.env.example` (or use the variables in `config.py`) if you want ads, analytics, or the visitor counter to actually do anything — none of them are required for the calculators themselves to work.

## Layout

```text
bilimcalc/
├── app.py                 # routes, sitemap, RSS, robots.txt, llms.txt
├── config.py
├── translations.py        # ru/kk strings + per-page SEO metadata
├── routes_map.py
├── indexnow.py
├── static/
│   ├── css/
│   ├── js/
│   └── icons/
└── templates/
    ├── base.html
    ├── index.html          # BilimCalc
    ├── kalkulator-ekzamena.html   # BilimExam
    ├── kalkulator-shansov-granta.html  # BilimGrant
    └── *.html              # articles
```

## Status

I still maintain this — bug fixes, content updates, occasional small features — but it's not under heavy active development. Issues and PRs are welcome if you spot something broken.

## License

CC BY-NC 4.0 — use it, learn from it, fork it for non-commercial purposes, just credit the original. Commercial use needs my OK first.

## Author

Anton Bogdan — [GitHub](https://github.com/antonbogdan165) · [bilimcalc.asia](https://bilimcalc.asia)