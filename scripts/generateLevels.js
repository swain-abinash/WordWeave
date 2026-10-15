/* eslint-disable no-console */
/**
 * Generates src/data/levelData.json — 100 deterministic Wend-style levels.
 *
 * Rules (same as LinkedIn Wend):
 *  - A 5×5 grid with gray wall tiles ('#').
 *  - Exactly four hidden words, of lengths 3, 4, 5 and 6.
 *  - Each word is a path of orthogonally adjacent tiles (no diagonals) that may turn.
 *  - Every open tile is used by exactly one word.
 *  - Each board has exactly one solution (verified by a solver below).
 *
 *   node scripts/generateLevels.js
 */
const fs = require('fs');
const path = require('path');
const THEMES = require('./wordBanks');

const LEVEL_COUNT = 200;
const SEED = 20261002;
const ROWS = 5;
const COLS = 5;
const LENGTHS = [3, 4, 5, 6];
const WALLS = ROWS * COLS - LENGTHS.reduce((a, b) => a + b, 0); // 7

function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(SEED);
const pick = arr => arr[Math.floor(rand() * arr.length)];
const shuffle = arr => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const neighbors = i => {
  const r = Math.floor(i / COLS);
  const c = i % COLS;
  const out = [];
  if (r > 0) out.push(i - COLS);
  if (r < ROWS - 1) out.push(i + COLS);
  if (c > 0) out.push(i - 1);
  if (c < COLS - 1) out.push(i + 1);
  return out;
};

/** Later levels prefer winding paths. */
const twistFor = level => {
  if (level <= 100) return 0.35 + 0.55 * ((level - 1) / 99);
  return 0.65 + 0.30 * ((level - 101) / Math.max(1, LEVEL_COUNT - 101));
};

/** One word of each length from the theme, none containing another. */
function pickWords(theme) {
  for (let tries = 0; tries < 50; tries++) {
    const words = LENGTHS.map(len => pick(theme.words.filter(w => w.length === len)));
    if (words.some(w => !w)) return null;
    const clash = words.some((a, i) => words.some((b, j) => i !== j && b.includes(a)));
    if (!clash) return words;
  }
  return null;
}

/**
 * Tile the open cells with one self-avoiding path per word.
 * owner: -2 wall, -1 empty, k = word k.
 */
function tile(words, walls, twist) {
  const owner = new Array(ROWS * COLS).fill(-1);
  walls.forEach(w => (owner[w] = -2));
  const paths = new Array(words.length);
  const used = new Array(words.length).fill(false);
  let nodes = 0;

  function regionsOk() {
    const remaining = words.filter((_, k) => !used[k]).map(w => w.length);
    if (!remaining.length) return true;
    let reach = 1n;
    for (const l of remaining) reach |= reach << BigInt(l);
    const seen = new Array(owner.length).fill(false);
    for (let i = 0; i < owner.length; i++) {
      if (owner[i] !== -1 || seen[i]) continue;
      let size = 0;
      const stack = [i];
      seen[i] = true;
      while (stack.length) {
        const x = stack.pop();
        size++;
        for (const n of neighbors(x)) {
          if (owner[n] === -1 && !seen[n]) {
            seen[n] = true;
            stack.push(n);
          }
        }
      }
      if (!((reach >> BigInt(size)) & 1n)) return false;
    }
    return true;
  }

  function walk(k, cells) {
    if (++nodes > 60000) return false;
    if (cells.length === words[k].length) {
      used[k] = true;
      paths[k] = cells.slice();
      if (regionsOk() && place()) return true;
      used[k] = false;
      return false;
    }
    const last = cells[cells.length - 1];
    const prev = cells[cells.length - 2];
    let opts = shuffle(neighbors(last).filter(n => owner[n] === -1));
    if (prev !== undefined && rand() < twist) {
      const straight = last + (last - prev);
      opts = opts.filter(n => n !== straight).concat(opts.filter(n => n === straight));
    }
    for (const n of opts) {
      owner[n] = k;
      cells.push(n);
      if (walk(k, cells)) return true;
      cells.pop();
      owner[n] = -1;
    }
    return false;
  }

  function place() {
    const start = owner.indexOf(-1);
    if (start === -1) return true;
    for (const k of shuffle(words.map((_, i) => i).filter(i => !used[i]))) {
      owner[start] = k;
      if (walk(k, [start])) return true;
      owner[start] = -1;
    }
    return false;
  }

  if (!place()) return null;
  return paths.map(p => (rand() < 0.5 ? p.slice().reverse() : p));
}

