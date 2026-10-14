# Backend Integration and Operations Guide

## 1. Purpose and current state

This frontend expects a JSON REST API. There is currently no server or database in this repository. Implement the contract in [API.md](API.md) and schema in [database/schema.sql](database/schema.sql), review official data and security rules, then configure the frontend to use the deployed API.

The frontend's `VITE_USE_MOCK_DATA` default is `true`. Mock login grants a development super-admin session for any nonempty email/password. Mock teams, fixtures, and leagues persist in browser localStorage only. This mode is strictly for local preview and must be disabled in every shared, staging, and production environment.

## 2. Recommended service boundaries

The specific backend framework is not prescribed. Keep these responsibilities explicit regardless of language:

- HTTP/API layer: input validation, authentication, authorization, status codes, response serialization.
- Domain/service layer: account scope, league publication, fixture result/stat calculation, admin audit.
- Repository/data layer: parameterized SQL, transactions, migrations.
- Media service: validated image upload and stable HTTPS URLs; do not store image binaries in JSON columns.
- Operations layer: secrets, backups, logging, rate limits, health/readiness checks, and monitoring.

Use PostgreSQL with versioned migrations based on the included starter schema. A single request that changes a club and replaces its player/staff/honours collections should use a transaction.

## 3. Configuration

Frontend variables are compile-time Vite variables:

```dotenv
VITE_API_BASE_URL=https://api.example.org
VITE_USE_MOCK_DATA=false
```

Do not put private keys, database credentials, signing secrets, or third-party secret tokens in `VITE_*`; they are exposed to the browser bundle. Configure backend secrets only in the server deployment secret store. If API and frontend share an origin, `/api` can be reverse-proxied to the backend.

The Vite `base` is currently `/PNGRFL_Web_Applications/`. Production hosting must serve the built frontend under that prefix and return `index.html` for client-side routes. Keep API URLs independent of the frontend base path.

## 4. Authentication and authorization

### Login contract

`POST /auth/login` accepts email/password and returns a short-lived signed access token and a sanitized user profile. Store only a password hash server-side. Rate-limit login, use a modern password hashing function (Argon2id preferred; bcrypt with appropriate cost is an alternative), use TLS, and avoid account enumeration in errors.

The frontend currently stores the bearer token and profile in localStorage. For a production deployment, consider a same-site, Secure, HttpOnly cookie/BFF design to reduce token exposure to XSS. If bearer tokens are retained, use short expiry, rotation/revocation, strong CSP, dependency updates, and XSS defenses. Never trust the profile/scope copied into localStorage for authorization.

### Roles

| Role | Allowed writes |
| --- | --- |
| `super-admin` | Admin accounts, all clubs, fixtures, and league registrations |
| `region-admin` | League registrations inside token's assigned region |
| `province-admin` | League registrations inside token's assigned province |

The frontend also treats legacy `admin` as super-admin and recognizes `regional-admin` / `provincial-admin` aliases. Prefer canonical role names in new backend responses. Do not allow regional/provincial users to create admins, edit clubs, or write fixtures unless a separate approved policy is added.

Authorization must derive actor ID and role/scope from the verified token/session for every protected request. Reject rather than silently widen mismatched scopes. Filter admin list responses server-side. Log account creation, profile mutations, result changes, and publication changes in an audit trail.

### Admin provisioning

`POST /admins` must be super-admin-only. Validate role/scope combinations and the `(province, region)` relationship. The example frontend form sends an initial password, so the backend must hash it immediately and avoid returning it or logging it. Prefer an invite/reset link with a one-time token over transmitting a reusable password; if that flow is chosen, update the frontend contract accordingly. Never bootstrap a default production password in source control.

## 5. Endpoint implementation checklist

Use JSON request/response bodies, ISO-8601 timestamps, UTF-8, and stable IDs. Details and examples are in [API.md](API.md).

1. `POST /auth/login`: authenticate; issue token/profile.
2. `POST /admins`: super-admin account provisioning.
3. `GET /teams`, `GET /teams/:id`, `POST /teams`, `PATCH /teams/:id`: public published profiles; protected create/update. Include players/staff/honours and profile stats in the detail response.
4. `GET /fixtures`, `POST /fixtures`, `PATCH /fixtures/:id`: public schedule/results; protected writes. Validate clubs, date, status, score pair, and competition.
5. `GET /ladder`: return the selected/current competition standings. Define competition selection and ladder scoring with PNG RFL; do not hard-code an unapproved points policy.
6. `GET /leagues`, `POST /leagues`, `PATCH /leagues/:id`: public published registrations; scoped writes. Store club associations relationally.
7. `GET /products`: current shop fallback contract. The frontend has no checkout API; do not imply products are purchasable until order/payment flows exist.
8. Optional later endpoints: media upload, admin list/status management, fixture deletion/postponement, password reset, account disable, and moderation.

