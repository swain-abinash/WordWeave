import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  Animated,
  AppState,
  StyleSheet,
  Text,
  useWindowDimensions,
  Vibration,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Board from '../components/Board';
import HowToPlay from '../components/HowToPlay';
import Icon, {IconName} from '../components/Icon';
import {IconButton, PressableScale, ThemeToggle} from '../components/ui';
import WinModal from '../components/WinModal';
import WordSlots from '../components/WordSlots';
import {getLevel, TOTAL_LEVELS} from '../data/levels';
import {formatTime, useProgress} from '../state/ProgressContext';
import {useStyles, useTheme} from '../state/ThemeContext';
import {fonts, kicker, Palette, radius, Swatch} from '../theme';

type Props = {
  levelId: number;
  onBack: () => void;
  onNext: (id: number) => void;
  onLevels: () => void;
};

type Tone = 'success' | 'route' | 'info' | 'miss';
const TONE_ICON: Record<Tone, IconName> = {
  success: 'checkCircle',
  route: 'route',
  info: 'info',
  miss: 'xCircle',
};

const starsFor = (hintsUsed: number) =>
  hintsUsed === 0 ? 3 : hintsUsed <= 2 ? 2 : 1;
const startsWith = (path: number[], cells: number[]) =>
  cells.every((c, i) => path[i] === c);

