# Project and Code Guide

## Overview

The project is a single-page React application built with Vite. React Router owns client-side routes; `src/api` is the boundary between screens and an HTTP API or local mock data. The production base path is fixed in `vite.config.js` to `/PNGRFL_Web_Applications/`.

## Start and validate

Requirements: Node.js compatible with Vite 7 and npm.

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
npm run lint
npm run build
npm run preview
```

PowerShell may block the `npm.ps1` shim under restrictive execution policies. Use `npm.cmd` from PowerShell in that case. The dev server prints the local URL. Vite uses the configured base path for this app.

## Project structure

```text
.
|-- docs/                       API, design, user, database, backend guides
|   `-- database/schema.sql     PostgreSQL starter DDL and region seed data
|-- public/downloads/           Downloadable documentation archive
|-- src/
|   |-- App.jsx                 Site shell, navigation, and routes
|   |-- App.css                 Global navigation, shared page and component styles
|   |-- index.css               Global typography, theme variables, base rules
|   |-- main.jsx                React root
|   |-- api/
|   |   |-- client.js           Fetch wrapper, errors, bearer token, mock-mode flag
|   |   |-- resources.js        Resource readers/writers and development seed data
|   |   `-- teamsApi.js          Team/ladder compatibility exports
|   |-- assets/                 Logo, hero photos, merchandise assets
|   |-- Components/
|   |   |-- fixtures/            Fixture card and styles
|   |   |-- teams/               Club cards and roster list
|   |   `-- ui/                  Loading/error states and skeletons
|   |-- data/                    Region/province and legacy seed data
|   |-- hooks/useApi.jsx         Loading, error, retry, and data state
|   `-- pages/
|       |-- admin/                Login, dashboard, styles, account notice
|       `-- ...                  Public route pages and page styles
|-- .env.example                 Vite API and mock-mode defaults
|-- eslint.config.js             ESLint flat config
|-- index.html                   HTML shell and initial theme
|-- package.json                 Scripts and dependencies
`-- vite.config.js               React plugin and deployment base path
```

## Route map

| Route | Screen | Data source / status |
| --- | --- | --- |
| `/` | Home, hero and club preview | `GET /teams` |
| `/teams` | Club directory | `GET /teams` |
| `/teams/:teamId` | Club overview | `GET /teams/:id`, fixtures, ladder |
| `/teams/:teamId/:tab` | Overview, squad, fixtures, ladder, honours, staff, stats | Profile and shared match data |
| `/fixtures` | Fixture and result list | `GET /fixtures` |
| `/matches` | Match Centre placeholder | Static text only |
| `/leagues` | Region/province/district 9s and 13s | `GET /leagues` |
| `/ladder` | Competition standings | `GET /ladder` |
| `/shop` | Coming-soon products | `GET /products` fallback |
| `/admin` | Admin login | `POST /auth/login` |
| `/admin/dashboard` | Role-scoped content tools | Admin, team, fixture, and league endpoints |
| `/admin/signup` | Account creation notice | Static; public registration is disabled |
| `/competitions`, `/rules`, `/board` | Generic information placeholders | Static content in `ContentPage.jsx` |

The global navigation currently routes “Fixtures” and “Results” to `/fixtures`. There is no catch-all 404 route.

## Important source responsibilities

- `src/App.jsx`: navigation, footer, routes, and Router basename.
- `src/pages/TeamDetails.jsx`: club tabs; associates matches with both clubs and calculates score-derived statistics.
- `src/pages/admin/AdminDashboard.jsx`: admin role checks for presentation, profile/fixture/league forms, and scoped previews.
- `src/api/client.js`: API base URL, mock flag, fetch behavior, and local token/profile storage.
- `src/api/resources.js`: HTTP resource functions and browser-local mock records. Mock teams, fixtures, and leagues share a localStorage key; this is not cross-device persistence.
- `src/data/Leagues.js`: four region/province display hierarchy and competition formats.
- `src/hooks/useApi.jsx`: request lifecycle for pages.
- `src/Components/ui/RequestState.jsx`: common loading/error/retry presentation.

## Data flow

Page components use resource functions and `useApi`; they should not call `fetch` directly. In mock mode, resource reads merge seed records with browser-local submissions. Writes to teams, fixtures, and leagues are immediately readable by public pages in that same browser. Admin creation is preview-only in mock mode. With mock mode off, the API client sends requests to `VITE_API_BASE_URL`, attaches a bearer token, and expects JSON.

The frontend's dashboard scope restrictions are not authorization. Every protected write and scoped list must also be enforced by the backend using the authenticated principal.

## Current limitations

- The repository contains no backend, database, migration tooling, or real account bootstrap.
- Mock login is development-only and returns a super-admin profile for any submitted email/password that passes browser form validation.
- Local mock data is per-browser and can be edited by the browser owner; it is not suitable for production.
- The match centre, rules, board, competitions, and commerce checkout are placeholders or coming-soon experiences.
- Build and lint commands exist; there is no automated test suite in this repository at the time of writing.