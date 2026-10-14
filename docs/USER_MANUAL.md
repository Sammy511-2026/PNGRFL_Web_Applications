# User Manual

## Public website

### Find clubs and club information

1. Choose **Teams** in the main navigation.
2. Select a club card to open its profile.
3. Use the club tabs to view its profile, squad, fixtures/results, ladder position, honours, coaching staff, and stats.
4. Use **Back to Teams** to return to the club directory.

Club information depends on published team, player, fixture, and ladder records. A tab may show an empty-state message when information has not been entered or published yet.

### Find matches

Choose **Fixtures** to browse scheduled matches and available results. On a club profile, **Fixtures & Results** shows games where the selected club is home or away. The club statistics tab derives played/win/loss/draw/points totals from numeric match scores when available.

### Browse registered leagues

Choose **Leagues**. Expand a region, then a province. Each province separates province-level registrations from district registrations and splits both into Rugby League 9s and Rugby League 13s. Registration contacts and club lists appear when supplied by the league data source.

## Administrator access

### Sign in

1. Open **Admin** from the site navigation.
2. Enter the account email and password supplied by the PNG RFL super administrator.
3. Select **Log in**.

There is no public account-creation flow. A super administrator creates regional or provincial accounts from the dashboard. If you cannot sign in, ask the super administrator to confirm your account status and scope.

> In local mock mode only, the login endpoint is simulated and accepts any nonempty email/password pair. This is not a real account or secure sign-in. Never deploy with mock mode enabled.

### Create a regional or provincial administrator

Available to the super administrator:

1. Open **Create admin**.
2. Enter the administrator's name, email, and initial password.
3. Choose **Regional admin** or **Provincial admin**.
4. Select the region. For a provincial role, select a province within that region.
5. Submit the form.

In production the API creates the account and must securely hash the password. In mock mode the screen reports a preview; it does not create an account.

### Create or update a club profile

Available to the super administrator:

1. Open **Teams**.
2. Choose **Create a new club** or select an existing club under **Club profile**.
3. Complete the club name and home ground. Add founded year, colours, coach, captain, competition, region, province, district, tagline, image paths/URLs, and profile description as available.
4. Add one player per line using `Full name | Position | Jersey number | Photo URL`. Jersey number and photo are optional.
5. Add one staff member per line using `Full name | Role | Photo URL`. Photo is optional.
6. Add one honour per line using `Competition title | Year(s)`.
7. Enter season totals in the statistics section when verified aggregate statistics are available.
8. Create or update the profile.

Updating a club profile replaces the values submitted by the form. Verify the club selector before saving. Do not enter invented biographies, player details, honours, or statistics.

### Add fixtures and results

Available to the super administrator:

1. Open **Fixtures**.
2. Select registered home and away clubs.
3. Enter round, venue, date, and time.
4. Leave status as **Scheduled** without a result. For a completed match, choose **Completed** and enter the score as `Home-Away`, for example `18-12`.
5. Save the match.

Use the correct home/away order. The score is re-oriented on each club's page so each club sees its own points first. Score-derived stats are based on matches with valid numeric scores.

### Register a 9s or 13s league

1. Open **League registrations**.
2. Enter competition name and select Rugby League 9s or 13s.
3. Choose the region and province if you are the super administrator. Regional admins have their region locked and can choose a province within it. Provincial admins have both location fields locked.
4. Enter district, season, venue, contact name, email, and phone.
5. Add registered club names, one per line or comma-separated.
6. Save the registration.

The server, not the browser, must enforce the account's assigned region/province. Mock records are visible only in the browser where they were entered.

### Sign out

Select **Log out** in the dashboard header. This clears the local browser session and returns to the login page.

## Mock mode and publishing

`VITE_USE_MOCK_DATA=true` uses sample records and browser-local storage. League/team/fixture changes are visible to public routes in that same browser, but are not shared with other browsers and may be cleared by the user. Mock administrator creation is preview-only. Production use requires a working API and `VITE_USE_MOCK_DATA=false`.

## Troubleshooting

- **A club is missing:** confirm it is returned by `GET /teams` and has a stable ID.
- **A match is missing from a club page:** home/away must match the club's ID or exact name; verify its status and score fields.
- **Stats show zero:** check that the match includes a parseable score such as `18-12`, or supply verified club totals.
- **A league appears under the wrong province:** confirm its region/province identifiers match `src/data/Leagues.js` and the backend assignment.
- **A submission says preview:** mock mode is on. Configure and test the backend before expecting cross-device persistence.
- **A user sees another scope:** treat this as a backend security incident; UI filtering is not an access-control boundary.