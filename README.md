# Senior Fullstack Coding Challenge - NewRich

A NestJS + React application demonstrating full-stack development with filtering, sorting, and drag-and-drop reordering.

## Project Structure

```
├── api/                # NestJS backend
├── web/                # React frontend
├── docker-compose.yml  # Docker orchestration
├── CHALLENGE.md        # Challenge requirements
└── README.md           # This file
```

---

## How to Run

### Backend (API)

```bash
cd api
npm install
npm start
```

The API runs on **http://localhost:3000** with endpoints:
- `GET /health` - Health check
- `GET /items` - List items with filtering/sorting

### Frontend (Web)

```bash
cd web
npm install
npm run dev
```

The frontend runs on **http://localhost:5173** and proxies API requests to the backend.

### Docker (Recommended)

> Requires [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/) installed.

```bash
docker compose up --build
```

- Frontend: **http://localhost:8080**
- API: **http://localhost:3000**

Both services start automatically. The web container waits for the API healthcheck before starting. Nginx proxies `/api` requests to the backend.

To stop:
```bash
docker compose down
```

To rebuild from scratch:
```bash
docker compose up --build --force-recreate
```

---

## How to Run Tests

### Backend Tests

```bash
cd api
npm test
```

**56 tests** covering:
- Filtering by active status (true/false/all)
- Text search (case-insensitive, trimmed)
- Category filtering
- Sorting by all columns (asc/desc)
- Combined filters
- Input validation (invalid values throw BadRequestException)
- Query parameter normalization and defaults
- Compatibility aliases (sort→sortBy, dir→sortDirection)
- Edge cases (empty strings, whitespace, unknown values)

### Frontend Tests

```bash
cd web
npm test
```

**26 tests** covering:
- Initial data loading from API
- Active status filtering
- Category filtering
- Column sorting with toggle
- Search debouncing
- Error handling (non-OK responses)
- Edge cases (non-array payloads)
- Column display
- Drag-and-drop reordering
- Loading and empty states
- Combined filters
- Category dropdown options
- Item count updates

---

## API Query Parameters

| Parameter | Values | Description |
|-----------|--------|-------------|
| `active` | `true`, `false`, `all` | Filter by active status |
| `search` | string | Text search (case-insensitive) |
| `category` | `core`, `ops`, `growth` | Filter by category |
| `sortBy` | `id`, `name`, `active`, `category`, `score`, `order` | Sort field |
| `sortDirection` | `asc`, `desc` | Sort direction |

**Example:**
```
GET /items?active=true&category=core&sortBy=score&sortDirection=desc
```

---

## Backend Module Architecture

The `api/src/items/` module follows a **separation of concerns** pattern, splitting responsibilities into focused files:

```
api/src/items/
├── item-record.ts              # Shared types & validation constants
├── data.ts                     # Static seed data (imports ItemRecord)
├── items.repository.ts         # Data access layer (returns ItemRecord[])
├── items-query.mapper.ts        # Query normalization & compatibility aliases
├── items-query.mapper.spec.ts   # Query mapper tests (41 tests)
├── items.service.ts             # Business logic (filtering, sorting)
├── items.controller.ts         # HTTP endpoint (delegates to service)
└── items.service.spec.ts       # Service unit tests (15 tests)
```

### `data.ts` — Seed Data

Static array of 6 `ItemRecord` items that `ItemsRepository` wraps. Imports `ItemRecord` from `item-record.ts`.

### `item-record.ts` — Shared Types

Single source of truth for the `ItemRecord` type and validation constants:
- `ItemRecord` — the domain entity type
- `ACTIVE_FILTERS`, `SORT_FIELDS`, `SORT_DIRECTIONS` — `const` arrays for validation
- `ActiveFilter`, `SortField`, `SortDirection` — derived union types from the arrays

### `items.repository.ts` — Data Access Layer

`@Injectable` NestJS provider that encapsulates data storage:
- `findAll()` — returns a defensive copy of `ItemRecord[]` from local seed data
- Registered in `AppModule` as a provider, injected into `ItemsService`
- Swappable with a database-backed implementation without changing the service

### `items-query.mapper.ts` — Query Normalization

Pure functions that transform raw query strings into typed, validated objects:
- `normalizeQuery()` — parses, validates, and defaults all query parameters
- **Compatibility aliases** — accepts alternative param names (e.g., `sort` → `sortBy`, `dir` → `sortDirection`)
- Throws `BadRequestException` for invalid values
- Exports `ListItemsQuery` type for the controller

### `items.service.ts` — Business Logic

Slim orchestrator that delegates to the repository and mapper:
- Receives `ItemsRepository` via dependency injection
- Calls `normalizeQuery()` to parse/validate input
- Applies filtering (active, search, category) and sorting
- Returns sorted, filtered `ItemRecord[]`

---

## Assumptions

1. **Server-side filtering**: Filtering and sorting happen on the backend for consistency.
2. **Debounced search**: 300ms debounce to reduce API calls during typing.
3. **Local drag-and-drop**: Reordering in the UI is local-only (no persistence).

---

## Design Decisions

1. **Strict type validation**: Backend validates all query parameters and throws `BadRequestException` for invalid values.
2. **@dnd-kit for drag-and-drop**: Modern, accessible, and lightweight library for React.
3. **Responsive CSS**: Mobile-first approach with card-based layout on small screens.
4. **Vitest for frontend testing**: Fast, native ESM support, good for React Testing Library.
5. **Jest for backend testing**: Standard for NestJS, works well with ts-jest.

---

## Trade-offs

1. **No persistence for reordering**: Drag-and-drop only affects UI state. With more time, add drag-and-drop API endpoint.
2. **No pagination**: All items are loaded at once. For production, add pagination.
3. **Minimal error boundaries**: Simple error display. Production would need retry logic.
4. **No loading skeleton**: Simple text loading indicator.
5. **No E2E tests**: Only component-level tests with Vitest. E2E tests with Playwright/Cypress would provide better confidence.

---

## What I Would Improve With More Time

1. **Backend:**
   - Add pagination (cursor-based or offset)
   - Implement drag-and-drop persistence endpoint
   - Add request/response logging middleware
   - More integration tests with supertest
   - Add database and persistence
   - Authentication and Authorization

2. **Frontend:**
   - Loading skeletons instead of text
   - Optimistic UI updates for drag-and-drop
   - Error boundary components
   - E2E tests with Playwright/Cypress
   - Add search suggestions/autocomplete
   - Add Dashboard and login form.

3. **Performance:**
   - React Query for data fetching/caching
   - Virtual scrolling for large datasets
   - Service worker for offline support

4. **CD/CI**
   - add github workflow file
   - Automatic deploy
   - Run tests and build the project

---

## Dependencies

### Backend
- NestJS 11.x
- TypeScript 6.x
- Jest 30.x for testing

### Frontend
- React 18.x
- Vite 5.x for bundling
- @dnd-kit for drag-and-drop
- Vitest 3.x for testing
- @testing-library/react for component tests
