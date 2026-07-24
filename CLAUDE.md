# CLAUDE.md

Погодный виджет-SPA: React 18 + TypeScript + Zustand + Vite, архитектура **Bulletproof React**.
Данные — OpenWeather API (прогноз + геокодинг), запасное определение локации — ipapi.co.

Один и тот же `dist/` едет в **два таргета**: как popup Chrome-расширения (Manifest V3) и как
обычная веб-страница на GitHub Pages. Всё, что зависит от `chrome.*`, спрятано за feature-detection
(`isExtension()` в [src/lib/extension.ts](src/lib/extension.ts)) — на Pages это no-op, там работают
веб-API. См. раздел **Расширение Chrome**.

## Команды

```bash
npm run dev        # дев-сервер Vite
npm run build      # тайпчек (tsc -b) + прод-сборка в dist/
npm run preview    # локальный просмотр прод-сборки
npm run lint       # eslint, --max-warnings 0 (границы архитектуры + jsx-a11y)
npm run typecheck  # tsc -b --noEmit (проверяет и src, и vite.config.ts)
npm test           # vitest run
npm run test:watch # vitest в watch-режиме
npm run coverage   # vitest + v8 coverage (пороги форсятся: см. thresholds в vite.config.ts)
```

## CI и деплой

[.github/workflows/ci.yml](.github/workflows/ci.yml): на каждый push/PR — `npm ci` → typecheck →
lint → coverage → build; на `main` дополнительно собирает `dist/` и деплоит его на GitHub Pages через
`actions/deploy-pages`. Поэтому **`dist/` больше не коммитится** (в `.gitignore`) — CI собирает и
публикует сам, и корень Pages отдаёт **собранное** приложение, а не дев-`index.html`. Источник Pages
в настройках репо переключён на **GitHub Actions** (не branch-деплой). Node запинен: `engines: >=20`
+ `.nvmrc` (CI на 22).

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
  main.tsx                  точка входа popup/Pages (index.html смотрит сюда — не переносить)
  background.ts             service worker расширения — второй вход, только в Chrome, см. ниже
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
  hooks/                    use-geolocation, use-notification-permission, use-extension-storage-sync
  lib/                      api-client (ky), ip-geolocation, extension (мост к chrome.*)
  stores/                   settings, geolocation, ui — сквозное состояние
  types/  utils/            общие типы и утилиты
  testing/                  setup.ts, fixtures/, mocks/ (MSW)
  scss/  fonts/  public/    ассеты и глобальные стили
