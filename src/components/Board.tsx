import React, {useEffect, useMemo, useRef} from 'react';
import {Animated, PanResponder, StyleSheet, Text, View} from 'react-native';
import {Level, WALL} from '../data/levels';
import {dragOnto, press, tapRelease} from '../game/selection';
import {useTheme} from '../state/ThemeContext';
import {fonts, radius, Swatch} from '../theme';

type Props = {
  level: Level;
  size: number;
  /** cell index -> found word index */
  foundCells: Map<number, number>;
  found: number[];
  selection: number[];
  hintCells: Set<number>;
  /** A rejected path, briefly shown in an error/warning color. */
  flash?: {cells: number[]; swatch: Swatch} | null;
  disabled?: boolean;
  /** `dragging` is true while the finger is sliding across tiles. */
  onSelectionChange: (cells: number[], dragging: boolean) => void;
  /** Finger lifted after dragging across at least one new tile. */
  onDragEnd: (cells: number[]) => void;
};

const GAP_RATIO = 0.14;
/** Thickness of the small rounded link between tiles of a word, as a fraction of a cell. */
const LINK = 0.26;

/**
 * Letter grid. Selection works like Wend: tap a tile, then tap (or drag onto) touching
 * tiles to extend the path. Tapping the last tile removes it; tapping an earlier tile in
 * the path cuts back to it; tapping anywhere else starts a new path.
 */
export default function Board({
  level,
  size,
  foundCells,
  found,
  selection,
  hintCells,
  flash,
  disabled,
  onSelectionChange,
  onDragEnd,
}: Props) {
  const {c} = useTheme();
  const {rows, cols, grid} = level;
  const cell = size / Math.max(rows, cols);
  const width = cell * cols;
  const height = cell * rows;
  const gap = cell * GAP_RATIO;

  const sel = useRef<number[]>([]);
  sel.current = selection;

  // Latest values for the responder, which is created once.
  const live = useRef({
    foundCells,
    disabled,
    onSelectionChange,
    onDragEnd,
    rows,
    cols,
    cell,
    grid,
  });
  live.current = {
    foundCells,
    disabled,
    onSelectionChange,
    onDragEnd,
    rows,
    cols,
    cell,
    grid,
  };

  const responder = useMemo(() => {
    /**
     * Per-gesture bookkeeping. Finger positions are tracked relative to the board: the
     * touch-down point (locationX/Y — every child has pointerEvents="none", so the board is
     * always the touch target) plus the drag distance. Screen-absolute coordinates are avoided
     * because many Android phones offset them by the status bar, which made touches miss.
     */
    const gesture = {pressedLast: false, moved: false, x0: 0, y0: 0};

    /** Cell at board point (x, y); while dragging, requires being well inside it so diagonal swipes don't misfire. */
    const hit = (x: number, y: number, strict: boolean) => {
      const L = live.current;
      const c = Math.floor(x / L.cell);
      const r = Math.floor(y / L.cell);
      if (r < 0 || c < 0 || r >= L.rows || c >= L.cols) {
        return -1;
      }
      if (strict) {
        const fx = x / L.cell - c;
        const fy = y / L.cell - r;
        const m = 0.15;
        if (fx < m || fx > 1 - m || fy < m || fy > 1 - m) {
          return -1;
        }
      }
      return r * L.cols + c;
    };

    const open = (idx: number) => {
      const L = live.current;
      return idx >= 0 && L.grid[idx] !== WALL && !L.foundCells.has(idx);
    };

    const set = (cells: number[], dragging = false) => {
      sel.current = cells;
      live.current.onSelectionChange(cells, dragging);
    };

    return PanResponder.create({
      onStartShouldSetPanResponder: () => !live.current.disabled,
      onMoveShouldSetPanResponder: () => !live.current.disabled,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: e => {
        gesture.x0 = e.nativeEvent.locationX;
        gesture.y0 = e.nativeEvent.locationY;
        gesture.moved = false;
        gesture.pressedLast = false;
        const idx = hit(gesture.x0, gesture.y0, false);
        if (!open(idx)) {
          return;
        }
        const {cells, pressedLast} = press(sel.current, idx, live.current.cols);
        gesture.pressedLast = pressedLast;
        if (cells !== sel.current) {
          set(cells);
        }
      },
      onPanResponderMove: (_e, g) => {
        const idx = hit(gesture.x0 + g.dx, gesture.y0 + g.dy, true);
        const next = open(idx)
          ? dragOnto(sel.current, idx, live.current.cols)
          : null;
        if (next) {
          gesture.moved = true;
          set(next, true);
        }
      },
      onPanResponderRelease: () => {
        if (gesture.moved) {
          live.current.onDragEnd(sel.current);
          return;
        }
        const next = tapRelease(sel.current, gesture.pressedLast);
        if (next) {
          set(next);
        }
      },
      onPanResponderTerminate: () => set([]),
    });
  }, []);

  const center = (i: number) => ({
    x: (i % cols) * cell + cell / 2,
    y: Math.floor(i / cols) * cell + cell / 2,
  });

  const connector = (a: number, b: number, color: string, key: string) => {
    const p = center(a);
    const q = center(b);
    const horizontal = p.y === q.y;
    const thick = cell * LINK;
    return (
      <View
        key={key}
        pointerEvents="none"
        style={[
          styles.link,
          {
            backgroundColor: color,
            borderRadius: thick / 2,
            left: horizontal ? Math.min(p.x, q.x) : p.x - thick / 2,
            top: horizontal ? p.y - thick / 2 : Math.min(p.y, q.y),
            width: horizontal ? cell : thick,
            height: horizontal ? thick : cell,
          },
        ]}
      />
    );
  };

  /** Links between consecutive tiles of a path; visible in the gaps between tiles. */
  const linksFor = (path: number[], color: string, prefix: string) =>
    path
      .slice(1)
      .map((cellIdx, i) => connector(path[i], cellIdx, color, `${prefix}${i}`));

  const links: React.ReactNode[] = [];
  found.forEach(w =>
    links.push(
      ...linksFor(
        level.words[w].path,
        c.words[w % c.words.length].fill,
        `f${w}-`,
      ),
    ),
  );
  links.push(...linksFor(selection, c.select.fill, 's'));
  if (flash) {
    links.push(...linksFor(flash.cells, flash.swatch.fill, 'x'));
  }
  const flashSet = new Set(flash?.cells ?? []);
  const selectedSet = new Set(selection);

  return (
    <View style={[styles.board, {width, height}]} {...responder.panHandlers}>
      {links}
      {grid.split('').map((letter, i) => {
        const left = (i % cols) * cell + gap / 2;
        const top = Math.floor(i / cols) * cell + gap / 2;
        if (letter === WALL) {
          return <Wall key={i} left={left} top={top} size={cell - gap} />;
        }
        const w = foundCells.get(i);
        let swatch: Swatch | undefined;
        if (flashSet.has(i) && flash) {
          swatch = flash.swatch;
        } else if (w !== undefined) {
          swatch = c.words[w % c.words.length];
        } else if (selectedSet.has(i)) {
          swatch = c.select;
        }
        return (
          <Tile
            key={i}
            letter={letter}
            left={left}
            top={top}
            size={cell - gap}
            swatch={swatch}
            isHead={selection[selection.length - 1] === i}
            found={w !== undefined}
            hinted={hintCells.has(i) && !swatch}
          />
        );
      })}
    </View>
  );
}

