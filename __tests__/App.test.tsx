/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';
import {LEVELS, WALL} from '../src/data/levels';

jest.useFakeTimers();

test('renders the home screen', async () => {
  let tree: ReactTestRenderer.ReactTestRenderer | undefined;
  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(<App />);
  });
  const texts = tree!.root
    .findAll(n => n.props.children !== undefined && (typeof n.props.children === 'string' || Array.isArray(n.props.children)))
    .map(n => [].concat(n.props.children).filter(x => typeof x !== 'object').join(''));
  expect(texts).toContain('START PLAYING');
  expect(texts).toContain('Level 1');
  await ReactTestRenderer.act(async () => tree!.unmount());
});

test('ships 200 Wend-rule levels', () => {
  expect(LEVELS).toHaveLength(200);
  for (const lv of LEVELS) {
    // four words of lengths 3, 4, 5, 6
    expect(lv.words.map(w => w.word.length)).toEqual([3, 4, 5, 6]);
    // every open tile used exactly once, walls never used
    const cells = lv.words.flatMap(w => w.path);
    const open = lv.grid.split('').filter(ch => ch !== WALL).length;
    expect(new Set(cells).size).toBe(cells.length);
    expect(cells.length).toBe(open);
    lv.words.forEach(w =>
      w.path.forEach((c, i) => {
        expect(lv.grid[c]).toBe(w.word[i]);
        if (i > 0) {
          const d = Math.abs(c - w.path[i - 1]);
          const sameRow = Math.floor(c / lv.cols) === Math.floor(w.path[i - 1] / lv.cols);
          expect(d === lv.cols || (d === 1 && sameRow)).toBe(true);
        }
      }),
    );
  }
});

test('theme can be switched between light and dark', async () => {
  let tree: ReactTestRenderer.ReactTestRenderer | undefined;
  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(<App />);
  });
  const bg = () => {
    const flat = (s: any): any => (Array.isArray(s) ? Object.assign({}, ...s.map(flat)) : s || {});
    return flat(tree!.root.findAll(n => n.props.style && flat(n.props.style).flex === 1)[0].props.style).backgroundColor;
  };
  const press = async (label: string) => {
    const btn = tree!.root.find(n => n.props.accessibilityLabel?.startsWith(label) && typeof n.props.onPress === 'function');
    await ReactTestRenderer.act(async () => btn.props.onPress());
  };
  await press('Light theme');
  expect(bg()).toBe('#F3F4FA');
  await press('Switch to dark theme');
  expect(bg()).toBe('#0B0D1F');
  await press('Switch to light theme');
  expect(bg()).toBe('#F3F4FA');
  await ReactTestRenderer.act(async () => tree!.unmount());
});