```

`background.ts` лежит в корне `src/` рядом с `main.tsx` не случайно: как и `main.tsx`, это **точка
входа**, а не слой. По зонам ESLint он вне всех `target`, поэтому — как `app` — может импортировать
из `features` и `shared` (ему нужны `weather/api` и `weather/utils`). Обычным модулям так нельзя.

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

## Расширение Chrome (два таргета)

Сборка кладёт в `dist/` **два входа**: `index.html` (+ хешированные чанки) — popup и Pages, и
`background.js` — service worker. Мультивход и стабильное имя воркера настроены в
[vite.config.ts](vite.config.ts) (`rollupOptions.input` + `entryFileNames`: `background` без хеша,
остальное с хешем). Воркер — `"type": "module"`, поэтому легально импортирует общий чанк через
`./assets/...`. Манифест ([src/manifest.json](src/manifest.json)) копируется в `dist/` тем же
`vite-plugin-static-copy`, а его `version` **переписывается из `package.json` на сборке** — один
бамп, и Web Store всегда видит новую версию.

### Зачем воркер: уведомления при закрытом popup

Popup уничтожается в момент закрытия. Веб-`Notification`, созданный из него, умирает вместе со
страницей — то есть уведомление «погода на завтра» могло всплыть только пока окно открыто, что
бессмысленно. Поэтому уведомлениями в расширении владеет **`background.ts`**: `chrome.alarms` раз в
час будит воркер, тот читает координаты и флаг из `chrome.storage`, тянет прогноз тем же
`weather/api/get-forecast`, и шлёт `chrome.notifications` — **не чаще раза в календарный день**
(маркер `weather-last-notified-ymd`). Иконка — **упакованный** ресурс (`favicon/android-chrome-192x192.png`),
удалённый URL в `chrome.notifications` не грузится.

### Шов popup ↔ worker: `chrome.storage`

Воркер не видит ни localStorage, ни in-memory Zustand-сторов popup. Popup остаётся источником правды
на localStorage (это же держит Pages синхронным), но **дополнительно зеркалит нужный воркеру срез** —
координаты и `showNotifications` — в `chrome.storage.local` через
[use-extension-storage-sync.ts](src/hooks/use-extension-storage-sync.ts). Весь доступ к `chrome.*`
инкапсулирован в [lib/extension.ts](src/lib/extension.ts) (`isExtension`, `extensionAssetUrl`,
read/write состояния). **`chrome` как глобал разрешён ровно в двух файлах** — `background.ts` и
`lib/extension.ts` (override в [eslint.config.js](eslint.config.js)).

### Двойной таргет без двойных уведомлений

На Pages `chrome` нет → `isExtension()` ложно → работают веб-API. Ключевой момент: веб-путь
уведомления ([use-tomorrow-forecast-notification.ts](src/features/weather/hooks/use-tomorrow-forecast-notification.ts))
и запрос веб-permission ([use-notification-permission.ts](src/hooks/use-notification-permission.ts))
**самино-опятся внутри расширения** (`if (isExtension()) return`), иначе popup и воркер слали бы по
два уведомления. Это проверено тестом
[use-tomorrow-forecast-notification.test.tsx](src/features/weather/hooks/use-tomorrow-forecast-notification.test.tsx).

### Ловушка: воркер не должен тянуть DOM-код

`background.ts` крутится в service worker — там нет `window`/`document`. Общий чанк, который он
импортирует, содержит только `env`, `api-client` (ky), `zod`, `weather/api|utils`, `lib/extension` —
ни один не трогает DOM на верхнем уровне. Импортируешь в воркер что-то, что на импорте лезет в
`window`, — воркер падает на старте. React в этот чанк не попадает: его тянет только popup.

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
схема env проходит в CI, где `.env` нет. Vite инлайнит все `VITE_*` в клиентский бандл (и в
`background.js` тоже — там `import.meta.env` тоже статически заменяется) — они не секрет от
пользователя браузера. В расширении ключ **в принципе** уезжает к каждому пользователю: чисто
фронтовый клиент не может его спрятать. Считай `VITE_API_KEY` публичным — free-tier с лимитами,
готовый к ротации.

## Тесты

204 теста, ~97% покрытия (пороги форсятся в CI). vitest + jsdom + Testing Library + **MSW** + user-event.

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

## Доступность (a11y)

`eslint-plugin-jsx-a11y` подключён и форсится тем же `--max-warnings 0`. Всё интерактивное —
нативные элементы, чтобы фокус и Enter/Space работали даром:

- Ячейка прогноза — `<button>` с `aria-pressed` и `aria-label`. Какая ячейка активна, **выводится
  из стора** (`selectedTimestamp` в `selected-weather-store`), а не из `document.querySelectorAll`.
- Тоггл настройки — `<button role="switch" aria-checked>` во всю строку ([setting-toggle.tsx](src/features/settings/components/setting-toggle.tsx)).
- Переключатели режима и иконочные кнопки — с `aria-label` (у иконок нет текста).
- **Фокус виден**: глобальный `:focus-visible`-ринг в [styles.scss](src/scss/styles.scss), светлый
  и тёмный варианты. Без него клавиатурная навигация бесполезна.
- **Escape** закрывает открытую панель ([use-close-panel-on-escape.ts](src/hooks/use-close-panel-on-escape.ts)),
  а поле поиска города фокусируется при открытии панели.

Не сделано (осознанно): возврат фокуса на триггер при закрытии панели, и roving-tabindex для
ленты прогноза (сейчас 40 нативных кнопок = 40 остановок Tab).

## Известные проблемы

- `VITE_API_KEY` инлайнится в собранный бандл, который CI деплоит на Pages, — для чисто фронтового
  клиента он публичен в принципе (см. «Переменные окружения»), держи на free-tier с лимитами. `dist/`
  больше не коммитится (CI собирает и деплоит), но ключ уже лежит в **старой** истории git — стоит ротировать.
- **Геолокация в popup не проверена вживую.** `navigator.geolocation` на origin
  `chrome-extension://` в MV3 — известная точка отказа; при провале приложение уходит в IP-fallback
  (ipapi.co). [use-geolocation.ts](src/hooks/use-geolocation.ts) логирует, какой путь сработал
  (`[geo] browser position acquired` против `[geo] using IP-based fallback`) — надо открыть popup,
  посмотреть консоль и, если браузерный путь стабильно падает, перенести геолокацию в offscreen-документ.
- Уведомления в расширении не привязаны ко времени суток: `chrome.alarms` будит воркер раз в час, и
  первое срабатывание после смены даты шлёт «завтра». Осмысленного «утреннего» времени без работы с
  таймзоной пока нет.
- SCSS — один глобальный каскад: партиалы `@import`-ятся *внутрь* `.app`/`.widget`, а
  `_dark-mode.scss` перекрывает всё через `!important`. Компоненты завязаны на глобальные имена
  классов. Резать по фичам = переезд на CSS Modules; отдельный проект.
- Sass `@import` устарел, нужна миграция на `@use`.
