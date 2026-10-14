# Design and Layouts

## Visual foundation

The interface uses a PNG RFL-inspired black, white, red, and gold palette. Core page backgrounds and text colors are defined in `src/index.css`; admin-specific colors are defined in `src/pages/admin/Admin.css`. Some page surfaces intentionally use local colors rather than a centralized token system, so check the owning stylesheet before introducing a new style.

| Token / usage | Value |
| --- | --- |
| Global font | Trebuchet MS, then Segoe UI, sans-serif |
| Dark background | `#0e0e0e` |
| Light surface | `#ffffff` |
| Light card surface | `#f7f7f7` |
| Primary red | `#e30613` |
| Competition gold | `#ffc20e` |
| Admin black | `#050505` |
| Standard content width | Approximately 1100-1200px, centered |
| Small-screen thresholds | Primarily 600-760px; some layouts use 900px |

The initial document theme is dark (`index.html`). Several data-entry and detail surfaces are white for contrast. Preserve that local contrast when editing inherited text colors.

## Shared shell

- Black navigation bar, PNG RFL logo, white links, red/gold interaction accents.
- Navigation wraps to a menu button on narrow screens.
- Main content is a route outlet; footer carries copyright and the documentation ZIP link.
- Focus indicators are global and must remain visible when controls are restyled.

## Page layouts

### Home

Full-width photographic hero with text anchored to its lower edge; competition callout; club preview grid. Hero images are local files under `src/assets/hero`. The slides rotate on a timer. Keep the team preview linked to the same club detail route used from the directory.

### Club directory and detail

The directory is a responsive grid of logo/name/home-ground cards. A card navigates to `/teams/:id`. The profile begins with a full-width image header and logo, then four quick facts. A horizontal, scrollable tab strip switches to overview, squad, fixtures/results, ladder, honours, coaching staff, and statistics. Tables retain a minimum readable width and scroll on phones.

### League directory

An unframed page header introduces four expandable regions. Each region expands to province panels; each province shows separate province-level and district-level entries, each split into Rugby League 9s and 13s. Registration details are shown only when supplied; empty states identify unpublished data.

### Fixtures and ladder

Fixtures render as a list of fixture cards. Ladder uses a compact table. Use actual club IDs/names and scores so the club detail fixture association and statistics remain consistent.

### Admin dashboard

Desktop: role tools in a left tab column, active form in the main column, plus data previews. Mobile: tabs and form stack. Super admins have club, fixture, account, and league tools. Regional/provincial accounts see league entry only. Club profiles use labeled fields, repeated `|`-delimited player/staff/honours rows, and a grouped stat fieldset.

### Informational placeholders and shop

Competition, rules, and board screens use the shared `ContentPage` layout with a three-column information grid collapsing to one column. Shop items are coming soon; there is no purchase flow yet.

## Responsive and accessibility rules

- Keep long names and contact details wrapping inside their content area; allow tables to scroll instead of shrinking columns until they are unreadable.
- Use native links for navigation and buttons for actions; all form controls need labels.
- Keep loading/error messages in their shared RequestState component and retry controls keyboard-accessible.
- Preserve visible focus styling and meaningful image alt text; decorative images should not duplicate nearby text for assistive technology.
- Test at 320px, 390px, tablet width, and desktop width; confirm no horizontal overflow outside intentionally scrollable tab/table regions.
- Expandable region/province sections use native `<details>` and `<summary>` semantics.

## Assets

- `src/assets/logos/pngrfl.jpg`: site and default club logo.
- `src/assets/hero/`: local match photography used by the home hero.
- `src/assets/merchandise/`: reserved folder; current products use API/fallback data rather than product imagery.

Use stable HTTPS image URLs in production or serve managed images through a CDN. Do not depend on local developer filesystem paths for remote API images.