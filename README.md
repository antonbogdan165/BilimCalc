# BilimCalc

**Бесплатный онлайн-калькулятор для школьников Казахстана.**
Считает итоговую оценку за четверть и год по официальной методике МОН РК — быстро, точно и без лишних действий.

<p align="center">
  <img src="https://img.shields.io/badge/version-1.8.0-22c55e?style=flat-square">
  <img src="https://img.shields.io/badge/python-3.11-3b82f6?style=flat-square&logo=python&logoColor=white">
  <img src="https://img.shields.io/badge/flask-3.0-black?style=flat-square&logo=flask">
  <img src="https://img.shields.io/badge/deploy-vercel-black?style=flat-square&logo=vercel">
  <img src="https://img.shields.io/badge/pwa-ready-8b5cf6?style=flat-square">
  <img src="https://img.shields.io/badge/license-CC--BY--NC--4.0-64748b?style=flat-square">
</p>

<br>

## Зачем это нужно

Каждый раз перед концом четверти сотни тысяч учеников и родителей по всему Казахстану пытаются вручную посчитать итоговую оценку. Гуглят формулы, считают в обычном калькуляторе, ошибаются.

BilimCalc решает эту задачу за секунды. Никаких лишних шагов — просто вводишь свои оценки и сразу видишь результат.

> Сайт работает полностью бесплатно, без рекламы в интерфейсе и без регистрации.

**→ [bilimcalc.vercel.app](https://bilimcalc.vercel.app)**

<br>

## Что умеет BilimCalc

#### Калькулятор четверти
Расчёт итоговой оценки по официальной формуле МОН РК:
**ФО × 25% + СОР × 25% + СОЧ × 50%**

Поддерживает несколько ФО, несколько СОР с разными максимумами и один СОЧ. Если СОЧ не было — считает по формуле `(ФО + СОР) × 2`.

#### BilimExam — итоговая за год
Отдельный калькулятор для учеников 9 и 11 классов. Формула **70/30**: годовая оценка × 70% + экзамен × 30%. Показывает, какой балл нужен на экзамене для «3», «4» или «5».

#### AI-анализ динамики
При вводе двух и более ФО строит график с трендом на основе линейной регрессии. Работает полностью в браузере, без сервера.

#### Работает офлайн
Service Worker кэширует все страницы и ресурсы. Сайт открывается даже без интернета.

#### Устанавливается на телефон
PWA с поддержкой iOS и Android. Добавляется на главный экран, запускается как обычное приложение.

<br>

## Как считается оценка

| Компонент | Описание | Вес |
|-----------|----------|-----|
| ФО | Среднее всех формативных оценок (шкала 1–10) | 25% |
| СОР | Среднее процентов за суммативные по разделам | 25% |
| СОЧ | Суммативное за четверть | 50% |

Итоговый процент переводится в оценку: **85%+ → 5**, 65–84% → 4, 40–64% → 3, ниже 40% → 2.

Для 9 и 11 классов: `Итог = Годовая × 0.70 + Экзамен × 0.30`

<br>

## Стек

```
Backend     Flask 3.0 · Python 3.11 · Gunicorn
Frontend    Vanilla JS · Chart.js · CSS3
Deploy      Vercel
PWA         Service Worker · Web App Manifest
DB          Supabase (счётчик посещений)
```

<br>

## Быстрый старт

```bash
git clone https://github.com/antonbogdan165/grade-calculator.git
cd grade-calculator
pip install -r requirements.txt
python app.py
```

Открой в браузере: `http://127.0.0.1:5000`

<br>

## Структура проекта

```
bilimcalc/
├── app.py              # Роуты Flask
├── logics.py           # Формула расчёта ФО / СОР / СОЧ
├── requirements.txt
├── static/
│   ├── css/            # Стили (dark/light тема, PWA, статьи)
│   └── js/             # Логика расчётов, тренд, SW
└── templates/
    ├── base.html        # Базовый шаблон
    ├── index.html       # Главная страница
    ├── kalkulator-ekzamena.html   # BilimExam
    └── ...              # Статьи и утилиты
```

<br>

## Контент

Помимо калькулятора, на сайте есть база статей по системе оценивания МОН РК:

- [Как рассчитать ФО](https://bilimcalc.vercel.app/kak-rasschitat-so)
- [Как рассчитать СОР](https://bilimcalc.vercel.app/kak-rasschitat-sor)
- [Как рассчитать СОЧ](https://bilimcalc.vercel.app/kak-rasschitat-soch)
- [Итоговая оценка за четверть](https://bilimcalc.vercel.app/itogovaya-ocenka-za-chetvert)
- [Итоговая оценка за год (70/30)](https://bilimcalc.vercel.app/kak-rasschitat-itogovuyu-otsenku-za-god)
- [Как перевести проценты в оценку](https://bilimcalc.vercel.app/kak-perevesti-procenty-v-otsenku)
- [Методика расчёта МОН РК](https://bilimcalc.vercel.app/metodika-rascheta-mon-rk)

<br>

## Лицензия

[CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/) — можно использовать и адаптировать в некоммерческих целях с указанием автора.

© 2026 Anton Bogdan
