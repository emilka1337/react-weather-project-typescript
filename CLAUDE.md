# CLAUDE.md

Погодный виджет-SPA на React + TypeScript + Redux Toolkit, собирается Vite.
Данные — OpenWeather API (прогноз + геокодинг), запасное определение локации — ipinfo.io.

## Команды

```bash
npm run dev       # дев-сервер Vite
npm run build     # прод-сборка в dist/
npm run preview   # локальный просмотр прод-сборки
npm run lint      # ВНИМАНИЕ: --ext js,jsx — .ts/.tsx НЕ проверяются (см. «Известные проблемы»)
npx tsc --noEmit -p tsconfig.app.json   # проверка типов (отдельного npm-скрипта нет)
```

Тестов в проекте нет.

## Переменные окружения

`.env` в корне (в `.gitignore`, не коммитить). Все переменные объявляются в
[src/types/vite-env.d.ts](src/types/vite-env.d.ts) — при добавлении новой обязательно
дописать её туда, иначе `import.meta.env.X` не типизируется.

| Переменная | Назначение |
| --- | --- |
| `VITE_BASE_URL` | База OpenWeather. **Со слешем на конце**: `https://api.openweathermap.org/` |
| `VITE_API_KEY` | Ключ OpenWeather |
| `VITE_IPINFO_API_TOKEN` | Токен ipinfo.io для запасного определения геолокации |

`VITE_BASE_URL` уже заканчивается на `/`, поэтому пути дописываются **без** ведущего слеша:
`` `${import.meta.env.VITE_BASE_URL}geo/1.0/reverse?...` ``. Ведущий слеш даёт `//` в URL.

Помни: Vite инлайнит все `VITE_*` в клиентский бандл — они не секрет от пользователя браузера.
Тем более их не должно быть в закоммиченных артефактах сборки.

## Архитектура

```
src/
  components/   React-компоненты, сгруппированы по зонам UI
                (city-and-date/, forecast/, selected-weather/, settings/, alerts/)
  store/        Redux Toolkit: по одному слайсу на срез состояния + forecastThunk
  hooks/        useGeolocation, useDesktopNotification, useNotificationPermission, ...
  types/        Интерфейсы данных API и формы Redux-стора
  entities/     Zod-схемы для валидации внешних ответов (IPInfoResponse)
  enums/        ForecastMode
  scss/         Стили, точка входа styles.scss
```

**Поток данных:** `useGeolocation` → `geolocationSlice` → `App.getForecast` → `fetchForecast`
(thunk) → `forecastSlice` → компоненты. Прогноз кэшируется в `localStorage` под ключом
`forecastData` с полем `timeStamp`, TTL 300 секунд (`isSavedForecastDataExpired` в
[src/components/App.tsx](src/components/App.tsx)). Имя города кэшируется под
`last-saved-city-name`.

**Форма стора** описана в [src/types/State.ts](src/types/State.ts) (`ReduxState`) — держи её
в синхроне с `reducer`-объектом в [src/store/store.ts](src/store/store.ts).

## Конвенции

- **HTTP — только через `ky`**, не `fetch`/`axios`. Паттерн: `const res = await ky.get<T>(url); const data = await res.json();` в `try/catch`.
- **Валидация внешних ответов — через zod** (`src/entities/*.ts`), там же выводится тип через `z.infer`.
- Селекторы типизируются явно: `useSelector((state: ReduxState) => state.x)`.
- `dispatch` в компонентах типизируется как `AppDispatch` из `store.ts`.
- Отступ 4 пробела, точки с запятой, двойные кавычки.
- Тяжёлые компоненты — через `React.lazy` + `React.memo` (см. `City.tsx` → `CitySearch`).

### Важно: `forecastSlice` хранит `ForecastUnit[]`, а не `ForecastData`

Редьюсер `setForecast` не типизирован (`action` выводится как `any`), поэтому TypeScript
**не поймает** передачу объекта вместо массива. Всегда диспатчить `setForecast(forecastData.list)`,
а не `setForecast(forecastData)`.

### Важно: `setGeolocation` / `setForecast` — это action creators

Это создатели экшенов, а не сайд-эффекты. Вызов `setGeolocation({...})` без обёртки
`dispatch(...)` тихо создаёт объект и выбрасывает его — стор не меняется, ошибки не будет.
Всегда `dispatch(setGeolocation({...}))`.

## Известные проблемы

- `npm run lint` покрывает только `js,jsx`, а весь исходник — `.ts/.tsx`. Линт фактически ничего
  не проверяет, поэтому `react-hooks/exhaustive-deps` не ловит устаревшие замыкания в `useCallback`.
  Правь `--ext` на `ts,tsx` при первой возможности.
- Каталог `dist/` закоммичен в репозиторий и содержит инлайненные `VITE_*` ключи.
- Есть pre-существующие баги вокруг кэша прогноза и запасной геолокации — при правках в
  `App.getForecast` и `useGeolocation` сначала перечитай эти функции целиком.
