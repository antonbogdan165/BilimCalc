# 📊 BilimCalc — Калькулятор СО, СОР и СОЧ

<p align="center">
  Онлайн-калькулятор для расчёта итоговой оценки по системе СО, СОР и СОЧ (Казахстан)
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Version-1.6.1-green">
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

👉 **https://bilimcalc.vercel.app**

---

## 🚀 Возможности

- 📊 Расчёт СО (формативные оценки)
- 🧮 Расчёт СОР (суммативные за раздел)
- 🎯 Расчёт СОЧ (итоговая работа)
- 🎓 **BilimExam** — итоговая оценка за год (9 и 11 класс, формула 70/30)
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

Для 9 и 11 класса применяется формула **Годовая × 70% + Экзамен × 30%**.

---

## 📚 Полезные материалы

Подробные статьи об официальной системе оценивания МОН РК:

| Тема | Ссылка |
|------|--------|
| Как рассчитать СО | [bilimcalc.vercel.app/kak-rasschitat-so](https://bilimcalc.vercel.app/kak-rasschitat-so) |
| Как рассчитать СОР | [bilimcalc.vercel.app/kak-rasschitat-sor](https://bilimcalc.vercel.app/kak-rasschitat-sor) |
| Как рассчитать СОЧ | [bilimcalc.vercel.app/kak-rasschitat-soch](https://bilimcalc.vercel.app/kak-rasschitat-soch) |
| Итоговая оценка за четверть | [bilimcalc.vercel.app/itogovaya-ocenka-za-chetvert](https://bilimcalc.vercel.app/itogovaya-ocenka-za-chetvert) |
| Итоговая оценка за год (70/30) | [bilimcalc.vercel.app/kak-rasschitat-itogovuyu-otsenku-za-god](https://bilimcalc.vercel.app/kak-rasschitat-itogovuyu-otsenku-za-god) |
| Методика расчёта МОН РК | [bilimcalc.vercel.app/metodika-rascheta-mon-rk](https://bilimcalc.vercel.app/metodika-rascheta-mon-rk) |
| Калькулятор итоговой оценки за год | [bilimcalc.vercel.app/kalkulator-ekzamena](https://bilimcalc.vercel.app/kalkulator-ekzamena) |

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
│   └── js/
└── templates/
    ├── index.html
    ├── base.html
    └── ...
```

---

## 📜 Лицензия

Creative Commons Attribution-NonCommercial 4.0 International

© 2026 Anton Bogdan · https://creativecommons.org/licenses/by-nc/4.0/