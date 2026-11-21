# Twin Harbours — Spot the Difference

An original spot-the-difference game that runs offline in a desktop browser
from its own static files. Two near-identical hand-drawn harbour scenes sit
side by side; find all 8 differences in each before the 120-second timer runs
out.

## The six harbours

1. **Dawn Harbour** — fishing boats, a lighthouse and a pink sunrise
2. **Lantern Night Market** — lanterns, stalls, string lights and shoppers
3. **Coral Reef** — fish, coral, shells, a starfish and a treasure chest
4. **Mountain Tea Garden** — a pagoda, pine trees, birds and stone lanterns
5. **Clocktower Square** — a clock tower, stalls, balloons and pigeons
6. **Snowy Station** — a train, lamps, pine trees and a station sign

Every scene is original SVG art drawn in code (`game/src/scenes.js`) — no
images, no copied art, no network requests.

## How to play

- **Click** a difference on either picture: a green ring marks it on both
  panels, with a chime and points (100 + a streak bonus).
- **Wrong click**: a red X flashes and 3 seconds come off the timer.
- **Hints** (3 per level): a pulsing gold ring shows one difference you have
  not found yet.
- **Magnifier**: a 2× zoom lens follows your mouse (button or `M`).
- **Keyboard**: arrow keys move the crosshair, `Enter`/`Space` checks the
  spot, `H` hint, `M` magnifier, `P` pause.
- **Scoring**: 100 points per find plus a streak bonus, and a time bonus of
  5 points per second left when you clear a level. 3 stars for finishing
  with 60+ seconds left, 2 for 30+, 1 otherwise.

## Run it

```sh
node serve.ts
# open http://localhost:8080/
```

Or serve `game/` with any static HTTP server. The game needs no build step
and makes no network requests; all sound is synthesized with WebAudio.

## Layout

- `game/index.html` — page shell, HUD and styles
- `game/src/scenes.js` — the six SVG scenes and their 8 differences each
- `game/src/game.js` — state, timer, scoring, levels, screenshot staging
- `game/src/render.js` — panels, HUD, markers, overlays, magnifier lens
- `game/src/input.js` — mouse, keyboard, magnifier and button input
- `game/src/audio.js` — WebAudio beeps and chimes
- `main.ts` — copies `game/` + `screenshots/` to `/output` and writes the dossier
- `shots.json` — the four deterministic screenshot states (`?shot=…`)
