# CLAUDE.md

Погодный виджет-SPA: React 18 + TypeScript + Zustand + Vite, архитектура **Bulletproof React**.
Данные — OpenWeather API (прогноз + геокодинг), запасное определение локации — ipapi.co.

## Команды

```bash
npm run dev        # дев-сервер Vite
npm run build      # прод-сборка в dist/
npm run preview    # локальный просмотр прод-сборки
npm run lint       # eslint, --max-warnings 0 (в т.ч. границы архитектуры)
npm run typecheck  # tsc --noEmit
npm test           # vitest run
npm run test:watch # vitest в watch-режиме
npm run coverage   # vitest + v8 coverage
```

## Главное правило: однонаправленность

```
app  →  features  →  shared
```

Стрелки не разворачиваются никогда. **Это не соглашение, а инвариант**, который форсит
`import/no-restricted-paths` в [eslint.config.js](eslint.config.js):

1. **Фича не может импортировать из другой фичи.** Совсем.
2. **Фича не может импортировать из `app`.** Композиция течёт вниз.
3. **Shared-слой (`components`, `config`, `hooks`, `lib`, `stores`, `types`, `utils`) не может
   тянуться вверх** в `features` или `app`.

Если зона сработала — **неверна архитектура, а не конфиг**. Не отключай правило: перенеси общий
кусок вниз, в `src/{lib,utils,types,stores}`, или разверни зависимость.

Добавляешь фичу — впиши её в массив `FEATURES` в `eslint.config.js`, иначе для неё не будет зоны.

### Как фичи общаются, если им нельзя друг друга импортировать

**Через `src/stores/geolocation-store.ts`. Это шов, на котором держится вся развязка.**

`city` пишет туда координаты, когда пользователь выбирает город. `weather` на них реагирует и
перезапрашивает прогноз. Фичи `city` и `weather` **не знают о существовании друг друга** — между
ними нет ни одного импорта, и это проверяется тестом
[city-search-flow.test.tsx](src/features/city/__tests__/city-search-flow.test.tsx).

Второй способ — композиция в `src/app/`. Именно поэтому `topbar.tsx` лежит там, а не в `city`:
он собирает вместе компоненты из трёх разных фич, а это по правилам может делать только `app`.

## Структура

```
src/
  main.tsx                  точка входа (index.html смотрит сюда — не переносить)
  app/                      shell. app.tsx ~30 строк: он ничего не знает, кроме что рендерить
    components/topbar.tsx   композиция city + clock + settings
  components/ui/            общие UI-компоненты (spinner)
  config/env.ts             zod-валидация import.meta.env, падает на старте
  features/
    weather/                прогноз И панель выбранной погоды — это ОДНА фича, см. ниже
      api/  components/  hooks/  stores/  types/  utils/  __tests__/
    city/                   имя города, поиск, избранное
      api/  components/  stores/  types/  utils/  __tests__/
    settings/               меню настроек (его состояние — в shared, см. ниже)
    clock/                  часы и приветствие
  hooks/                    use-geolocation, use-notification-permission
  lib/                      api-client (ky), ip-geolocation
  stores/                   settings, geolocation, ui — сквозное состояние
  types/  utils/            общие типы и утилиты
  testing/                  setup.ts, fixtures/, mocks/ (MSW)
  scss/  fonts/  public/    ассеты и глобальные стили
```

**Имена файлов и папок — kebab-case.** Форсится `check-file`. Единственное исключение — `__tests__`.

### Почему forecast и selected-weather — одна фича

Это master/detail над одним набором данных: `selectedWeather` — проекция того `ForecastUnit`, по
которому кликнули в списке прогноза. Старые папки `forecast/` и `selected-weather/` были именами
**зон UI**, а не доменов, и именно их разделение порождало цикл между сторами. Внутри одной фичи
эта связь легальна.

### Почему settings, geolocation и ui — в shared, а не фичи

- `settings-store` читают 13 из 25 модулей. Это не фича, а ambient-состояние. **UI меню при этом
  остаётся фичей** `settings`.
- `geolocation-store` — тот самый шов между `city` и `weather` (см. выше).
- `ui-store` — какая панель открыта: `activePanel: "none" | "city-search" | "settings"`. Панели
  взаимоисключающие, и это **свойство модели**, а не ручной `setShowCitySearchMenu(false)` в
  обработчике клика. Раньше именно он и был циклом settings ↔ city.

