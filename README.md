<h1 align="center">BilimCalc</h1>

<p align="center">
  Веб-приложение для расчета школьных оценок по системе МОН РК
</p>

<p align="center">
  <a href="https://bilimcalc.asia">bilimcalc.asia</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-1.8.0-22c55e?style=flat-square" alt="Version">
  <img src="https://img.shields.io/badge/python-3.11-3b82f6?style=flat-square&logo=python&logoColor=white" alt="Python">
  <img src="https://img.shields.io/badge/flask-3.0-black?style=flat-square&logo=flask" alt="Flask">
  <img src="https://img.shields.io/badge/vercel-deploy-black?style=flat-square&logo=vercel" alt="Vercel">
  <img src="https://img.shields.io/badge/pwa-ready-8b5cf6?style=flat-square" alt="PWA">
</p>

---

## О проекте

BilimCalc — веб-приложение для расчета итоговых школьных оценок по стандартам МОН РК.

Проект автоматически рассчитывает результаты на основе ФО, СОР и СОЧ с учетом официальных коэффициентов и особенностей системы оценивания для разных классов.

Основная задача проекта — предоставить быстрый и удобный инструмент, который одинаково хорошо работает как на компьютерах, так и на мобильных устройствах.

---

## Скриншот

![BilimCalc](./screenshots/main.png)

---

## Возможности

- Расчет итоговых оценок по формулам МОН РК
- Поддержка ФО, СОР и СОЧ
- Обработка случаев без СОЧ
- Поддержка системы 70/30 для 9 и 11 классов
- Работа без интернета (PWA + Service Worker)
- Установка приложения на Android и iOS
- Графики успеваемости на Chart.js
- Темная и светлая темы
- Адаптивный интерфейс для мобильных устройств

---

## Технологии

### Backend

- Python 3.11
- Flask
- Gunicorn

### Frontend

- Vanilla JavaScript
- CSS3
- Chart.js

### Infrastructure

- Vercel
- Service Worker
- Web App Manifest

### Database

- Supabase (аналитика посещений)

---

## Архитектура

- Backend отвечает за роутинг и отдачу шаблонов
- Основные вычисления выполняются на стороне клиента
- Данные пользователей не сохраняются
- Service Worker кэширует статические ресурсы для offline-режима
- Supabase используется только для аналитики посещений

---

## Локальный запуск

Для запуска проекта потребуется Python 3.11+.

```bash
# 1. Клонирование репозитория
git clone https://github.com/antonbogdan165/BilimCalc.git

# 2. Переход в папку проекта
cd BilimCalc

# 3. Установка зависимостей
pip install -r requirements.txt

# 4. Запуск сервера
python app.py
```

После запуска приложение будет доступно по адресу:

```text
http://127.0.0.1:5000
```

---

## Структура проекта

```text
bilimcalc/
├── app.py
├── logics.py
├── requirements.txt
├── static/
│   ├── css/
│   ├── js/
│   ├── icons/
│   └── manifest.json
├── templates/
│   ├── base.html
│   ├── index.html
│   └── articles/
└── vercel.json
```

---

## Статус проекта

Проект поддерживается в стабильном состоянии без активной разработки новых функций.

---

## Лицензия

Проект распространяется по лицензии CC BY-NC 4.0.

Разрешено использование, изучение и модификация проекта в некоммерческих целях с обязательным указанием авторства.

Коммерческое использование без разрешения автора запрещено.

---

## Автор

Anton Bogdan

- GitHub: https://github.com/antonbogdan165
- Website: https://bilimcalc.asia