function Wall({left, top, size}: {left: number; top: number; size: number}) {
  const {c} = useTheme();
  const r = Math.min(radius.md, size * 0.28);
  return (
    <View
      pointerEvents="none"
      style={[
        styles.tile,
        styles.wall,
        {
          left,
          top,
          width: size,
          height: size,
          borderRadius: r,
          backgroundColor: c.wall,
          borderColor: c.wallBorder,
        },
      ]}>
      <View
        style={[
          styles.wallInner,
          {
            width: size * 0.36,
            height: size * 0.36,
            borderRadius: r * 0.5,
            backgroundColor: c.wallBorder,
          },
        ]}
      />
    </View>
  );
}

type TileProps = {
  letter: string;
  left: number;
  top: number;
  size: number;
  /** Colored state (found, selected or flashing); plain tile when undefined. */
  swatch?: Swatch;
  isHead: boolean;
  found: boolean;
  hinted: boolean;
};

/** A raised game tile: darker bottom edge, soft top shine when colored, bold letter. */
const Tile = React.memo(function Tile({
  letter,
  left,
  top,
  size,
  swatch,
  isHead,
  found,
  hinted,
}: TileProps) {
  const {c} = useTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const wasFound = useRef(found);

  useEffect(() => {
    if (isHead) {
      scale.setValue(0.86);
      Animated.spring(scale, {
        toValue: 1,
        friction: 4,
        tension: 220,
        useNativeDriver: true,
      }).start();
    }
  }, [isHead, scale]);

  useEffect(() => {
    if (found && !wasFound.current) {
      scale.setValue(1.15);
      Animated.spring(scale, {
        toValue: 1,
        friction: 3,
        tension: 160,
        useNativeDriver: true,
      }).start();
    }
    wasFound.current = found;
  }, [found, scale]);

  const r = Math.min(radius.md, size * 0.26);
  const edge = Math.max(3, Math.round(size * 0.06));
  const bg = swatch ? swatch.fill : c.tile;
  const shade = swatch ? swatch.shade : hinted ? c.gold : c.tileShade;
  const fg = swatch ? c.onWord : hinted ? c.gold : c.text;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.tile,
        {
          left,
          top,
          width: size,
          height: size,
          borderRadius: r,
          backgroundColor: bg,
          borderColor: swatch ? swatch.shade : hinted ? c.gold : c.tileBorder,
          borderWidth: hinted ? 2 : 1,
          borderBottomColor: shade,
          borderBottomWidth: edge,
          transform: [{scale}],
        },
      ]}>
      {swatch ? (
        <View
          style={[styles.shine, {borderRadius: r * 0.8, height: size * 0.32}]}
        />
      ) : null}
      <Text
        allowFontScaling={false}
        style={[
          styles.letter,
          {fontSize: size * 0.44, color: fg, marginTop: edge / 2},
          swatch
            ? {
                textShadowColor: swatch.shade,
                textShadowOffset: {width: 0, height: 1.5},
                textShadowRadius: 0,
              }
            : null,
        ]}>
        {letter}
      </Text>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  // A (transparent) background keeps Android from flattening the board view away,
  // so it always receives touches.
  board: {backgroundColor: 'rgba(0,0,0,0.001)'},
  link: {position: 'absolute'},
  tile: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wall: {borderWidth: 1},
  shine: {
    position: 'absolute',
    top: 3,
    left: 5,
    right: 5,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  wallInner: {opacity: 0.6},
  letter: {
    fontFamily: fonts.heavy,
    includeFontPadding: false,
  },
});
