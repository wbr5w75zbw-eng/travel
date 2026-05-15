# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Travel Explorer — a static single-page travel guide site built in vanilla HTML/CSS/JS. No frameworks, no build step, no backend, no package manager.

## Running

Open `index.html` directly in a browser (`open index.html` on macOS). The site runs from `file://` — no dev server required. There are no tests, no lint, no build commands.

## Architecture

Four files, loaded in this exact order from `index.html`:

1. **`data/cities.js`** — declares `window.CITIES` (array of 12 destination objects). Must load **before** `app.js`. Schema: `{ id, name, country, blurb, flightTimeFromSGP, dailyBudgetSGD, bestSeason, heroImage, overview, itinerary[3], food[], transport[], costBreakdown{}, safetyTips[], photoSpots[] }`.
2. **`app.js`** — single IIFE. Reads `window.CITIES` and renders cards into `#cities-grid` + `#guides-strip`; the modal (`#guide-modal`) is a single hidden shell populated on demand. Forms are progressively enhanced (no framework).
3. **`index.html`** — section anchors (`#home`, `#guides`, `#cities`, `#tools`, `#weather`, `#enquiry`) + form markup + empty containers for JS to fill.
4. **`styles.css`** — design tokens in `:root` (palette, fonts, radii). Playfair Display + Inter via Google Fonts. Responsive breakpoints at 900/720/420px.

### Hard constraints (don't break)

- **No ES modules** — scripts are loaded as plain `<script>` tags so the site works from `file://`. Adding `type="module"` will break local loading because of CORS.
- **No build tools, no dependencies** — original spec mandates pure HTML/CSS/JS. Don't introduce React, bundlers, npm, etc.
- **Unsplash images**: use direct `https://images.unsplash.com/photo-<id>?w=1200&q=80` URLs. The previously-recommended `source.unsplash.com` was deprecated in 2024 and now 404s.

### Persistence

All user data lives in `localStorage` under these keys (no backend exists):

- `enquiries` — array of submitted enquiry form objects
- `packing` — object mapping `"<Category>::<index>"` → boolean tick state
- `itinerary` — array of `{ day, time, activity, notes }` entries

### API keys

Real keys live in **`config.local.js`** (gitignored), which sets `window.CONFIG = { OPENWEATHER_API_KEY, WEB3FORMS_ACCESS_KEY }`. It's loaded in `index.html` before `app.js` with `onerror="this.remove()"` so a missing file is silent. `app.js` reads `window.CONFIG?.*` with placeholder fallbacks (`"YOUR_API_KEY_HERE"` / `"YOUR_WEB3FORMS_KEY_HERE"`). Never paste real keys into `app.js` — they'll get committed.

- **Weather widget** (`OPENWEATHER_API_KEY`): with placeholder, renders mock data and shows a setup banner. With a real key, hits `api.openweathermap.org/data/2.5/weather`.
- **Enquiry form** (`WEB3FORMS_ACCESS_KEY`): with placeholder, submissions only save to `localStorage` and show a setup notice. With a real key, the form POSTs JSON to `https://api.web3forms.com/submit`; Web3Forms relays the email to the inbox tied to that key. An earlier FormSubmit integration was abandoned after their service returned Cloudflare 521s on 2026-05-15.

### Spec gaps (intentional)

The original spec (`prompt_travel.md`) was truncated mid-file. **Currency Converter** and **Safety** sections referenced in the spec's objective/nav are not implemented and were dropped by user decision. Don't add them back without confirmation.

### Featured guides

`renderFeaturedGuides()` in `app.js` hardcodes `["seoul", "tokyo", "bali"]` as the three editor's-pick cities shown in the `#guides` strip. To change featured cities, edit that array.
