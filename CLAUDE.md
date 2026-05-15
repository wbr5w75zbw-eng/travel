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

### Weather widget

`OPENWEATHER_API_KEY` is declared at the top of `app.js` (line 5). When it's still `"YOUR_API_KEY_HERE"`, the widget renders mock data and shows a setup banner. When set, it hits `api.openweathermap.org/data/2.5/weather`.

### Spec gaps (intentional)

The original spec (`prompt_travel.md`) was truncated mid-file. **Currency Converter** and **Safety** sections referenced in the spec's objective/nav are not implemented and were dropped by user decision. Don't add them back without confirmation.

### Featured guides

`renderFeaturedGuides()` in `app.js` hardcodes `["seoul", "tokyo", "bali"]` as the three editor's-pick cities shown in the `#guides` strip. To change featured cities, edit that array.
