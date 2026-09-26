# Simple Weather

Погодный виджет: текущая погода и прогноз на 5 дней с шагом 3 часа по данным
[OpenWeather](https://openweathermap.org/api). Один и тот же `dist/` работает в двух местах:

- **веб-страница** на GitHub Pages;
- **Chrome-расширение** (Manifest V3): popup + фоновый service worker, который раз в день
  присылает уведомление «погода на завтра», даже когда popup закрыт.

## Стек

| | |
| --- | --- |
| UI | React 19 + React Compiler, Zustand 5 |
| Язык | TypeScript 7 (нативный компилятор) |
| Сборка | Vite 8 (Rolldown + Oxc), Sass (`@use`-модули) |
| Данные | ky 2, zod 4 — все внешние ответы валидируются на границе |
| Качество | oxlint + tsgolint (type-aware), oxfmt, Vitest 5 + Testing Library + MSW |
| Архитектура | Bulletproof React: `app → features → shared`, границы форсит линтер |

## Быстрый старт

Нужен Node 24 (`.nvmrc`) и бесплатный ключ OpenWeather.

```bash
nvm use            # Node из .nvmrc
npm ci
cp .env.example .env   # впиши VITE_API_KEY
npm run dev
```

## Команды

```bash
npm run dev          # дев-сервер
npm run build        # тайпчек + прод-сборка в dist/
npm run preview      # локальный просмотр прод-сборки
npm run typecheck    # tsc -b (TypeScript 7)
npm run lint         # oxlint: архитектурные зоны, type-aware правила, React Compiler, a11y
npm run format       # oxfmt (format:check - только проверка)
npm test             # vitest
npm run coverage     # vitest + покрытие с порогами
```

CI ([.github/workflows/ci.yml](.github/workflows/ci.yml)) гоняет typecheck → lint → format:check →
coverage → build на каждый push и PR, а с `main` деплоит `dist/` на GitHub Pages.

## Установка расширения локально

1. `npm run build`
2. `chrome://extensions` → включить «Режим разработчика» → «Загрузить распакованное» → папка `dist/`.

## Для разработчиков

Архитектура, соглашения и известные ловушки (ky, Zustand, React Compiler, TypeScript 7, service
worker) описаны в [CLAUDE.md](CLAUDE.md).
