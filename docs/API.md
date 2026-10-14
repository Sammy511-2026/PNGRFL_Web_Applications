# Admin API contract

The frontend uses JSON over HTTP. `VITE_API_BASE_URL` defaults to `/api`; protected requests send the bearer token returned by `POST /auth/login`. The login response must include a user profile with a role and, for scoped accounts, assigned region and province identifiers:

```json
{
  "token": "signed-access-token",
  "user": {
    "id": "admin-123",
    "name": "Regional Administrator",
    "email": "admin@example.org",
    "role": "region-admin",
    "region": "southern"
  }
}
```

Supported roles are `super-admin`, `region-admin`, and `province-admin`. Regional users require a `region`; provincial users require both `region` and `province`. The frontend also recognizes the legacy `admin` role as a super administrator.

## Endpoint summary

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| `POST` | `/auth/login` | Public, rate limited | Authenticate an administrator |
| `POST` | `/admins` | Super administrator | Provision a scoped admin account |
| `GET` | `/teams` | Public | List published clubs for home and directory |
| `GET` | `/teams/:id` | Public | Read one club profile with public child records |
| `POST` | `/teams` | Super administrator | Create a club profile |
| `PATCH` | `/teams/:id` | Super administrator | Update a club profile |
| `GET` | `/fixtures` | Public | List published fixtures and results |
| `POST` | `/fixtures` | Super administrator | Create a match |
| `PATCH` | `/fixtures/:id` | Super administrator | Update a match/result |
| `GET` | `/ladder` | Public | Read current standings |
| `GET` | `/leagues` | Public | List published regional/provincial/district registrations |
| `POST` | `/leagues` | Scoped administrator | Submit a registration within assigned scope |
| `PATCH` | `/leagues/:id` | Scoped administrator or super administrator | Update a registration subject to scope |
| `GET` | `/products` | Public | List shop catalogue items |

Use `201 Created` for successful create operations. The frontend list readers currently expect a JSON array; introduce pagination only with a coordinated frontend change.

## Authentication

`POST /auth/login` request:

```json
{ "email": "admin@example.org", "password": "secret supplied securely" }
```

Response: the token/user envelope shown above. Never return a password or password hash. In production the login endpoint needs TLS, rate limiting, a modern password hash, expiry/revocation strategy, and a generic invalid-credential message. The current browser stores bearer tokens in localStorage; see [BACKEND_INTEGRATION.md](BACKEND_INTEGRATION.md) for the security tradeoff and preferred alternatives.

## Create administrators

`POST /admins` is available to super administrators only. The server must validate the scope, hash the password, and never include the password in its response.

```json
{
  "name": "District Rugby Administrator",
  "email": "admin@example.org",
  "password": "initial-password",
  "role": "province-admin",
  "region": "southern",
  "province": "central"
}
```

Regional admins omit `province`. The API must reject province assignments outside the selected region and prevent non-super-admins from creating administrator accounts.

Return a sanitized account profile, for example `{ "id": "admin-123", "name": "District Rugby Administrator", "email": "admin@example.org", "role": "province-admin", "region": "southern", "province": "central", "isActive": true }`. Prefer one-time invitation/reset tokens to reusable initial passwords when possible.

## Club profiles

`GET /teams` returns an array with at least `id`, `name`, `homeGround`, `logo`, and publication status. `GET /teams/:id` returns the complete public profile. `POST /teams` and `PATCH /teams/:id` use the profile shape below; child arrays may be replaced atomically by a profile update.

```json
{
  "id": "central-city",
  "name": "Central City",
  "description": "Approved public club description.",
  "tagline": "Club tagline",
  "logo": "https://media.example.org/clubs/central-city.png",
  "banner": "https://media.example.org/clubs/central-city-banner.jpg",
  "founded": "1982",
  "homeGround": "District Oval",
  "colors": ["Red", "Black"],
  "competition": "PNG RFL",
  "region": "southern",
  "province": "central",
  "district": "Abau",
  "coach": "Coach Name",
  "captain": "Captain Name",
  "players": [{ "id": "player-1", "name": "Player Name", "position": "Fullback", "number": 1, "photo": null }],
  "staff": [{ "id": "staff-1", "name": "Staff Name", "role": "Head Coach", "photo": null }],
  "honours": [{ "title": "Competition", "years": "2024" }],
  "stats": { "played": 0, "wins": 0, "losses": 0, "draws": 0, "pointsFor": 0, "pointsAgainst": 0 }
}
```

Serialize `founded` consistently as a year string or number. Public responses must omit internal admin fields and unpublished child records.

## League registrations

`GET /leagues` returns an array of registrations. `POST /leagues` accepts the form fields below. `format` is `9s` or `13s`; `clubs` is an array of club names.

```json
{
  "name": "Central District Rugby League",
  "format": "13s",
  "region": "southern",
  "province": "central",
  "district": "Abau",
  "season": "2026",
  "clubs": ["Example Club"],
  "venue": "District Oval",
  "contactName": "League Contact",
  "contactEmail": "league@example.org",
  "contactPhone": "+675 7000 0000",
  "registrationStatus": "registered"
}
```

The server must derive the acting admin from the bearer token and enforce that regional admins can submit only within their assigned region and provincial admins only within their assigned province. Do not trust submitted `region`, `province`, or `registrationStatus` values without checking them against the authenticated account and server-side publication rules.

## Club profiles and matches

`POST /fixtures` accepts a home/away club identifier or name and the fixture details. Prefer stable IDs in the backend contract:

```json
{
  "homeTeamId": "club-home",
  "awayTeamId": "club-away",
  "round": "Round 1",
  "venue": "National Football Stadium",
  "kickoffAt": "2026-10-03T15:00:00+10:00",
  "status": "completed",
  "homeScore": 20,
  "awayScore": 12
}
```

`GET /fixtures` serializes club names or IDs, `round`, `venue`, `date`, `time`, `status`, and either `score` such as `18-12` or numeric `homeScore` and `awayScore`. The current admin form sends `home`, `away`, `date`, `time`, and `score`; adapt that form or accept those aliases in the API. Completed matches require valid nonnegative paired scores. The club detail page matches fixtures to both teams and derives each club's score perspective/statistics from scored matches.

`GET /ladder` returns rows with `team` (or `name`), `position`, `played`, `wins`, and `points`. Confirm the official ladder-points policy with PNG RFL before calculating standings.

## Products

`GET /products` returns an array such as:

```json
[{ "id": "supporter-cap", "name": "PNG RFL Supporter Cap", "price": "K80", "status": "coming-soon" }]
```

The current application has no order, inventory, shipping, or payment endpoint. Do not represent a product as purchasable until those flows and their security requirements are implemented.

Public self-signup is disabled in the frontend. In mock mode, league, team, and fixture records are saved to browser-local storage and are visible to public pages in that browser only. Mock administrator accounts are not persisted; real account creation and cross-device sharing require the backend.

## Error response

All errors should include a safe `message`; optional `code`, field details, and request ID are useful:

```json
{
  "message": "The selected province is outside your assigned region.",
  "code": "SCOPE_MISMATCH",
  "details": { "field": "province" },
  "requestId": "req-abc123"
}
```

Use `401` for missing/invalid authentication, `403` for insufficient role/scope, `404` for missing resources, `409` for conflicts, `422` for validation, and `429` for rate limits. Never return stack traces, SQL details, hashes, tokens, or private player data.