Apply pagination/filtering before datasets grow. The current frontend expects arrays for list reads; either preserve that contract for small lists or update frontend consumers to support `{ data, page, pageSize, total }` before introducing paginated responses.

## 6. Data rules and response shapes

- Return club `id` and `name`; fixtures must refer to those IDs (the current UI can also match exact names as a compatibility fallback).
- Normalize club profile children into player, staff, and honours tables; serialize them as arrays for `GET /teams/:id`.
- A fixture score is either both integer scores or neither. A completed match requires a score. Keep home/away score order canonical in the API.
- The club detail frontend derives its perspective from home/away and score. Its ladder row expects `team` or `name`, `position`, `played`, `wins`, and `points`.
- League format is exactly `9s` or `13s` for the current admin UI. Location identifiers should match those in `src/data/Leagues.js`.
- Explicitly separate `registration_status` from `publication_status`: a registered item should not automatically become public without the approved publication workflow.
- User-controlled content should be escaped by the rendering framework and validated server-side. Validate image URLs/protocols, email, phone length, names, scores, season, arrays, and maximum payload sizes.

## 7. Error and HTTP conventions

Use conventional status codes: `200` reads/updates, `201` creates, `204` deletes, `400` malformed input, `401` unauthenticated, `403` wrong role/scope, `404` missing item, `409` duplicate/conflict, `422` field validation, `429` throttling, and `500` unexpected server errors. The frontend reads an error `message` property.

```json
{
  "message": "The selected province is outside your assigned region.",
  "code": "SCOPE_MISMATCH",
  "details": { "field": "province" },
  "requestId": "req-abc123"
}
```

Never send stack traces, SQL errors, password hashes, internal tokens, or private player data in public errors.

## 8. Database and transaction plan

Use the PostgreSQL starter schema as a reviewed baseline. Required invariants include:

- Unique login email and unique club slug.
- Referential integrity from districts to provinces and provinces to regions.
- Scope constraints for each admin role.
- Distinct home and away teams, valid paired match scores, and completed status requiring scores.
- League format and registration/publication status checks.
- Soft-disable admin accounts rather than deleting their audit history.

Write a match score and its derived season totals atomically, or derive ladder data using a view/query. If aggregate stats are cached, make recalculation idempotent and trigger it on every score/status correction. Record who changed a result and when. Confirm the official ladder scoring rule before production calculations.

## 9. Media and privacy

The frontend accepts URL/path fields for logos, banners, player photos, and staff photos. Production should use an authenticated upload service, validate file type and size, strip metadata where appropriate, virus-scan uploads, store outside the web root, and return stable HTTPS URLs. Do not accept arbitrary `file:` or `javascript:` URLs.

Obtain required consent for player/staff images and biographies, especially for minors. Publish only approved fields. The public team response must never include admin email, private phone, password, safeguarding data, or moderation notes.

## 10. Testing plan

### API tests

- Login valid/invalid credentials, disabled accounts, rate limits, expiry/revocation.
- Super-admin can create regional/provincial users; scoped users receive `403`.
- Province outside a user's region is rejected; regional/provincial writes outside scope fail.
- Public reads omit drafts and private fields.
- Club create/update includes and replaces child collections transactionally.
- Fixture score rules, home/away club validation, status transitions, and score corrections recalculate stats.
- League location, format, club associations, registration/publication state, and duplicates.
- Database constraints and rollback behavior.

### Frontend integration tests

- Set `VITE_USE_MOCK_DATA=false` against a test API.
- Login as each role and confirm forms/records are scoped.
- Add/update a club; confirm public overview, squad, staff, honours, and stats.
- Add a completed fixture; confirm it appears for both clubs and each sees its own score perspective.
- Confirm unauthorized writes are displayed as errors without claiming success.
- Verify all routes directly under the production base path and at mobile and desktop widths.

## 11. Deployment and operations

1. Provision managed PostgreSQL, private network access, TLS, backups, and restore testing.
2. Apply migrations through a controlled deployment job and seed verified geography.
3. Create the first super-admin with a one-time secure bootstrap command; do not seed public credentials.
4. Deploy API with secrets in a server-side secret manager, CORS restricted to the frontend origin, and request/body limits.
5. Build the frontend with `VITE_API_BASE_URL` and `VITE_USE_MOCK_DATA=false`.
6. Serve `/PNGRFL_Web_Applications/` with SPA fallback and route `/api` to the API if using same-origin proxying.
7. Check HTTPS, CSP, cache policy, CORS preflight, bearer/cookie behavior, health checks, log redaction, and restore procedures.
8. Run the acceptance tests above before publishing accounts or public records.

Monitor API errors, authentication failures, latency, database connections, failed migrations, backup age, and result edits. Define an incident process for account compromise, incorrect published results, and unauthorized exposure of player information.