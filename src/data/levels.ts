import raw from './levelData.json';

export type LevelWord = {word: string; path: number[]};

export type Level = {
  id: number;
  theme: string;
  emoji: string;
  rows: number;
  cols: number;
  /** Row-major letters, length rows * cols. WALL marks a blocked tile. */
  grid: string;
  /** Exactly four words, of lengths 3, 4, 5 and 6, in that order. */
  words: LevelWord[];
};

export const WALL = '#';

export const LEVELS = raw as Level[];
export const TOTAL_LEVELS = LEVELS.length;

export const getLevel = (id: number): Level => LEVELS[id - 1];

export type Chapter = {title: string; subtitle: string; from: number; to: number};

/** Paths get windier as levels go on (see twistFor in scripts/generateLevels.js). */
export const CHAPTERS: Chapter[] = [
  {title: 'Warm Up', subtitle: 'Gentle paths', from: 1, to: 20},
  {title: 'Winding', subtitle: 'More turns', from: 21, to: 50},
  {title: 'Twisty', subtitle: 'Tight corners', from: 51, to: 80},
  {title: 'Grandmaster', subtitle: 'Full serpentine', from: 81, to: 100},
  {title: 'Serpentine', subtitle: 'Clever bends', from: 101, to: 135},
  {title: 'Labyrinth', subtitle: 'Maze-like paths', from: 136, to: 170},
  {title: 'Legendary', subtitle: 'Ultimate maze weaving', from: 171, to: 200},
];
