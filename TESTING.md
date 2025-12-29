# Тесты (Jest)

В проект добавлен Jest + TypeScript + React Testing Library.

## Установка

После обновления `package.json` поставь зависимости:

```bash
npm install
```

## Команды

- Запуск всех тестов: `npm test`
- Watch режим: `npm run test:watch`
- Coverage: `npm run test:coverage`

> В скриптах используется `NODE_OPTIONS=--experimental-vm-modules`, потому что проект на ESM (`"type": "module"`).

## Как это работает

**Jest** запускает тесты в Node.js, а для UI‑тестов используется окружение **jsdom** (виртуальный браузер).

### Конфигурация

- `jest.config.cjs`:
  - `testEnvironment: "jsdom"` — чтобы можно было рендерить React‑компоненты.
  - `transform` через `ts-jest` — чтобы Jest понимал `.ts/.tsx`.
  - `moduleNameMapper`:
    - алиас `~/*` → `app/*`
    - стили (`.css/.scss`) мокаются через `identity-obj-proxy`
- `jest.setup.ts`:
  - подключает `@testing-library/jest-dom` (матчеры типа `toBeInTheDocument()`)
  - добавляет простой stub `ResizeObserver` (часто нужен компонентам)

### Где лежат тесты

Jest ищет файлы `*.test.ts` / `*.test.tsx` в папке `app/`.

Примеры:
- unit‑тесты утилит: `app/api/pagination.test.ts`
- unit‑тесты стора: `app/api/system/system-store.test.ts`
- компонентные тесты (рендер): `app/ui/charts/donut-chart.test.tsx`

## Как писать тесты

### Unit (чистые функции)

Тестируем вход → выход:

```ts
expect(normalizePage("3.9", 1)).toBe(3);
```

### React компоненты

Используем RTL:

```ts
render(<DonutChart segments={[...]} />);
expect(screen.getByText("Нет данных")).toBeInTheDocument();
```

## Полезные советы

- Держи логику (нормализация, вычисления, форматирование) в отдельных функциях — так тестировать проще.
- Для запросов к API лучше тестировать слой “api” отдельно, мокая HTTP (позже можно добавить `msw` или моки axios).
