# PNG RFL Documentation

This directory is the source of truth for the frontend code map, operational user guides, UI conventions, API contract, and backend/database implementation plan. The downloadable ZIP contains this directory and the root README.

## Guides

| Guide | Audience | Contents |
| --- | --- | --- |
| [Project and code guide](PROJECT_GUIDE.md) | Developers | Setup, source tree, routes, state, resources, and known limitations |
| [Project code walkthrough](PROJECT_CODE_WALKTHROUGH.md) | Developers | Source-file responsibilities and explained React, API, data, and admin code blocks |
| [Design and layouts](DESIGN_AND_LAYOUTS.md) | Designers and frontend developers | Visual system, page compositions, breakpoints, and accessibility |
| [User manual](USER_MANUAL.md) | Public visitors and administrators | Navigation, club information, league discovery, and admin data entry |
| [API contract](API.md) | Frontend/backend developers | Endpoint paths, payloads, responses, and role requirements |
| [Database schema](DATABASE_SCHEMA.md) | Backend developers and DBAs | Entities, relationships, access rules, indexing, and migration notes |
| [PostgreSQL starter schema](database/schema.sql) | Backend developers and DBAs | Executable baseline DDL and official region/province seed data |
| [Backend integration guide](BACKEND_INTEGRATION.md) | Backend, DevOps, and security teams | Implementation order, security, configuration, testing, and deployment |

## Download

The website footer links to the project handbook PDF (`public/downloads/PNG-RFL-Project-Handbook.pdf`), `public/downloads/PNG-RFL-Documentation.zip`, and the relational schema in PDF and plain text at `public/downloads/PNG-RFL-Database-Schema.pdf` and `public/downloads/PNG-RFL-Database-Schema.txt`. The handbook combines this README, the root README, every Markdown guide in this directory, the PostgreSQL starter schema, and the explained code walkthrough. It explains representative code blocks and source-file responsibilities; it does not reproduce every source file verbatim or include binary assets, dependencies, or generated build output.

Regenerate the handbook from the repository root with:

```powershell
npm run docs:pdf
```

The ZIP contains Markdown documentation and SQL source, not application credentials or private user data. Rebuild it after changing the docs:

```powershell
Compress-Archive -Path docs, README.md -DestinationPath public/downloads/PNG-RFL-Documentation.zip -Force
```

The site uses the base path `/PNGRFL_Web_Applications/`; direct browser downloads are served from `/PNGRFL_Web_Applications/downloads/` in this deployment.

## Scope and status

This repository is a React/Vite frontend. It has no backend service, database connection, production administrator credentials, or migration runner. The SQL and backend guides are implementation specifications that a backend team must review and deploy. Local mock mode is for interface development only and is not authentication or shared persistence.