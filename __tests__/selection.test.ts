import {dragOnto, isAdjacent, press, tapRelease} from '../src/game/selection';

const COLS = 5;

test('first tap on an empty board selects that tile', () => {
  // regression: an empty path used to count as "tapped the last tile", so nothing ever got selected
  expect(press([], 7, COLS)).toEqual({cells: [7], pressedLast: false});
  expect(tapRelease([7], false)).toBeNull(); // lifting the finger keeps it selected
});

test('tapping touching tiles builds a path', () => {
  let cells = press([], 7, COLS).cells;
  cells = press(cells, 6, COLS).cells; // left of 7
  cells = press(cells, 1, COLS).cells; // above 6
  expect(cells).toEqual([7, 6, 1]);
});

test('tapping the last tile again removes it', () => {
  const r = press([7, 6], 6, COLS);
  expect(r).toEqual({cells: [7, 6], pressedLast: true});
  expect(tapRelease(r.cells, r.pressedLast)).toEqual([7]);
});

test('tapping an earlier tile cuts the path back; a far tile starts a new path', () => {
  expect(press([7, 6, 1], 7, COLS).cells).toEqual([7]);
  expect(press([7, 6], 24, COLS).cells).toEqual([24]);
});

test('dragging extends, backtracks, and ignores non-touching tiles', () => {
  expect(dragOnto([], 7, COLS)).toBeNull(); // nothing to extend
  expect(dragOnto([10], 15, COLS)).toEqual([10, 15]); // down
  expect(dragOnto([10, 15], 16, COLS)).toEqual([10, 15, 16]); // right
  expect(dragOnto([10, 15, 16], 15, COLS)).toEqual([10, 15]); // slide back
  expect(dragOnto([10, 15], 15, COLS)).toBeNull(); // same tile
  expect(dragOnto([10, 15], 21, COLS)).toBeNull(); // diagonal
  expect(dragOnto([10, 15, 16], 10, COLS)).toBeNull(); // already used, not a backtrack
});

test('a drag that starts from a fresh tap continues from it', () => {
  const start = press([], 10, COLS);
  expect(start.cells).toEqual([10]);
  expect(dragOnto(start.cells, 15, COLS)).toEqual([10, 15]);
});

test('adjacency does not wrap across rows', () => {
  expect(isAdjacent(4, 5, COLS)).toBe(false); // end of row 0 → start of row 1
  expect(isAdjacent(5, 6, COLS)).toBe(true);
  expect(isAdjacent(2, 7, COLS)).toBe(true);
});
