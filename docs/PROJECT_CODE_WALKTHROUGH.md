# Project Code Walkthrough

This guide explains how the PNG Rugby Football League web application is assembled. It describes the responsibilities of the project-owned source files and walks through the most important code blocks with annotated examples. It is intended to be read with the route, API, design, user, and database guides in this directory.

## What this guide covers

The examples explain the actual application patterns: startup and routing, API requests, local mock data, page loading and errors, fixture filtering, club statistics, league grouping, and administrator forms. Snippets are selected to explain the design; they are not a concatenation of every source line. Images, installed packages, generated build output, and lockfile internals are not reproduced as code.

## Application startup

`index.html` supplies the browser document and the `root` element. `src/main.jsx` creates the React root, loads the global stylesheet, and renders the app in `StrictMode`.

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

`createRoot` attaches React to the HTML mount point. `StrictMode` enables additional development checks; it does not add a production UI element. Importing `index.css` applies the shared typography, colors, and baseline layout.

`vite.config.js` installs the React plugin and sets the deployment base path. The base must match the path at which the production site is hosted; changing it affects built asset and route URLs.

## App shell and route selection

`src/App.jsx` creates the router and renders the shared navigation, route content, and footer. `BrowserRouter` uses Vite's configured base, allowing the same routes to work beneath the deployment prefix.

```jsx
export default function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <AppLayout />
    </Router>
  )
}
```

`AppLayout` uses React state for the mobile navigation and `useLocation` to react to route changes. Links use React Router's `Link`, so navigation does not reload the whole page. The `Routes` table maps paths and URL parameters to public pages and admin screens. The footer exposes the project handbook PDF, documentation ZIP, and database schema downloads.

The `teamId` route parameter selects a club; the optional `tab` parameter selects its overview, squad, fixture, ladder, honours, staff, or statistics panel. Query parameters are used by the fixture schedule to preserve selected competition, league, team, season, and round filters in the URL.

## API boundary and configuration

`src/api/client.js` is the shared HTTP boundary. The API origin and mock mode are Vite environment settings:

```js
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '')
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA !== 'false'
```

The development default enables local mock behavior. Set `VITE_USE_MOCK_DATA=false` for a real backend. Values prefixed with `VITE_` are compiled into browser-accessible code, so they must never contain database credentials or other server secrets.

The `request` function constructs JSON headers, attaches the stored bearer token when present, reads JSON or text responses, and throws `ApiError` for non-success HTTP responses. `getAuthToken`, `getAuthUser`, `setAuthToken`, and `clearAuthSession` centralize browser-local login state. Local storage is convenient for development but is not a production authorization boundary.

## Resource functions and mock persistence

`src/api/resources.js` exports operations such as `getTeams`, `getFixtures`, `getLeagues`, `createResource`, and `updateResource`. Pages depend on these functions rather than calling `fetch` directly. This keeps the UI independent of the backing data source.

Mock records are merged with seed records by stable ID. This lets an administrator's locally saved record replace the corresponding seed item without duplicating it:

```js
function getMockResource(resource, seed = []) {
    const records = new Map(seed.map(record => [String(record.id), record]))
    readMockResource(resource).forEach(record => {
        records.set(String(record.id), { ...records.get(String(record.id)), ...record })
    })
    return [...records.values()]
}
```

In mock mode, teams, fixtures, and leagues are stored in the browser's `localStorage`. The browser owner can edit this data; it is not shared between people or devices and must not be treated as a production database. With mock mode disabled, resource functions use the REST API contract in `API.md`.

## Loading, error, and retry state

`src/hooks/useApi.jsx` provides a common lifecycle for asynchronous page data. It starts in a loading state, clears an old error before each attempt, stores successful data, exposes a retry function, and ends loading whether the request succeeds or fails.

```jsx
const [data, setData] = useState(initialValue)
const [isLoading, setIsLoading] = useState(true)
const [error, setError] = useState(null)

const reload = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
        setData(await loader())
    } catch (requestError) {
        setError(requestError)
    } finally {
        setIsLoading(false)
    }
}, [loader])
```

Pages pass the returned state to `RequestState` or a page-specific loading component. This gives data-backed screens a consistent place to report a request failure and offer a retry, rather than disguising an API error as an empty successful response.

## Fixture schedule and URL-driven filters

`src/Components/fixtures/FixtureSchedule.jsx` loads fixtures, teams, and leagues through the shared resource and hook layers. `useSearchParams` keeps filter state in the address bar. Updating one filter retains the others:

```jsx
function updateParams(changes) {
    const nextParams = new URLSearchParams(searchParams)
    Object.entries(changes).forEach(([key, value]) => {
        if (value) nextParams.set(key, value)
        else nextParams.delete(key)
    })
    setSearchParams(nextParams)
}
```

The schedule derives available competition, season, and round choices from current records, then filters the fixture array. `useMemo` avoids recalculating derived lists when their inputs have not changed. It also supports exporting valid-dated fixtures as calendar events; calendar text is escaped before it is serialized.

`FixtureCard.jsx` presents an individual match. Its companion CSS files style cards and the schedule's responsive layout; the schedule component itself owns filtering and calendar behavior.

## Club profiles and calculated statistics

`src/pages/TeamDetails.jsx` reads the club ID and selected tab from the route, then loads the club, fixture list, and ladder. It matches fixtures by club ID or name for compatibility with both stable backend IDs and older seed data.

The statistics helper uses match scores when available. It calculates played matches, wins, losses, draws, points for, and points against from the club's perspective. If there are no scored matches, it falls back to saved aggregate statistics:

```js
if (pointsFor > pointsAgainst) stats.wins += 1
else if (pointsFor < pointsAgainst) stats.losses += 1
else stats.draws += 1
```

