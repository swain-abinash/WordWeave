import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {createContext, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import {TOTAL_LEVELS} from '../data/levels';

// v2: Wend-rules levels (walls, 3/4/5/6 words). v1 saves pointed at different boards.
const STORAGE_KEY = 'wordweave:progress:v2';

/** Mid-level state, so closing the app never loses found words or the clock. */
export type LevelSave = {
  /** Found word indices, in the order they were found (Undo pops the last). */
  found: number[];
  hintsUsed: number;
  /** word index -> number of letters revealed by hints */
  reveals: Record<number, number>;
  /** Seconds on the clock. */
  elapsed: number;
};

export type Progress = {
  /** Highest level the player may open (1-based). */
  unlocked: number;
  /** Best star rating per completed level id. */
  stars: Record<number, number>;
  /** Fastest solve in seconds per completed level id. */
  bestTimes: Record<number, number>;
  wordsFound: number;
  saves: Record<number, LevelSave>;
};

const initialProgress: Progress = {
  unlocked: 1,
  stars: {},
  bestTimes: {},
  wordsFound: 0,
  saves: {},
};

type ProgressApi = {
  progress: Progress;
  ready: boolean;
  /** Level to resume from the home screen. */
  currentLevel: number;
  totalStars: number;
  saveLevel: (id: number, save: LevelSave) => void;
  recordWord: () => void;
  completeLevel: (id: number, stars: number, seconds: number) => void;
  resetProgress: () => void;
};

const ProgressContext = createContext<ProgressApi | null>(null);

export function ProgressProvider({children}: {children: React.ReactNode}) {
  const [progress, setProgress] = useState<Progress>(initialProgress);
  const [ready, setReady] = useState(false);
  const hydrated = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then(json => {
        if (json) {
          setProgress({...initialProgress, ...JSON.parse(json)});
        }
      })
      .catch(() => {})
      .finally(() => {
        hydrated.current = true;
        setReady(true);
      });
  }, []);

  useEffect(() => {
    if (!hydrated.current) {
      return;
    }
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(progress)).catch(() => {});
  }, [progress]);

  const saveLevel = useCallback((id: number, save: LevelSave) => {
    setProgress(p => ({...p, saves: {...p.saves, [id]: save}}));
  }, []);

  const recordWord = useCallback(() => {
    setProgress(p => ({...p, wordsFound: p.wordsFound + 1}));
  }, []);

  const completeLevel = useCallback((id: number, stars: number, seconds: number) => {
    setProgress(p => {
      const saves = {...p.saves};
      delete saves[id];
      const best = p.bestTimes[id];
      return {
        ...p,
        stars: {...p.stars, [id]: Math.max(stars, p.stars[id] ?? 0)},
        bestTimes: {...p.bestTimes, [id]: best === undefined ? seconds : Math.min(best, seconds)},
        unlocked: Math.min(TOTAL_LEVELS, Math.max(p.unlocked, id + 1)),
        saves,
      };
    });
  }, []);

  const resetProgress = useCallback(() => setProgress(initialProgress), []);

  const api = useMemo<ProgressApi>(() => {
    const totalStars = Object.values(progress.stars).reduce((a, b) => a + b, 0);
    const allDone = Object.keys(progress.stars).length >= TOTAL_LEVELS;
    return {
      progress,
      ready,
      currentLevel: allDone ? TOTAL_LEVELS : progress.unlocked,
      totalStars,
      saveLevel,
      recordWord,
      completeLevel,
      resetProgress,
    };
  }, [progress, ready, saveLevel, recordWord, completeLevel, resetProgress]);

  return <ProgressContext.Provider value={api}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) {
    throw new Error('useProgress must be used inside ProgressProvider');
  }
  return ctx;
}

/** 83 -> "1:23" */
export const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
