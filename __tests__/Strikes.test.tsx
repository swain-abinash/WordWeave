/**
 * Tests for the 3-strike attempt limit, warning modal, and level reset mechanics.
 */

import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import Board from '../src/components/Board';
import StrikeWarningModal from '../src/components/StrikeWarningModal';
import LevelFailedModal from '../src/components/LevelFailedModal';
import {LEVELS} from '../src/data/levels';
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
        <GameScreen
          levelId={levelId}
          onBack={() => {}}
          onNext={() => {}}
          onLevels={() => {}}
        />
      </ProgressProvider>,
    );
  });
  return tree!;
}

const board = (tree: Tree) => tree.root.findByType(Board).props;
const texts = (tree: Tree) =>
  tree.root
    .findAll(
      n =>
        typeof n.props.children === 'string' ||
        Array.isArray(n.props.children),
    )
    .map(n => [].concat(n.props.children).join(''));
const hasText = (tree: Tree, s: string) => texts(tree).some(t => t.includes(s));

async function dragPath(tree: Tree, path: number[]) {
  await act(async () => board(tree).onSelectionChange(path.slice(0, 1), false));
  for (let k = 2; k <= path.length; k++) {
    await act(async () => board(tree).onSelectionChange(path.slice(0, k), true));
  }
  await act(async () => board(tree).onDragEnd(path));
}

const level = LEVELS[0];

describe('3-Strike Attempt Limit and Level Reset', () => {
  test('starts with full 3/3 chances indicator', async () => {
    const tree = await renderLevel(1);
    expect(hasText(tree, '3/3')).toBe(true);
    await act(async () => tree.unmount());
  });

  test('decrements chances on incorrect guesses and shows Strike Warning at 3 strikes', async () => {
    const tree = await renderLevel(1);

    // Invalid path: 3 cells that don't spell a valid word in level 1
    const invalidPath1 = [0, 1, 2];
    await dragPath(tree, invalidPath1);
    expect(hasText(tree, '2/3')).toBe(true);
    expect(hasText(tree, 'Strike 1/3')).toBe(true);

    const invalidPath2 = [0, 4, 8];
    await dragPath(tree, invalidPath2);
    expect(hasText(tree, '1/3')).toBe(true);
    expect(hasText(tree, 'Strike 2/3')).toBe(true);

    const invalidPath3 = [1, 2, 3];
    await dragPath(tree, invalidPath3);
    expect(hasText(tree, '0/3')).toBe(true);

    // Fast-forward 500ms for modal trigger
    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    // Verify Strike Warning Modal is visible
    const warningModal = tree.root.findByType(StrikeWarningModal);
    expect(warningModal.props.visible).toBe(true);

    await act(async () => tree.unmount());
  });

  test('finding a correct word resets chances back to 3/3', async () => {
    const tree = await renderLevel(1);

    // Make 2 wrong attempts
    await dragPath(tree, [0, 1, 2]);
    await dragPath(tree, [0, 4, 8]);
    expect(hasText(tree, '1/3')).toBe(true);

    // Find the first correct word
    await dragPath(tree, level.words[0].path);
    expect(board(tree).found).toEqual([0]);

    // Chances must be refreshed back to 3/3 for the next word!
    expect(hasText(tree, '3/3')).toBe(true);

    await act(async () => tree.unmount());
  });

  test('4th wrong attempt resets the level to the beginning', async () => {
    const tree = await renderLevel(1);

    // Find the first word ("BUD")
    await dragPath(tree, level.words[0].path);
    expect(board(tree).found).toEqual([0]);

    // Now try guessing next word and fail 4 times using cells not locked by BUD ([7, 6, 1])
    await dragPath(tree, [8, 9, 13]); // Strike 1
    await dragPath(tree, [10, 15, 21]); // Strike 2
    await dragPath(tree, [24, 23, 17]); // Strike 3

    // Advance timer so Strike Warning modal appears
    await act(async () => {
      jest.advanceTimersByTime(500);
    });
    const warningModal = tree.root.findByType(StrikeWarningModal);
    expect(warningModal.props.visible).toBe(true);

    // Player chooses "Risk It (1 Chance Left)" to continue without ad
    await act(async () => {
      warningModal.props.onClose();
    });

    // Player makes 4th wrong attempt!
    await dragPath(tree, [12, 17, 22]); // Strike 4: Penalty trigger

    // Advance timer so LevelFailed modal triggers
    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    // Level must be RESET back to 0 found words!
    expect(board(tree).found).toEqual([]);

    const failedModal = tree.root.findByType(LevelFailedModal);
    expect(failedModal.props.visible).toBe(true);

    await act(async () => tree.unmount());
  });
});
