/**
 * Pure tap/drag rules for tracing a path on the board. Board.tsx feeds touch events in;
 * keeping the rules here makes them unit-testable without a touch screen.
 *
 * Cells are row-major indexes; `open(i)` says whether tile i can be used (not a wall,
 * not part of a found word).
 */

export const isAdjacent = (a: number, b: number, cols: number) =>
  Math.abs(a - b) === cols || (Math.abs(a - b) === 1 && Math.floor(a / cols) === Math.floor(b / cols));

/**
 * Finger down on tile `idx`.
 * - on the last tile of the path: keep it (`pressedLast`), so a tap removes it but a drag continues
 * - on an earlier tile of the path: cut the path back to it
 * - next to the end of the path: extend the path
 * - anywhere else: start a new path
 */
export function press(cur: number[], idx: number, cols: number): {cells: number[]; pressedLast: boolean} {
  const pos = cur.indexOf(idx);
  if (pos >= 0 && pos === cur.length - 1) {
    return {cells: cur, pressedLast: true};
  }
  if (pos >= 0) {
    return {cells: cur.slice(0, pos + 1), pressedLast: false};
  }
  if (cur.length && isAdjacent(cur[cur.length - 1], idx, cols)) {
    return {cells: [...cur, idx], pressedLast: false};
  }
  return {cells: [idx], pressedLast: false};
}

/** Finger slides onto tile `idx`: extend the path, or step back one tile. Returns null for no change. */
export function dragOnto(cur: number[], idx: number, cols: number): number[] | null {
  if (!cur.length || idx === cur[cur.length - 1]) {
    return null;
  }
  if (cur.length >= 2 && cur[cur.length - 2] === idx) {
    return cur.slice(0, -1);
  }
  if (!cur.includes(idx) && isAdjacent(cur[cur.length - 1], idx, cols)) {
    return [...cur, idx];
  }
  return null;
}

/** Finger lifted without dragging: a tap on the path's last tile removes it. Returns null for no change. */
export function tapRelease(cur: number[], pressedLast: boolean): number[] | null {
  return pressedLast ? cur.slice(0, -1) : null;
}
