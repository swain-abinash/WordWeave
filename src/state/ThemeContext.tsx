import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {useColorScheme} from 'react-native';
import {darkPalette, lightPalette, Palette} from '../theme';

const STORAGE_KEY = 'wordweave:theme';

/** 'system' follows the phone's dark/light setting. */
export type ThemeMode = 'system' | 'light' | 'dark';

type ThemeApi = {c: Palette; mode: ThemeMode; setMode: (m: ThemeMode) => void};

const ThemeContext = createContext<ThemeApi>({c: darkPalette, mode: 'system', setMode: () => {}});

export function ThemeProvider({children}: {children: React.ReactNode}) {
  const system = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then(v => {
        if (v === 'light' || v === 'dark' || v === 'system') {
          setModeState(v);
        }
      })
      .catch(() => {});
  }, []);

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
    AsyncStorage.setItem(STORAGE_KEY, m).catch(() => {});
  }, []);

  const scheme = mode === 'system' ? (system === 'light' ? 'light' : 'dark') : mode;
  const api = useMemo(
    () => ({c: scheme === 'light' ? lightPalette : darkPalette, mode, setMode}),
    [scheme, mode, setMode],
  );
  return <ThemeContext.Provider value={api}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);

/** Memoized per-palette styles: `const styles = useStyles(makeStyles)`. */
export function useStyles<T>(factory: (c: Palette) => T): T {
  const {c} = useTheme();
  return useMemo(() => factory(c), [c, factory]);
}
