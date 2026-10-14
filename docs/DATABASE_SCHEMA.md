# Database Schema and Data Model

## Scope

No database is included in the frontend repository. The companion `database/schema.sql` is a PostgreSQL starter schema for backend implementation, not a deployed migration. Have PNG RFL data owners verify official region/province/district names, season rules, retention requirements, and ladder points before using it in production.

## Entities and relationships

```text
regions 1---N provinces 1---N districts
regions/provinces 1---N admin_users (scope constrained by role)
regions/provinces/districts 1---N league_registrations
league_registrations N---N clubs (league_registration_clubs)
clubs 1---N players
clubs 1---N staff
clubs 1---N honours
clubs 1---N home_matches and away_matches (fixtures)
competitions 1---N fixtures
admin_users 1---N audit_events
```

## Table overview

| Table | Purpose | Main constraints |
| --- | --- | --- |
| `regions` | Four official operational regions | Stable text ID and unique name |
| `provinces` | Provinces and NCD assigned to a region | Unique `(id, region_id)` relationship |
| `districts` | District records within a province | Unique `(id, province_id)` relationship |
| `admin_users` | Super, regional, provincial accounts | Password hash only; scope role checks; disabled timestamp |
| `clubs` | Public club profile and aggregate season stats | Unique slug; colors array; publication status |
| `players` | Club squad records | Club FK; optional number/photo; display order |
| `club_staff` | Coaches and staff | Club FK; role and optional photo |
| `club_honours` | Achievements and years | Club FK; display order |
| `league_registrations` | 9s/13s league registration and contact details | Format enum-like check; location scope; status |
| `league_registration_clubs` | Clubs listed in a registration | Registration/club composite primary key |
| `competitions` | Competition and season identity | Unique name/format/season tuple as approved |
| `fixtures` | Scheduled/completed match and score | Distinct home/away club; score pair consistency |
| `products` | Future shop catalogue | Nonnegative price; publication status |
| `audit_events` | Security and admin mutation history | Actor, action, resource, timestamp; avoid secrets |

## Role and scope model

- `super-admin`: `region_id` and `province_id` are null; may administer all records.
- `region-admin`: `region_id` is required; `province_id` is null; may manage league records within the region only.
- `province-admin`: both `region_id` and `province_id` are required; province must belong to region; may manage league records within that province only.

The database constraints prevent invalid scope combinations, but API authorization must still check the authenticated principal on every read and write. Do not accept a client-submitted role, owner ID, region, province, or publication status as authorization proof.

## Season stats and ladder

Store verified team aggregates with a season/competition key, or compute standings from completed fixtures. Avoid one unversioned stats object on a club if the site needs multiple competitions or historical seasons. The frontend currently reads a simplified `stats` object and a ladder row with position, team, played, wins, and points; adapters can project the richer database model into those response shapes.

The starter schema stores per-match ladder points so scoring policy can be set by competition. Confirm whether the league awards 2/1/0 or another points schedule before publishing standings. Never assume a ladder-points rule without competition approval.

## Migration and data quality notes

1. Create the schema in a versioned migration, not by manual production edits.
2. Seed the four regions and province mappings from the starter SQL; verify them with PNG RFL before release.
3. Load verified districts separately; the frontend currently asks admins to type a district and has no district master list.
4. Import clubs with stable IDs/slugs, unique names where required, and correct home grounds.
5. Import players, staff, honours, photos, fixtures, and scores only from approved sources.
6. Audit for duplicate clubs, invalid province-region links, negative scores/prices, and invalid home=away matches.
7. Back up and test restore before applying production migrations.

## Privacy and retention

Protect admin email and password hashes. Public player/staff contact details should not be exposed unless explicitly approved. Consider consent and retention rules for player photos, minors, safeguarding records, and user account deactivation. Do not put passwords, access tokens, private contact notes, or uploaded binary data in audit logs.