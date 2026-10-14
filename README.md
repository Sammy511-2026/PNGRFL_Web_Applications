# PNG Rugby Football League

React and Vite frontend for the PNG Rugby Football League website. It includes public club, fixture, ladder, league, competition, and shop surfaces plus a role-scoped admin workflow. A production API and database are not included in this repository.

## Quick start

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

The development server prints the local URL. Mock mode is enabled by default, so the public screens are usable before a backend exists.

## Environment

| Variable | Default | Purpose |
| --- | --- | --- |
| `VITE_API_BASE_URL` | `/api` | REST API origin or local proxy path. |
| `VITE_USE_MOCK_DATA` | `true` | Use local seed data until the backend is available. |

Set `VITE_USE_MOCK_DATA=false` in staging and production. Configure the backend to allow the deployed frontend origin and to support the endpoints in [docs/API.md](docs/API.md).

## Commands

```powershell
npm run dev       # Start Vite development server
npm run lint      # Run ESLint
npm run build     # Create the production bundle
npm run preview   # Preview the production bundle locally
```

## Architecture

- `src/App.jsx` owns routing and the shared site shell.
- `src/pages` contains public and admin route screens.
- `src/Components` contains reusable presentation components.
- `src/api/client.js` owns HTTP, auth headers, JSON parsing, and API errors.
- `src/api/resources.js` owns resource paths, request payloads, and development seed data.
- `src/hooks/useApi.jsx` provides loading, retry, and error state handling.
- `src/assets` contains local logos and hero imagery.
- `docs/API.md` is the backend integration contract.
- `docs/README.md` is the documentation index.
- `docs/PROJECT_GUIDE.md` maps the code and routes.
- `docs/DESIGN_AND_LAYOUTS.md` documents visual patterns and responsive layouts.
- `docs/USER_MANUAL.md` explains public and administrator workflows.
- `docs/DATABASE_SCHEMA.md` and `docs/database/schema.sql` describe a PostgreSQL starter model.
- `docs/BACKEND_INTEGRATION.md` covers service, security, testing, and deployment requirements.

The shop and league pages also consume resource methods, so their local seed data can be replaced by API responses without changing page components.

## Backend integration

1. Implement the endpoints and response shapes in `docs/API.md`.
2. Set `VITE_API_BASE_URL` to the backend URL or a Vite development proxy.
3. Set `VITE_USE_MOCK_DATA=false`.
4. Return JSON errors with a `message` property and use ISO dates.
5. Issue a bearer token (or an appropriately protected session) from the login endpoint.

The admin dashboard creates and updates club profiles, adds fixtures/results, provisions scoped admins, and records league registrations. The backend owns persistence, authorization, validation, publication state, ladder policy, audit history, and file storage.

The admin panel supports a super administrator creating regional and provincial admin accounts, and scoped admins submitting Rugby League 9s and 13s registrations. The API must enforce each user's role and assigned region/province on every request; browser-side scope controls are only for usability. In mock mode, league, team, and fixture submissions are stored in this browser and appear on their public pages; administrator accounts still require a backend and are not saved locally.

## Documentation download

The project handbook PDF is downloadable from the website footer or [public/downloads/PNG-RFL-Project-Handbook.pdf](public/downloads/PNG-RFL-Project-Handbook.pdf). It combines the developer guides, user manual, explained code walkthrough, API contract, and PostgreSQL starter schema. Source documents are indexed in [docs/README.md](docs/README.md). Regenerate the PDF after documentation changes with `npm run docs:pdf`.

The complete developer guides and database blueprint are also available from [public/downloads/PNG-RFL-Documentation.zip](public/downloads/PNG-RFL-Documentation.zip).

## Deployment checklist

- Build with production environment variables.
- Verify CORS and `Authorization` headers.
- Serve the SPA fallback for direct routes such as `/teams/:id/overview`.
- Put image uploads behind a CDN and return stable HTTPS URLs.
- Add server-side role checks for every admin mutation.
- Disable mock mode in production.

## Accessibility and responsive behavior

The navigation has keyboard-accessible controls, forms use associated labels, errors use alert/status semantics, and layouts collapse for narrow screens. Test the public and admin routes at mobile and desktop widths before release.
