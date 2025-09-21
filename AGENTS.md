# Repository Guidelines

## Project Structure & Module Organization
- `js/game/` contains gameplay modules under the `window.game` namespace; start enhancements here.
- `js/libs/` hosts pinned THREE.js, Cannon.js, and utilities; treat them as vendored dependencies.
- Demo HTML files load the modules for manual runs; update them alongside gameplay tweaks.
- `doc/DOCS.md` covers architecture; Grunt outputs `js/dist/` assets and the bundled `js/game.js`.
- `tests/`, `playwright-report/`, and `test-results/` hold Playwright specs and generated artifacts.

## Build, Test, and Development Commands
- `npm install` syncs Grunt and Playwright dependencies.
- `npx grunt` minifies libraries and rebuilds `js/game.js`.
- `npx playwright test` runs the suite and auto-launches `python -m http.server 8000`.
- `npx playwright test --ui` debugs failing scenarios interactively.
- `python -m http.server 8000` serves demos for quick manual checks.

## Coding Style & Naming Conventions
- Indent with hard tabs as in `js/game/game.core.js`.
- Follow the `window.game.*` pattern and mirror filenames (`game.events.js`, `game.models.async.js`).
- Use camelCase for functions and properties; reserve PascalCase for THREE.js or Cannon.js constructors.
- Limit globals and explain non-obvious math or physics tweaks with brief inline comments.
- Write Playwright specs with imperative `test.describe` groupings and `test('should ...')` titles.

## Testing Guidelines
- Store new `@playwright/test` specs in `tests/` with a `.test.js` suffix.
- Keep port 8000 free; the config handles the local server.
- Prefer expectations over long `waitForTimeout` calls and close pages in `afterEach`.
- Surface failures by sharing `playwright-report/index.html` artifacts.

## Commit & Pull Request Guidelines
- Use short, imperative commit subjects (e.g., `Add collectible reset guard`).
- Explain WHAT and WHY in PRs, referencing affected demos or issues.
- Verify `npx grunt` and `npx playwright test` before review and summarize the results.
- Attach updated screenshots or the Playwright HTML report when altering visuals.