export default function GameScreen({levelId, onBack, onNext, onLevels}: Props) {
  const level = getLevel(levelId);
  const {progress, saveLevel, recordWord, completeLevel} = useProgress();
  const {c} = useTheme();
  const styles = useStyles(makeStyles);
  const {width, height} = useWindowDimensions();

  const saved = progress.saves[levelId];
  const [found, setFound] = useState<number[]>(saved?.found ?? []);
  const [hintsUsed, setHintsUsed] = useState(saved?.hintsUsed ?? 0);
  const [reveals, setReveals] = useState<Record<number, number>>(
    saved?.reveals ?? {},
  );
  const [elapsed, setElapsed] = useState(saved?.elapsed ?? 0);
  const [selection, setSelection] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<{
    text: string;
    tone: Tone;
    key: number;
  } | null>(null);
  const [won, setWon] = useState(false);
  const [flash, setFlash] = useState<{cells: number[]; swatch: Swatch} | null>(
    null,
  );
  const flashTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  useEffect(() => () => clearTimeout(flashTimer.current), []);
  const [showRules, setShowRules] = useState<boolean>(levelId === 1 && !saved);

  const shake = useRef(new Animated.Value(0)).current;
  const fbOpacity = useRef(new Animated.Value(0)).current;
  const solved = found.length === level.words.length;

  const toneColor: Record<Tone, string> = {
    success: c.success,
    route: c.gold,
    info: c.textDim,
    miss: c.danger,
  };

  // Latest state for callbacks fired from the board's gesture handler.
  const state = useRef({found, hintsUsed, reveals, elapsed, solved});
  state.current = {found, hintsUsed, reveals, elapsed, solved};

  // ---- clock: runs while the level is unsolved, the app is in front and no sheet covers the board
  const [appActive, setAppActive] = useState(
    AppState.currentState === 'active',
  );
  useEffect(() => {
    const sub = AppState.addEventListener('change', s =>
      setAppActive(s === 'active'),
    );
    return () => sub.remove();
  }, []);
  const clockRunning = !solved && appActive && !showRules;
  useEffect(() => {
    if (!clockRunning) {
      return;
    }
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, [clockRunning]);

  // ---- persistence: on every move, plus the clock when leaving or backgrounding
  const persist = () => {
    const s = state.current;
    if (!s.solved && (s.found.length || s.hintsUsed || s.elapsed)) {
      saveLevel(levelId, {
        found: s.found,
        hintsUsed: s.hintsUsed,
        reveals: s.reveals,
        elapsed: s.elapsed,
      });
    }
  };
  useEffect(persist, [found, hintsUsed, reveals]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!appActive) {
      persist();
    }
  }, [appActive]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => persist, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ---- feedback message (shown above the board, then fades)
  useEffect(() => {
    if (!feedback) {
      return;
    }
    fbOpacity.setValue(1);
    const anim = Animated.timing(fbOpacity, {
      toValue: 0,
      duration: 400,
      delay: 1500,
      useNativeDriver: true,
    });
    anim.start(
      ({finished}) =>
        finished && setFeedback(f => (f?.key === feedback.key ? null : f)),
    );
    return () => anim.stop();
  }, [feedback, fbOpacity]);

  const say = (text: string, tone: Tone) =>
    setFeedback(f => ({text, tone, key: (f?.key ?? 0) + 1}));

  const doShake = () => {
    Vibration.vibrate(30);
    shake.setValue(0);
    Animated.sequence(
      [10, -10, 7, -7, 3, 0].map(v =>
        Animated.timing(shake, {
          toValue: v,
          duration: 45,
          useNativeDriver: true,
        }),
      ),
    ).start();
  };

  const foundCells = useMemo(() => {
    const m = new Map<number, number>();
    found.forEach(w => level.words[w].path.forEach(cell => m.set(cell, w)));
    return m;
  }, [found, level]);

  const hintCells = useMemo(() => {
    const s = new Set<number>();
    Object.entries(reveals).forEach(([w, n]) => {
      if (!found.includes(Number(w))) {
        level.words[Number(w)].path.slice(0, n).forEach(cell => s.add(cell));
      }
    });
    return s;
  }, [reveals, found, level]);

  // ---- word checking
  const unfound = () =>
    level.words.map((_, i) => i).filter(i => !state.current.found.includes(i));
  const spell = (cells: number[]) =>
    cells.map(cell => level.grid[cell]).join('');

  /** Locks in a word if `cells` is exactly its path. */
  const tryLock = (cells: number[]) => {
    const idx = unfound().find(i => {
      const p = level.words[i].path;
      return p.length === cells.length && startsWith(p, cells);
    });
    if (idx === undefined) {
      return false;
    }
    const next = [...state.current.found, idx];
    state.current = {...state.current, found: next}; // visible to gesture events before the re-render
    setFound(next);
    setSelection([]);
    recordWord();
    if (next.length === level.words.length) {
      const s = state.current;
      completeLevel(levelId, starsFor(s.hintsUsed), s.elapsed);
      say('Board cleared!', 'success');
      setTimeout(() => setWon(true), 700);
    } else {
      say(`${level.words[idx].word}! Nice find`, 'success');
    }
    return true;
  };

  /** Tell the player why a finished path didn't count, then clear it. */
  const reject = (cells: number[]) => {
    const letters = spell(cells);
    setSelection([]);
    const showFlash = (swatch: Swatch) => {
      clearTimeout(flashTimer.current);
      setFlash({cells, swatch});
      flashTimer.current = setTimeout(() => setFlash(null), 750);
    };
    if (unfound().some(i => level.words[i].word === letters)) {
      showFlash(c.near);
      say(`${letters} is a hidden word. Try another path`, 'route');
    } else if (cells.length >= 3) {
      showFlash(c.wrong);
      say(`${letters} is not a hidden word`, 'miss');
      doShake();
    }
  };

  const isLocked = (cell: number) =>
    state.current.found.some(w => level.words[w].path.includes(cell));

  const onSelectionChange = (cells: number[], dragging: boolean) => {
    if (cells.some(isLocked)) {
      setSelection([]); // finger kept moving after a word locked in
      return;
    }
    setSelection(cells);
    if (cells.length && flash) {
      clearTimeout(flashTimer.current);
      setFlash(null);
    }
    if (!cells.length || tryLock(cells)) {
      return;
    }
    if (dragging) {
      return; // judged when the finger lifts
    }
    // Tapping: once no hidden word could still continue this path, judge it.
    const open = unfound();
    const canGrow = open.some(
      i =>
        level.words[i].path.length > cells.length &&
        startsWith(level.words[i].path, cells),
    );
    const longest = Math.max(...open.map(i => level.words[i].word.length));
    const letters = spell(cells);
    if (
      !canGrow &&
      (cells.length >= longest ||
        open.some(i => level.words[i].word === letters))
    ) {
      reject(cells);
    }
  };

  const onDragEnd = (cells: number[]) => {
    if (!cells.length || cells.some(isLocked)) {
      setSelection([]);
      return;
    }
    if (!tryLock(cells)) {
      reject(cells);
    }
  };

  // ---- toolbar
  const undo = () => {
    if (selection.length) {
      setSelection(selection.slice(0, -1));
    } else if (found.length) {
      const last = found[found.length - 1];
      setFound(found.slice(0, -1));
      say(`Removed ${level.words[last].word}`, 'info');
    }
  };

  const reset = () => {
    if (!found.length && !selection.length) {
      return;
    }
    setFound([]);
    setSelection([]);
    say('Board cleared. Fresh start!', 'info');
  };

  const hint = () => {
    if (solved) {
      return;
    }
    const open = unfound().filter(
      i => (reveals[i] ?? 0) < level.words[i].word.length,
    );
    if (!open.length) {
      say('All letters shown. Trace the gold tiles', 'info');
      return;
    }
    const target = open.find(i => (reveals[i] ?? 0) > 0) ?? open[0];
    setReveals(r => ({...r, [target]: (r[target] ?? 0) + 1}));
    setHintsUsed(h => h + 1);
    say('Start from the gold letter', 'route');
  };

  // ---- layout: fit header + words + board + toolbar on one screen
  const compact = height < 720;
  const boardSize = Math.max(
    250,
    Math.min(width - 56, height - (compact ? 400 : 450), 440),
  );
  const preview = spell(selection);
  const canUndo = !solved && (selection.length > 0 || found.length > 0);

  let banner: React.ReactNode;
  if (preview) {
    banner = <Text style={styles.preview}>{preview}</Text>;
  } else if (feedback) {
    banner = (
      <Animated.View
        key={feedback.key}
        style={[
          styles.pill,
          {
            opacity: fbOpacity,
            borderColor: toneColor[feedback.tone],
            backgroundColor: `${toneColor[feedback.tone]}1A`,
          },
        ]}>
        <Icon
          name={TONE_ICON[feedback.tone]}
          size={16}
          color={toneColor[feedback.tone]}
        />
        <Text style={[styles.pillText, {color: toneColor[feedback.tone]}]}>
          {feedback.text}
        </Text>
      </Animated.View>
    );
  } else {
    banner = (
      <View style={styles.hintRow}>
        <Icon
          name={solved ? 'checkCircle' : 'swipe'}
          size={16}
          color={solved ? c.success : c.textMuted}
        />
        <Text style={[styles.hintText, solved && {color: c.success}]}>
          {solved
            ? 'Solved! Every letter used'
            : 'Tap or drag across touching letters'}
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <IconButton icon="back" label="Back" onPress={onBack} />
        <View style={styles.headerMid}>
          <Text style={styles.kicker}>LEVEL</Text>
          <Text style={styles.levelTitle}>{levelId}</Text>
        </View>
        <View
          style={styles.clock}
          accessibilityLabel={`Time ${formatTime(elapsed)}`}>
          <Icon name="clock" size={16} color={c.accentSoft} />
          <Text style={styles.clockText}>{formatTime(elapsed)}</Text>
        </View>
        <ThemeToggle />
        <IconButton
          icon="help"
          label="How to play"
          onPress={() => setShowRules(true)}
        />
      </View>

      <View style={styles.wordsCard}>
        <View style={styles.wordsHead}>
          <Text style={styles.wordsTitle}>Hidden words</Text>
          <View style={styles.progress}>
            {level.words.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.progressPip,
                  found.includes(i) && {
                    backgroundColor: c.words[i % c.words.length].fill,
                  },
                ]}
              />
            ))}
            <Text style={styles.progressText}>
              {found.length}/{level.words.length}
            </Text>
          </View>
        </View>
        <WordSlots
          level={level}
          found={found}
          reveals={reveals}
          width={width - 80}
          maxBox={compact ? 26 : 32}
        />
      </View>

      <View style={styles.playArea}>
        <View style={styles.banner}>{banner}</View>

        <Animated.View
          style={[styles.boardWrap, {transform: [{translateX: shake}]}]}>
          <Board
            level={level}
            size={boardSize}
            found={found}
            foundCells={foundCells}
            selection={selection}
            hintCells={hintCells}
            flash={flash}
            disabled={solved}
            onSelectionChange={onSelectionChange}
            onDragEnd={onDragEnd}
          />
        </Animated.View>
      </View>

      <View style={styles.toolbar}>
        <Tool icon="undo" label="Undo" onPress={undo} disabled={!canUndo} />
        <Tool icon="reset" label="Reset" onPress={reset} disabled={!canUndo} />
        <Tool
          icon="hint"
          label="Hint"
          onPress={hint}
          disabled={solved}
          tint={c.gold}
        />
      </View>

      <WinModal
        visible={won}
        levelId={levelId}
        theme={level.theme}
        stars={starsFor(hintsUsed)}
        time={elapsed}
        bestTime={progress.bestTimes[levelId]}
        isLast={levelId === TOTAL_LEVELS}
        onNext={() => onNext(levelId + 1)}
        onLevels={onLevels}
      />
      <HowToPlay visible={showRules} onClose={() => setShowRules(false)} />
    </SafeAreaView>
  );
}

