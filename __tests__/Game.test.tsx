/**
 * Gameplay tests: drive GameScreen through the same callbacks the board's touch handler fires.
 * @format
 */

import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import Board from '../src/components/Board';
import {LEVELS, WALL} from '../src/data/levels';
import GameScreen from '../src/screens/GameScreen';
import {ProgressProvider} from '../src/state/ProgressContext';

jest.useFakeTimers();
jest.setTimeout(30000);

type Tree = ReactTestRenderer.ReactTestRenderer;

async function renderLevel(levelId: number) {
  let tree: Tree | undefined;
  await act(async () => {
    tree = ReactTestRenderer.create(
      <ProgressProvider>
        <GameScreen levelId={levelId} onBack={() => {}} onNext={() => {}} onLevels={() => {}} />
      </ProgressProvider>,
    );
  });
  return tree!;
}

const board = (tree: Tree) => tree.root.findByType(Board).props;
const texts = (tree: Tree) =>
  tree.root
    .findAll(n => typeof n.props.children === 'string' || Array.isArray(n.props.children))
    .map(n => [].concat(n.props.children).join(''));
const hasText = (tree: Tree, s: string) => texts(tree).some(t => t.includes(s));

/** Tap tiles one at a time. */
async function tapPath(tree: Tree, path: number[]) {
  for (let k = 1; k <= path.length; k++) {
    await act(async () => board(tree).onSelectionChange(path.slice(0, k), false));
  }
}

/** Drag through tiles, then lift the finger. */
async function dragPath(tree: Tree, path: number[]) {
  await act(async () => board(tree).onSelectionChange(path.slice(0, 1), false));
  for (let k = 2; k <= path.length; k++) {
    await act(async () => board(tree).onSelectionChange(path.slice(0, k), true));
  }
  await act(async () => board(tree).onDragEnd(path));
}

const press = async (tree: Tree, label: string) => {
  const btn = tree.root.find(n => n.props.accessibilityLabel === label && typeof n.props.onPress === 'function');
  await act(async () => btn.props.onPress());
};

const level = LEVELS[0];

test('tapping a word path locks it in', async () => {
  const tree = await renderLevel(1);
  expect(hasText(tree, '0/4')).toBe(true);
  await tapPath(tree, level.words[0].path);
  expect(hasText(tree, '1/4')).toBe(true);
  expect(board(tree).found).toEqual([0]);
  await act(async () => tree.unmount());
});

test('dragging a word path locks it in', async () => {
  const tree = await renderLevel(1);
  await dragPath(tree, level.words[3].path);
  expect(board(tree).found).toEqual([3]);
  await act(async () => tree.unmount());
});

test('a path that is not a hidden word is rejected and cleared', async () => {
  const tree = await renderLevel(1);
  // Follow the 6-letter word part-way, then turn off it onto another open tile.
  const p = level.words[3].path;
  const adjacent = (x: number, y: number) =>
    Math.abs(x - y) === level.cols || (Math.abs(x - y) === 1 && Math.floor(x / level.cols) === Math.floor(y / level.cols));
  let wrong: number[] | undefined;
  for (let k = 1; k < p.length - 1 && !wrong; k++) {
    const turn = [...level.grid]
      .map((_, i) => i)
      .find(i => level.grid[i] !== WALL && adjacent(p[k], i) && !p.slice(0, k + 2).includes(i));
    if (turn !== undefined) {
      wrong = [...p.slice(0, k + 1), turn];
    }
  }
  expect(wrong).toBeDefined();
  await dragPath(tree, wrong!);
  expect(board(tree).found).toEqual([]);
  expect(board(tree).selection).toEqual([]);
  await act(async () => tree.unmount());
});

test('undo removes the last letter, then the last word; reset clears the board', async () => {
  const tree = await renderLevel(1);
  await tapPath(tree, level.words[0].path);
  await tapPath(tree, level.words[1].path);
  expect(board(tree).found).toEqual([0, 1]);

  await act(async () => board(tree).onSelectionChange(level.words[2].path.slice(0, 2), false));
  await press(tree, 'Undo');
  expect(board(tree).selection).toEqual(level.words[2].path.slice(0, 1));
  await press(tree, 'Undo');
  await press(tree, 'Undo');
  expect(board(tree).found).toEqual([0]);

  await press(tree, 'Reset');
  expect(board(tree).found).toEqual([]);
  await act(async () => tree.unmount());
});

test('hint reveals the next letter of a word on the board', async () => {
  const tree = await renderLevel(1);
  await press(tree, 'Hint');
  expect([...board(tree).hintCells]).toEqual([level.words[0].path[0]]);
  await press(tree, 'Hint');
  expect([...board(tree).hintCells]).toEqual(level.words[0].path.slice(0, 2));
  await act(async () => tree.unmount());
});

test('finding all four words solves the level and shows the win card', async () => {
  const tree = await renderLevel(1);
  for (const w of level.words) {
    await tapPath(tree, w.path);
  }
  expect(hasText(tree, '4/4')).toBe(true);
  await act(async () => {
    jest.advanceTimersByTime(1000);
  });
  expect(hasText(tree, 'Flawless!')).toBe(true);
  expect(hasText(tree, 'Next Level')).toBe(true);
  await act(async () => tree.unmount());
});

/** All paths in a grid spelling `word`. */
function pathsFor(grid: string, cols: number, word: string): number[][] {
  const out: number[][] = [];
  const nb = (i: number) =>
    [i - cols, i + cols, i % cols ? i - 1 : -1, i % cols < cols - 1 ? i + 1 : -1].filter(n => n >= 0 && n < grid.length);
  const dfs = (cells: number[]) => {
    if (cells.length === word.length) {
      out.push(cells.slice());
      return;
    }
    for (const n of nb(cells[cells.length - 1])) {
      if (grid[n] === word[cells.length] && !cells.includes(n)) {
        dfs([...cells, n]);
      }
    }
  };
  for (let s = 0; s < grid.length; s++) {
    if (grid[s] === word[0]) {
      dfs([s]);
    }
  }
  return out;
}

test('the right word along the wrong path is not accepted', async () => {
  // find a level/word that can be spelled along a second path
  let pick: {id: number; alt: number[]} | undefined;
  for (const lv of LEVELS) {
    for (const w of lv.words) {
      const alt = pathsFor(lv.grid, lv.cols, w.word).find(p => p.join() !== w.path.join());
      if (alt) {
        pick = {id: lv.id, alt};
        break;
      }
    }
    if (pick) {
      break;
    }
  }
  if (!pick) {
    return; // no such board in this level set
  }
  const tree = await renderLevel(pick.id);
  await dragPath(tree, pick.alt);
  expect(board(tree).found).toEqual([]);
  expect(hasText(tree, 'Try another path')).toBe(true);
  await act(async () => tree.unmount());
});