/** All paths in the grid that spell `word`. */
function pathsFor(grid, word) {
  const out = [];
  const dfs = (cells, i) => {
    if (i === word.length) {
      out.push(cells.slice());
      return;
    }
    for (const n of neighbors(cells[cells.length - 1])) {
      if (grid[n] === word[i] && !cells.includes(n)) {
        cells.push(n);
        dfs(cells, i + 1);
        cells.pop();
      }
    }
  };
  for (let s = 0; s < grid.length; s++) if (grid[s] === word[0]) dfs([s], 1);
  return out;
}

/** Number of full solutions (stops counting at 2). */
function countSolutions(grid, words) {
  const options = words.map(w => pathsFor(grid, w));
  const taken = new Set();
  let count = 0;
  const go = k => {
    if (count > 1) return;
    if (k === words.length) {
      count++;
      return;
    }
    for (const p of options[k]) {
      if (p.some(c => taken.has(c))) continue;
      p.forEach(c => taken.add(c));
      go(k + 1);
      p.forEach(c => taken.delete(c));
    }
  };
  go(0);
  return count;
}

function buildLevel(id, theme) {
  const twist = twistFor(id);
  for (let attempt = 0; attempt < 400; attempt++) {
    const words = pickWords(theme);
    if (!words) throw new Error(`Theme ${theme.name} lacks a word of each length`);
    const walls = shuffle([...Array(ROWS * COLS).keys()]).slice(0, WALLS);
    const paths = tile(words, walls, twist);
    if (!paths) continue;
    const grid = new Array(ROWS * COLS).fill('#');
    words.forEach((w, k) => paths[k].forEach((cell, i) => (grid[cell] = w[i])));
    if (countSolutions(grid, words) !== 1) continue;
    return {
      id,
      theme: theme.name,
      emoji: theme.emoji,
      rows: ROWS,
      cols: COLS,
      grid: grid.join(''),
      words: words.map((word, k) => ({word, path: paths[k]})),
    };
  }
  throw new Error(`Could not build level ${id} for theme ${theme.name}`);
}

const out = path.join(__dirname, '..', 'src', 'data', 'levelData.json');
let levels = [];
if (fs.existsSync(out)) {
  try {
    const existing = JSON.parse(fs.readFileSync(out, 'utf8'));
    if (Array.isArray(existing) && existing.length > 0) {
      levels = existing.slice(0, Math.min(existing.length, LEVEL_COUNT));
      console.log(`Loaded ${levels.length} existing levels from ${out}`);
    }
  } catch (e) {
    levels = [];
  }
}

const startId = levels.length + 1;
let queue = [];
let lastTheme = levels.length > 0 ? THEMES.find(t => t.name === levels[levels.length - 1].theme) : null;
for (let id = startId; id <= LEVEL_COUNT; id++) {
  if (!queue.length) {
    queue = shuffle(THEMES);
    if (queue[0] === lastTheme) queue.push(queue.shift());
  }
  lastTheme = queue.shift();
  levels.push(buildLevel(id, lastTheme));
  if (id % 25 === 0 || id === LEVEL_COUNT) {
    console.log(`Generated level ${id}/${LEVEL_COUNT}...`);
  }
}

// Sanity checks
for (const lv of levels) {
  const seen = new Set();
  lv.words.forEach(({word, path: p}, k) => {
    if (word.length !== LENGTHS[k]) throw new Error(`L${lv.id}: bad word length`);
    p.forEach((cell, i) => {
      if (seen.has(cell)) throw new Error(`L${lv.id}: cell reused`);
      seen.add(cell);
      if (lv.grid[cell] !== word[i]) throw new Error(`L${lv.id}: letter mismatch`);
      if (i > 0 && !neighbors(p[i - 1]).includes(cell)) throw new Error(`L${lv.id}: non-adjacent step`);
    });
  });
  const open = lv.grid.split('').filter(ch => ch !== '#').length;
  if (seen.size !== open) throw new Error(`L${lv.id}: open tiles not fully covered`);
}

fs.mkdirSync(path.dirname(out), {recursive: true});
fs.writeFileSync(out, JSON.stringify(levels));
console.log(`Wrote ${levels.length} levels to ${out}`);
