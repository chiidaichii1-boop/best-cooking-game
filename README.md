# Dapur Kilat — Indonesian street-food kitchen rush

[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/chiidaichii1-boop/best-cooking-game/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/chiidaichii1-boop/best-cooking-game/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

A complete, original cooking game for the [make.fun best cooking game bounty](https://make.fun/bounty/best-cooking-game-20261125-0137). It runs in a desktop browser from static files with no network request, played with keyboard and mouse.

## The game

You run a tiny Indonesian street-food stall. Orders land on the board — grab ingredients, chop them, cook them, plate the dish and serve it before the customer's patience runs out.

- **Nasi Goreng** — cooked rice + cooked egg + chopped chili (25 coins)
- **Mie Goreng** — cooked noodle + cooked chicken + chopped veg (30 coins)
- **Sate Ayam** — cooked chicken + chopped chili (20 coins)

Serve fast for tips, chain serves for combos, and don't let food burn on the stove. Survive the 3-minute shift with 3 hearts.

## Controls

- **Mouse** — click a station to use it (the chef walks there)
- **1–6** — grab an ingredient · **B** — chop · **C** — cook · **P** — plate · **S** — serve · **T** — trash · **M** — mute

## Play it

Serve `game/` with any static server and open `game/index.html`, for example:

```sh
python3 -m http.server 8080 --directory game
# open http://localhost:8080
```

Or open `game/index.html` directly in desktop Chrome.

## Hand in

`main.ts` (Node 22, standard library only) copies `game/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Layout

- `game/index.html` — the page; `game/css/style.css` — page chrome
- `game/js/main.js` — boot and game loop
- `game/js/config.js` — dishes, recipes, stations, colors, timings
- `game/js/state.js` — orders, tray, plate, stations, showcase scenes
- `game/js/actions.js` — grabbing, chopping, cooking, plating, serving
- `game/js/render.js` — all canvas drawing (no loaded images)
- `game/js/input.js` — mouse and keyboard
- `game/js/audio.js` — synthesized sound effects (WebAudio, no files)
- `vendor/makefun-game.ts` — make.fun's dossier library, copied unchanged from the kit
- `screenshots/` — real renders of the game's own code
