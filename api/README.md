# API - NestJS Backend

NestJS backend providing item management with filtering, sorting capabilities.

## Requirements

- Node.js 18+
- npm 9+

## Installation

```bash
npm install
```

## Running

```bash
npm start
```

API runs on **http://localhost:3000**

## Testing

```bash
npm test
```

## Endpoints

- `GET /health` - Health check
- `GET /items` - List items with filtering/sorting

### Query Parameters

| Parameter | Values | Description |
|-----------|--------|-------------|
| `active` | `true`, `false`, `all` | Filter by active status |
| `search` | string | Text search (case-insensitive) |
| `category` | `core`, `ops`, `growth` | Filter by category |
| `sortBy` | `id`, `name`, `active`, `category`, `score`, `order` | Sort field |
| `sortDirection` | `asc`, `desc` | Sort direction |
