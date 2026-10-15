# WordWeave

A word-path puzzle game in the style of LinkedIn's *Wend*, built with **bare React Native CLI (no Expo)**.

Same rules as Wend, with its own look:

- A 5×5 letter grid with gray **wall** tiles.
- Exactly **four hidden words, of 3, 4, 5 and 6 letters**. Bubbles show only their lengths.
- Words are paths of letters touching **up, down, left or right (no diagonals)**. Paths can turn and bend around walls.
- **Every open tile is used exactly once**, and every board has exactly one solution.
- **Undo** (last letter, or last found word), **Reset**, **Hint** (reveals one more letter) and a running **timer**.

## Features

- **200 levels** in 7 chapters (Warm Up → Winding → Twisty → Grandmaster → Serpentine → Labyrinth → Legendary). Paths get windier as you go
- Tap-to-extend or drag-to-trace selection. A word locks in the moment its path is right
- Gold "right word, wrong path" feedback, plus a red shake for a wrong word
- Unlimited hints, with a star rating per level (3 = no hints, 2 = up to 2 hints, 1 = more)
- Best time per level
- **Progress saved on-device** with AsyncStorage (React Native's equivalent of `localStorage`): unlocked levels,
  stars, best times, plus found words, hints and the clock mid-level, so you can close the app and pick up where you left off
- No backend, no account, and works offline

## Run it

```sh
npm install
npm start             # Metro bundler, keep it running
npm run android       # in a second terminal, with an emulator or device connected
```

iOS (macOS only): `cd ios && bundle install && bundle exec pod install && cd .. && npm run ios`

## Project layout

```
App.tsx                      navigation stack + Android back button
src/theme.ts                 colors, word palette
src/data/levelData.json         200 generated levels (grid + word paths)
src/data/levels.ts           types, chapters
src/state/ProgressContext.tsx  AsyncStorage-backed progress
src/screens/                 Home, Levels, Game
src/components/              Board (gesture + rendering), WordSlots, WinModal, HowToPlay, ui
scripts/generateLevels.js    level generator (seeded, deterministic)
scripts/wordBanks.js         themed word lists
```

## Adding or changing levels

Edit `scripts/wordBanks.js` (add themes or words) or `LEVEL_COUNT` / tiers in `scripts/generateLevels.js`, then:

```sh
node scripts/generateLevels.js
```

The generator places walls, tiles the open cells with one self-avoiding path per word, and keeps a board only if a
solver finds exactly one solution. Every level is validated before it is written.
Changing word banks reshuffles levels, so if players already have progress, append new levels instead of
regenerating old ones.