`TABS` is the single list used to build the club sub-navigation and validate the active tab. Missing club records show a not-found message; an invalid tab redirects to the overview. `PlayersList`, `TeamSkeleton`, and `RequestState` supply reusable child, loading, and error UI.

## League hierarchy

`src/data/Leagues.js` defines the region and province display hierarchy and supported 9s/13s formats. `src/pages/Leagues.jsx` loads league registrations and groups them by region, province, and optionally district. It normalizes location names/IDs because API responses may contain either form. Published registration details are rendered inside accessible expandable `details` sections.

The location hierarchy is presentation data, not proof of an administrator's authority. The backend must validate the authenticated administrator's scope for every protected write, as described in `BACKEND_INTEGRATION.md`.

## Administrator workflow and authorization boundary

`src/pages/admin/AdminDashboard.jsx` reads the signed-in profile to decide which tools to show. The following role flags support canonical role names and legacy aliases:

```js
const isSuperAdmin = role === 'super-admin' || role === 'admin'
const isRegionAdmin = role === 'region-admin' || role === 'regional-admin'
const isProvinceAdmin = role === 'province-admin' || role === 'provincial-admin'
```

The dashboard scopes its visible controls to the assigned region/province and constructs team, fixture, league, or administrator request payloads from forms. Helpers parse player/staff lines and normalize geography. `AdminLogin.jsx` handles sign-in; `AdminSignup.jsx` explains that public account creation is disabled; `Admin.css` styles the admin experience.

These checks improve the interface but are not security controls. A browser user can alter local state and send arbitrary HTTP requests. The server must derive the actor and scope from the authenticated session/token, enforce roles and locations for each endpoint, hash passwords, and audit sensitive mutations.

## Data and presentation components

| File or group | Responsibility |
| --- | --- |
| `src/Components/teams/TeamCard.jsx` and `TeamCard.css` | Reusable club summary card and its layout. |
| `src/Components/teams/PlayersList.jsx` and `PlayersList.css` | Squad/player list presentation. |
| `src/Components/fixtures/FixtureCard.jsx` and `FixtureCard.css` | Individual fixture/result presentation. |
| `src/Components/fixtures/FixtureSchedule.jsx` and `FixtureSchedule.css` | Schedule loading, filtering, round navigation, calendar export, and styling. |
| `src/Components/ui/RequestState.jsx` | Shared request loading/error/retry status. |
| `src/Components/ui/TeamSkeleton.jsx` and `TeamSkeleton.css` | Club-profile loading placeholder. |
| `src/data/Leagues.js` | Region/province hierarchy and league formats. |
| `src/data/Competitions.js` | Major competition labels used by schedule filters. |
| `src/data/Teams.jsx`, `Teams.css`, and `Fixtures.js` | Legacy seed-data compatibility exports/styles. |

## Page-by-page source guide

| Page or group | Responsibility |
| --- | --- |
| `src/pages/Home.jsx` and `Home.css` | Landing page and club preview. |
| `src/pages/Teams.jsx` and `Teams.css` | Club directory. |
| `src/pages/TeamDetails.jsx` and `TeamDetails.css` | Club profile tabs, match association, and derived statistics. |
| `src/pages/Fixtures.jsx` and `Fixtures.css` | Fixture schedule page wrapper. |
| `src/pages/MatchCentre.jsx` | Match Centre placeholder. |
| `src/pages/MatchDraw.jsx` and `MatchDraw.css` | Match draw/detail screen. |
| `src/pages/Leagues.jsx` and `Leagues.css` | Regional/provincial/district league listings. |
| `src/pages/Ladder.jsx` and `Ladder.css` | Competition standings presentation. |
| `src/pages/Shop.jsx` | Coming-soon product catalogue. |
| `src/pages/ContentPage.jsx` | Shared placeholder content for competitions, rules, and board routes. |
| `src/pages/admin/AdminLogin.jsx` | Administrator login form. |
| `src/pages/admin/AdminDashboard.jsx` and `Admin.css` | Role-aware administration interface and forms. |
| `src/pages/admin/AdminSignup.jsx` | Disabled public-signup notice. |

## Styles and visual system

`src/index.css` defines global fonts, theme variables, and baseline element behavior. `src/App.css` styles the navigation, application shell, footer, and shared layout. Page and component stylesheets are colocated with their corresponding screens/components. The `src/assets` directory contains the PNG RFL logo and locally bundled hero photographs; image binaries are intentionally not embedded in the text handbook.

## Build, quality, and deployment

`package.json` defines the Vite development server, production build, ESLint check, and preview command. `eslint.config.js` enables the project's JavaScript/React lint rules. `vite.config.js` sets the React plugin and production base path. `.github/workflows/deploy.yml` describes the GitHub Actions deployment workflow.

`npm run lint` checks JavaScript/JSX source. `npm run build` creates the production bundle in `dist/`. `npm run preview` serves that build for local verification. `npm run dev` starts local development. The project currently has no backend service or automated test suite; see `BACKEND_INTEGRATION.md` for the backend responsibilities and deployment requirements.

## Related project documentation

- `README.md`: setup, scripts, architecture, and backend integration summary.
- `docs/README.md`: documentation index and download guidance.
- `docs/PROJECT_GUIDE.md`: project tree, routes, and current limitations.
- `docs/DESIGN_AND_LAYOUTS.md`: design system, page layouts, and responsive behavior.
- `docs/USER_MANUAL.md`: public visitor and administrator workflows.
- `docs/API.md`: REST endpoint contract and request/response shapes.
- `docs/DATABASE_SCHEMA.md` and `docs/database/schema.sql`: relational model and PostgreSQL starter DDL.
- `docs/BACKEND_INTEGRATION.md`: security, backend, and operational implementation guidance.