function Tool({
  icon,
  label,
  onPress,
  disabled,
  tint,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  tint?: string;
}) {
  const {c} = useTheme();
  const styles = useStyles(makeStyles);
  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      style={styles.tool}
      accessibilityLabel={label}>
      <Icon name={icon} size={18} color={tint ?? c.text} />
      <Text style={styles.toolText}>{label}</Text>
    </PressableScale>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    safe: {flex: 1, backgroundColor: c.bg},
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: 12,
      gap: 10,
    },
    headerMid: {flex: 1},
    kicker: kicker(c),
    levelTitle: {
      color: c.text,
      fontSize: 26,
      lineHeight: 30,
      fontFamily: fonts.black,
      includeFontPadding: false,
    },
    clock: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      height: 44,
      paddingHorizontal: 12,
      borderRadius: 14,
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.cardBorder,
    },
    clockText: {
      color: c.text,
      fontSize: 15,
      fontFamily: fonts.bold,
      fontVariant: ['tabular-nums'],
      includeFontPadding: false,
      minWidth: 38,
    },
    wordsCard: {
      marginHorizontal: 20,
      paddingHorizontal: 20,
      paddingTop: 14,
      paddingBottom: 18,
      borderRadius: radius.lg,
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.cardBorder,
    },
    wordsHead: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    wordsTitle: {
      color: c.text,
      fontSize: 15,
      fontFamily: fonts.bold,
      includeFontPadding: false,
    },
    progress: {flexDirection: 'row', alignItems: 'center', gap: 4},
    progressPip: {
      width: 16,
      height: 6,
      borderRadius: 3,
      backgroundColor: c.track,
      borderWidth: 1,
      borderColor: c.cardBorder,
    },
    progressText: {
      color: c.textDim,
      fontSize: 13,
      fontFamily: fonts.bold,
      marginLeft: 4,
      includeFontPadding: false,
    },
    playArea: {flex: 1, alignItems: 'center', justifyContent: 'center'},
    banner: {
      height: 48,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 16,
    },
    preview: {
      color: c.text,
      fontSize: 28,
      fontFamily: fonts.black,
      letterSpacing: 4,
      includeFontPadding: false,
    },
    hintRow: {flexDirection: 'row', alignItems: 'center', gap: 6},
    hintText: {
      color: c.textMuted,
      fontSize: 14,
      fontFamily: fonts.semibold,
      includeFontPadding: false,
    },
    pill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 999,
      borderWidth: 1.5,
      backgroundColor: c.bgElevated,
    },
    pillText: {fontSize: 14, fontFamily: fonts.bold, includeFontPadding: false},
    boardWrap: {
      padding: 10,
      borderRadius: radius.xl,
      backgroundColor: c.boardBg,
      borderWidth: 1,
      borderColor: c.cardBorder,
    },
    toolbar: {
      flexDirection: 'row',
      gap: 10,
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: 12,
    },
    tool: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      height: 50,
      borderRadius: radius.md,
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.cardBorder,
    },
    toolText: {
      color: c.text,
      fontSize: 15,
      fontFamily: fonts.bold,
      includeFontPadding: false,
    },
  });
