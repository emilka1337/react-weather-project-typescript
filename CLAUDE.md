# CLAUDE.md

Погодный виджет-SPA на React + TypeScript + Zustand, собирается Vite.
Данные — OpenWeather API (прогноз + обратный геокодинг), запасное определение локации — ipapi.co.

## Команды

```bash
npm run dev        # дев-сервер Vite
npm run build      # прод-сборка в dist/
npm run preview    # локальный просмотр прод-сборки
npm run lint       # eslint по .ts/.tsx (flat-config)
npm run typecheck  # tsc --noEmit
npm test           # vitest run (jsdom + @testing-library/react)
```

## Переменные окружения

`.env` в корне (в `.gitignore`, не коммитить), образец — [.env.example](.env.example).
Все переменные объявляются в [src/types/vite-env.d.ts](src/types/vite-env.d.ts) — при
добавлении новой обязательно дописать её туда, иначе `import.meta.env.X` не типизируется.

| Переменная | Назначение |
| --- | --- |
| `VITE_BASE_URL` | База OpenWeather. **Со слешем на конце**: `https://api.openweathermap.org/` |
| `VITE_API_KEY` | Ключ OpenWeather |

`VITE_BASE_URL` уже заканчивается на `/`, поэтому пути дописываются **без** ведущего слеша:
`` `${import.meta.env.VITE_BASE_URL}geo/1.0/reverse?...` ``. Ведущий слеш даёт `//` в URL.

Помни: Vite инлайнит все `VITE_*` в клиентский бандл — они не секрет от пользователя браузера.
Тем более их не должно быть в закоммиченных артефактах сборки.

## Архитектура

```
src/
  components/   React-компоненты, сгруппированы по зонам UI
                (city-and-date/, forecast/, selected-weather/, settings/, alerts/)
  store/        Zustand: по одному стору на срез состояния
  api/          Сетевые вызовы, не привязанные к стору (fetchForecast)
  hooks/        useGeolocation, useDesktopNotification, useNotificationPermission
  types/        Интерфейсы данных API
  entities/     Zod-схемы для валидации внешних ответов (IPGeolocationResponse)
  enums/        ForecastMode
  test/         setup.ts и фикстуры для vitest
  scss/         Стили, точка входа styles.scss
```

**Стор.** Каждый срез состояния — отдельный Zustand-стор в `src/store/*Store.ts`. Это модульные
синглтоны: `Provider` не нужен, в `main.tsx` его нет. Глобального типа состояния (бывший
`ReduxState`) больше не существует — каждый стор объявляет свой интерфейс сам.

| Стор | Что хранит |
| --- | --- |
| `useSettingsStore` | `settings` + тогглы, персист в `weather-app-settings` |
| `useGeolocationStore` | `{ lat, lon }` пользователя |
| `useForecastStore` | `ForecastUnit[]` |
| `useSelectedWeatherStore` | Погода выбранной ячейки прогноза |
| `useSelectedCityStore` | Имя города |
| `useForecastModeStore` | Температура / ветер / влажность |
| `useCitySearchMenuStore` | Открыто ли меню поиска |
| `useStarredCitiesStore` | Избранные города, персист в `starredCities` |
| `useAlertsStore` | Ошибки и предупреждения |

**Поток данных:** `useGeolocation` → `useGeolocationStore` → `App.getForecast` → `fetchForecast`
(обычная async-функция в `src/api/`) → `useForecastStore` → компоненты. Прогноз кэшируется в
`localStorage` под ключом `forecastData`, TTL 300 секунд; кэш привязан к **координатам**, для
которых получен, а не к имени города (`isSavedForecastDataUsable` в
[src/components/App.tsx](src/components/App.tsx)). Имя города кэшируется под `last-saved-city-name`.

## Конвенции

- **HTTP — только через `ky`**, не `fetch`/`axios`. Паттерн: `const res = await ky.get<T>(url); const data = await res.json();` в `try/catch`.
- **Валидация внешних ответов — через zod** (`src/entities/*.ts`), там же выводится тип через `z.infer`.
- Отступ 4 пробела, точки с запятой, двойные кавычки.
- Тяжёлые компоненты — через `React.lazy` + `React.memo` (см. `City.tsx` → `CitySearch`).

### Селекторы: выбирай примитивы, не собирай объекты

В Zustand v5 селектор, возвращающий **новый** объект или массив, даёт новую ссылку на каждом
рендере и роняет компонент в бесконечный цикл ре-рендеров. Так делать нельзя:

```ts
// ПЛОХО — новый объект каждый рендер
const { lat, lon } = useGeolocationStore((s) => ({ lat: s.lat, lon: s.lon }));
```

Выбирай по одному значению за раз — экшены и вложенные объекты стора имеют стабильную ссылку:

```ts
const geolocation = useGeolocationStore((state) => state.geolocation);   // стабильная ссылка
const darkMode = useSettingsStore((state) => state.settings.darkMode);   // примитив
const setForecast = useForecastStore((state) => state.setForecast);      // экшены стабильны
```

Если объект собрать всё-таки нужно — только через `useShallow` из `zustand/react/shallow`.

### Экшены стабильны — не оборачивай их в useCallback

Функции стора создаются один раз, поэтому `useCallback(() => toggleDarkMode(), [])` — лишняя
прослойка. Передавай экшен в `onClick` напрямую. В зависимости хуков экшены класть можно и нужно:
они не вызовут лишних срабатываний.

### Персистентность настроек

`useSettingsStore` пишет в `localStorage` при каждом изменении, а `resetSettings` **удаляет** ключ
целиком (не сохраняет сброшенное состояние) — так вело себя старое Redux-middleware, и на это
опираются тесты. Формат — сырой объект `Settings`, поэтому настройки, сохранённые ещё
Redux-сборкой, продолжают читаться.

## Тесты

`npm test` — vitest в jsdom. [src/test/setup.ts](src/test/setup.ts) подменяет `localStorage`
(в Node 25 есть свой частичный глобальный `localStorage`, перекрывающий jsdom-овский),
`matchMedia` и `Notification`.

Фикстура прогноза обязана содержать ровно 40 элементов: `separateListByWeekdays` крутит
`while (count < 40)`, и на более коротком списке зациклится насмерть.

## Известные проблемы

- `City` рендерит ленивый `CitySearch` **без `Suspense`** сверху, поэтому до загрузки этого чанка
  всё дерево приостановлено и синхронно не рендерится ничего. В тестах — только `waitFor`.
- Каталог `dist/` закоммичен в репозиторий и содержит инлайненный `VITE_API_KEY`.
- `ErrorAlert` / `WarningAlert` не отрендерены нигде, а `addError` / `addWarning` не вызываются —
  `useAlertsStore` де-факто мёртв. Вдобавок `.map()` в этих компонентах не возвращает JSX.
- Остаются предупреждения `react-hooks/exhaustive-deps` в `Clocks`, `MoreWeatherInfo`,
  `SelectedTemperature`. Линт на них не падает.
