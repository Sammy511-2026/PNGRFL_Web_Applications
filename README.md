# PNG Rugby Football League

Production-ready React and Vite frontend for the PNG Rugby Football League website. It includes the public club, fixture, ladder, competition, and shop surfaces plus an authenticated-content workflow for administrators.

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
- `docs/BACKEND_DEVELOPMENT.md` is the backend implementation, database, security, testing, and deployment guide.

The shop and league pages also consume resource methods, so their local seed data can be replaced by API responses without changing page components.

## Backend integration

1. Implement the endpoints and response shapes in `docs/API.md`.
2. Set `VITE_API_BASE_URL` to the backend URL or a Vite development proxy.
3. Set `VITE_USE_MOCK_DATA=false`.
4. Return JSON errors with a `message` property and use ISO dates.
5. Issue a bearer token from the login and signup endpoints.

The admin dashboard currently creates team and fixture payloads and refreshes its previews after a successful response. The backend owns persistence, authorization, validation, publication state, and file storage.

## Deployment checklist

- Build with production environment variables.
- Verify CORS and `Authorization` headers.
- Serve the SPA fallback for direct routes such as `/teams/:id/overview`.
- Put image uploads behind a CDN and return stable HTTPS URLs.
- Add server-side role checks for every admin mutation.
- Disable mock mode in production.

## Accessibility and responsive behavior

The navigation has keyboard-accessible controls, forms use associated labels, errors use alert/status semantics, and layouts collapse for narrow screens. Test the public and admin routes at mobile and desktop widths before release.
