# Orange Pop Empire

A responsive idle/incremental browser game built with HTML, CSS, and vanilla JavaScript.

## Overview

Orange Pop Empire is a playful orange soda-themed idle game where players build their soda empire by acquiring Orange Stands, collecting Orange Pop, and converting it into Money.

The game features:
- Auto-generating Orange Pop production
- Exponential building costs
- Upgrade system with 18 unique upgrades
- Offline earnings report when returning to the game
- Responsive mobile-friendly layout
- Auto-save to `localStorage`

## Files

- `index.html` — main game page and layout
- `css/style.css` — visual styling, responsive layout, and animations
- `js/data.js` — game configuration, building and upgrade definitions, save/load helpers
- `js/game.js` — game state, production loop, offline earnings, and persistence logic
- `js/ui.js` — rendering UI, handling user input, animated counters, and offline report
- `404.html` — portfolio 404 page with dropdown menu link to the game

## How to use

1. Open `index.html` in a browser.
2. Watch Orange Pop generate automatically.
3. Buy more Orange Stands to increase production.
4. Purchase upgrades to boost production multipliers.
5. Close the page and return later to receive offline earnings.

## Notes

- The game saves automatically every 30 seconds and on page unload.
- Offline progress is calculated based on time away and added when the game is reopened.
- Additional buildings and upgrades can be added in `js/data.js`.

## Development

To extend the game:
- Add new building objects to `BUILDING_DEFINITIONS` in `js/data.js`
- Add new upgrade objects to `UPGRADE_DEFINITIONS` in `js/data.js`
- Update UI labels or layout in `js/ui.js` and `css/style.css`

Enjoy building the world’s brightest orange soda empire! 🍊