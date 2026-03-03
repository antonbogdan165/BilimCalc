# 📊 BilimCalc — Калькулятор СО, СОР и СОЧ

<p align="center">
  Онлайн-калькулятор для расчёта итоговой оценки по системе СО, СОР и СОЧ (Казахстан)
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Version-1.6.0-green">
  <img src="https://img.shields.io/badge/Python-3.11-blue?logo=python">
  <img src="https://img.shields.io/badge/Flask-Backend-black?logo=flask">
  <img src="https://img.shields.io/badge/ML-Linear_Regression-orange">
  <img src="https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel">
  <img src="https://img.shields.io/badge/PWA-Ready-blueviolet">
  <img src="https://img.shields.io/badge/Status-Active-success">
  <img src="https://img.shields.io/badge/license-CC--BY--NC--4.0-lightgrey">
</p>

---

## 🎬 Демонстрация интерфейса

<video src="https://github.com/user-attachments/assets/2bb6c791-aa81-4ffa-aa8d-007a2b49a093" controls width="900"></video>

---

## 🌐 Live Demo

👉 https://bilimcalc.vercel.app

---

## 🚀 Возможности

- 📊 Расчёт СО (формативные оценки)
- 🧮 Расчёт СОР (суммативные за раздел)
- 🎯 Расчёт СОЧ (итоговая работа)
- 🤖 График динамики с ML-анализом (линейная регрессия, офлайн)
- ⚡ Автоматический пересчёт в реальном времени
- 🎨 Динамическая цветовая индикация результата
- 📱 PWA — устанавливается на главный экран (iOS + Android)
- 🔌 Офлайн-режим — работает без интернета (Service Worker)
- 📤 Кнопка "Поделиться результатом" (Web Share API)
- 🗑 Кнопка "Сбросить всё" для быстрой очистки
- 🔍 SEO-оптимизация

---

## 🧠 Как работает расчёт

Итоговая оценка рассчитывается по официальной методике МОН РК:

**СО × 25% + СОР × 25% + СОЧ × 50%**

Если СОЧ не было — (СО + СОР) × 2. ML-анализ тренда работает полностью в браузере (без сервера).

---

## 🛠 Технологический стек

### Backend
- Python 3.11
- Flask 3.0
- Gunicorn

### Frontend
- HTML5 / CSS3 / Vanilla JavaScript
- Chart.js
- PWA (Service Worker, Web App Manifest)

### Deploy
- Vercel

---

## 📦 Установка локально

```bash
git clone https://github.com/antonbogdan165/grade-calculator.git
cd grade-calculator
pip install -r requirements.txt
python app.py
```

Открой в браузере: `http://127.0.0.1:5000`

---

## 📁 Структура проекта

```
├── app.py              # Flask routes
├── logics.py           # Расчёт СО/СОР/СОЧ
├── requirements.txt
├── static/
│   ├── css/
│   │   ├── style.css
│   │   ├── article.css
│   │   ├── page-loader.css
│   │   └── pwa-banner.css
│   └── js/
│       ├── main.js       # Вся логика + ML офлайн
│       ├── theme.js
│       ├── page-loader.js
│       ├── pwa-install.js
│       └── sw.js         # Service Worker
└── templates/
    ├── index.html
    ├── base.html
    └── ...
```

---

## 📜 Лицензия

Creative Commons Attribution-NonCommercial 4.0 International

© 2026 Anton Bogdan · https://creativecommons.org/licenses/by-nc/4.0/