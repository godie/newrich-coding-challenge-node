# Senior Fullstack Coding Challenge (NestJS + React)

## Overview

Welcome to the NewRich fullstack coding challenge.

You are given:

- a simple NestJS API baseline in `api/` (intentionally imperfect),
- an empty `web/` folder where you should build the React app.

Your goal is to improve the backend and build a frontend that consumes the API.

As a guideline, aim to spend around **60 minutes**.

---

## Project Structure

- `api/` - backend starter (NestJS)
- `web/` - frontend implementation area (React app to be created by you)

---

## Part 1 - Backend (NestJS)

The current API is intentionally basic and has medium-level design issues.
Refactor and improve it while preserving/clarifying behavior.

### Requirements

1. Improve code structure and separation of concerns.
2. Improve input/query validation and error handling.
3. Keep or improve filtering/sorting behavior for the items listing endpoint.
4. Keep the API simple and easy to run locally.
5. Write backend tests.

### Backend Testing (Mandatory)

Add meaningful backend tests (at least unit tests for core list/filter/sort behavior).

Your backend test suite should validate things such as:

- filtering by active status,
- text-based search,
- sorting and direction handling,
- edge-case behavior for invalid/unknown query input.

---

## Part 2 - Frontend (React)

Build a React interface in `web/` that consumes the backend API.

### Required Features

1. Display the items returned by the API.
2. Include filtering:
   - active/inactive/all,
   - text search by name,
   - at least one additional filter of your choice.
3. Column sorting:
   - click a column header to sort,
   - click again to toggle direction (asc/desc),
   - show a clear sort indicator.
4. Drag-and-drop reordering in the UI.
5. Responsive layout for desktop and mobile.

### Frontend Testing (Mandatory)

Add meaningful frontend tests (component/interaction tests).
At minimum, cover filtering and sorting interactions.
Include drag-and-drop test coverage where practical.

---

## Dependencies and Libraries

You may use third-party libraries for UI, table behavior, drag-and-drop, styling, or state management.

If you do, explain why in your solution README.

---

## Submission Requirements

In your final solution, include a `README.md` with:

1. **How to run** (backend + frontend)
2. **How to run tests** (backend + frontend)
3. **Assumptions**
4. **Design decisions**
5. **Trade-offs**
6. **What you would improve with more time**

---

## Constraints

- Backend must use Node.js with **NestJS**.
- Frontend must use **React**.
- Keep setup straightforward and runnable locally.

---

## Evaluation Criteria

The strongest signal is **architecture and separation of concerns**.
We also evaluate:

- correctness,
- backend and frontend test quality,
- code readability and maintainability,
- UI usability/responsiveness,
- communication quality in the README.