## Конвенции

- **HTTP — только через `lib/api-client.ts`.** `ky` импортируется ровно в 2 файлах (оба в `lib/`),
  `import.meta.env` — ровно в одном (`config/env.ts`). Компоненты в сеть не ходят.
- Сетевые вызовы живут в `features/*/api/`, а не в компонентах.
- **Валидация внешних ответов — через zod.**
- Отступ 4 пробела, точки с запятой, двойные кавычки.

### Ловушка ky: `searchParams` обязан быть обычным объектом

`api-client` доклеивает `appid` ко всем запросам через deep-merge `searchParams`. **Merge работает
только если в запросе передан plain object.** Передашь `URLSearchParams` или строку — `appid` молча
исчезнет, и запрос получит 401. На это есть тест в каждом api-модуле.

Пути к `prefixUrl` дописываются **без** ведущего слеша: `"data/2.5/forecast"`, не `"/data/..."`.

### Ловушка Zustand v5: селектор не должен собирать объект

Селектор, возвращающий **новый** объект/массив, даёт новую ссылку на каждом рендере и роняет
компонент в бесконечный цикл ре-рендеров. Выбирай по одному значению; экшены и вложенные объекты
стора имеют стабильную ссылку. Нужен объект — только через `useShallow`.

Экшены стабильны, оборачивать их в `useCallback` не нужно.

## Переменные окружения

`.env` в корне (в `.gitignore`), образец — [.env.example](.env.example). Новую переменную
обязательно дописать в [src/types/vite-env.d.ts](src/types/vite-env.d.ts) **и** в схему
[src/config/env.ts](src/config/env.ts) — иначе приложение упадёт на старте с внятной ошибкой,
что и является задумкой.

| Переменная | Назначение |
| --- | --- |
| `VITE_BASE_URL` | База OpenWeather. **Со слешем на конце** — схема это проверяет |
| `VITE_API_KEY` | Ключ OpenWeather |

`.env.test` закоммичен намеренно: Vitest работает в режиме `test`, Vite подхватывает этот файл, и
схема env проходит в CI, где `.env` нет. Vite инлайнит все `VITE_*` в клиентский бандл — они не
секрет от пользователя браузера.

## Тесты

168 тестов, ~95% покрытия. vitest + jsdom + Testing Library + **MSW** + user-event.

- **MSW перехватывает на уровне fetch**, поэтому `prefixUrl`, склейка `appid`, `AbortSignal` и
  zod-парсинг выполняются по-настоящему. `onUnhandledRequest: "error"` — компонент, тайком сходивший
  в сеть, валит тест. Не мокай `ky` модульно: у мока не будет `.create`.
- **Сторы Zustand сбрасываются автоматически** между тестами ([__mocks__/zustand.ts](__mocks__/zustand.ts)).
  Исключение: `settings-store` и `starred-cities-store` читают localStorage на импорте, поэтому для
  проверки «настройки из прошлой сессии» нужен `vi.resetModules()` + динамический импорт.
- Юнит-тесты и компонентные — рядом с кодом; интеграционные потоки — в `features/*/__tests__/`.

### Две ловушки, на которые я уже наступил

1. **user-event не дружит с фейковыми таймерами.** Где нужны фейковые — используй `fireEvent`.
2. **Тест с фейковыми таймерами, упавший на середине, оставляет таймеры фейковыми и вешает все
   последующие.** `afterEach(() => vi.useRealTimers())` — безусловно.

## Известные проблемы

- **Приложение неуправляемо с клавиатуры**: клики висят на `<div>` (`forecast-cell`) и `<li>`
  (7 тогглов в `settings-menu`). `eslint-plugin-jsx-a11y` намеренно не подключён — он бы
  заблокировал реструктуризацию. Это следующий PR.
- Каталог `dist/` закоммичен и содержит инлайненный `VITE_API_KEY`.
- SCSS — один глобальный каскад: партиалы `@import`-ятся *внутрь* `.app`/`.widget`, а
  `_dark-mode.scss` перекрывает всё через `!important`. Компоненты завязаны на глобальные имена
  классов. Резать по фичам = переезд на CSS Modules; отдельный проект.
- Sass `@import` устарел, нужна миграция на `@use`.
