# JanSaarthi AI — prototype

A GovTech grievance-intelligence prototype for Jabalpur, Madhya Pradesh.
Two **completely separate** portals, each with its own HTML entry point,
its own login, and its own session — they do not share navigation or
authentication:

```
jansaarthi/
├── index.html              ← landing page, links to both portals
├── citizen/                ← Citizen Portal (public)
│   ├── index.html
│   ├── css/citizen.css
│   └── js/
│       ├── app.js          ← router + header/footer + event wiring
│       ├── auth.js         ← citizen-only login/register (own storage key)
│       └── views.js        ← every citizen page
├── officer/                 ← Officer & Admin Console (staff only)
│   ├── index.html           ← this is the officer LOGIN screen, not the
│   │                           citizen homepage — reach it directly by URL
│   ├── css/officer.css
│   └── js/
│       ├── app.js
│       ├── auth.js          ← officer-only login (own storage key)
│       └── views.js
└── shared/                  ← code both portals import, nothing is duplicated
    ├── css/tokens.css        (design tokens, light/dark theme variables)
    ├── css/components.css    (buttons, cards, tables, graph, charts…)
    └── js/
        ├── i18n.js            English/Hindi strings
        ├── icons.js           inline SVG icon set
        ├── dom-utils.js
        ├── categories.js      category/department taxonomy + translations
        ├── geo-jabalpur.js    real Jabalpur localities (lat/lng)
        ├── data-store.js      mock AI, demo dataset, persistence, analytics
        ├── ui.js              toast/badge/timeline/charts/relationship graph
        └── map.js             Leaflet + OpenStreetMap map builder
```

## Running it

Everything is plain HTML/CSS/JS using native ES modules — **no build step,
no `npm install`**. Browsers block `import` over `file://`, so serve the
folder with any static server and open it from `http://localhost`:

```bash
cd jansaarthi
python3 -m http.server 8080
# then open:
#   http://localhost:8080/               (chooser)
#   http://localhost:8080/citizen/       (citizen portal)
#   http://localhost:8080/officer/       (officer & admin console)
```

(`npx serve`, VS Code's "Live Server", or any other static file server
works identically.)

## What was fixed from the single-file version

- **Separate portals.** `citizen/` and `officer/` are different apps with
  different HTML entry points, different headers, different navigation,
  and different `localStorage` session keys (`js_auth_citizen_v1` vs
  `js_auth_officer_v1`). The citizen header has no officer login button —
  officers reach their console by going directly to `/officer/`.
- **Real Jabalpur map.** `shared/js/map.js` renders an actual Leaflet map
  on real OpenStreetMap tiles, centred on Jabalpur (23.1815°N, 79.9864°E).
  Demo data is placed at approximate coordinates of real Jabalpur
  localities (Napier Town, Adhartal, Garha, Gorakhpur, Madan Mahal,
  Ranjhi, Sadar, Tilwara, Gwarighat, Bargi, etc. — see
  `shared/js/geo-jabalpur.js`), not an abstract grid.
- **Light mode in the officer portal.** All officer styling now reads
  colours from the same CSS variables as the citizen portal
  (`shared/css/tokens.css`). The officer console *defaults* to a dark
  palette (`data-theme="officer-default"`) but the moon/sun toggle in the
  header genuinely swaps it to the light palette — nothing is hardcoded
  dark anymore.
- **Multi-file structure.** Code is split by concern (data, UI, routing,
  views, auth) and by portal, instead of one large HTML file.

## Data & "backend"

This is a front-end-only prototype. There is no server. Both portals
import the same `shared/js/data-store.js` module, and every mutation
(citizen submits a report, officer updates a case) is saved to
`localStorage` under one shared key (`js_appdata_v3`). That means:

- If you open the citizen portal and the officer portal **in two tabs of
  the same browser**, a report submitted in one tab becomes visible to
  the other after a refresh (they currently don't push-sync live).
- Data does **not** sync across different browsers, devices, or
  profiles — there is no real backend. `officer → Demo data` shows how
  many records are demo vs citizen-submitted, and has buttons to reset
  the demo scenario or clear citizen-submitted data.
- Every citizen- or officer-created record is tagged `source: 'demo'` or
  `source: 'user'`, and the UI visibly badges the difference (`Demo data`
  vs `Your report` / `Citizen-submitted`).

## Login credentials

There is no real authentication server. On **both** portals, any email
address and a password of 6+ characters will log you in — this is called
out on-screen under the login form. Officer accounts would normally be
provisioned by an admin in a production build.

## Swapping in a real AI / backend later

`shared/js/data-store.js` exports a single `AI` object with
`analyzeGrievance()`, `findRelationships()` and `suggestAuthority()`. To
connect a real model or backend, replace that object's implementation
(e.g. call `fetch('/api/...')`) — nothing in the view code needs to
change, since every view calls `AI.*` through this one interface.

## Known limitations

- No real backend — see "Data & backend" above.
- The Leaflet map needs internet access (to fetch OpenStreetMap tiles)
  when the page is opened.
- Jabalpur locality coordinates are approximate, for demo purposes —
  they are not surveyed administrative boundaries.
