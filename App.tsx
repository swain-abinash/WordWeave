import React, {useEffect, useState} from 'react';
import {ActivityIndicator, BackHandler, StatusBar, StyleSheet, View} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import BrandMark from './src/components/BrandMark';
import {TOTAL_LEVELS} from './src/data/levels';
import GameScreen from './src/screens/GameScreen';
import HomeScreen from './src/screens/HomeScreen';
import LevelsScreen from './src/screens/LevelsScreen';
import {ProgressProvider, useProgress} from './src/state/ProgressContext';
import {ThemeProvider, useTheme} from './src/state/ThemeContext';

type Route = {name: 'home'} | {name: 'levels'} | {name: 'game'; level: number};

function Navigator() {
  const {ready} = useProgress();
  const {c} = useTheme();
  const [stack, setStack] = useState<Route[]>([{name: 'home'}]);
  const route = stack[stack.length - 1];

  const push = (r: Route) => setStack(s => [...s, r]);
  const pop = () => setStack(s => (s.length > 1 ? s.slice(0, -1) : s));
  const replace = (r: Route) => setStack(s => [...s.slice(0, -1), r]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (stack.length > 1) {
        pop();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [stack.length]);

  if (!ready) {
    return (
      <View style={[styles.loading, {backgroundColor: c.bg}]}>
        <BrandMark size={72} />
        <ActivityIndicator color={c.accentSoft} style={styles.spinner} />
      </View>
    );
  }

  switch (route.name) {
    case 'home':
      return <HomeScreen onPlay={level => push({name: 'game', level})} onLevels={() => push({name: 'levels'})} />;
    case 'levels':
      return <LevelsScreen onBack={pop} onPlay={level => push({name: 'game', level})} />;
    case 'game':
      return (
        <GameScreen
          key={route.level}
          levelId={route.level}
          onBack={pop}
          onNext={level => replace({name: 'game', level: Math.min(level, TOTAL_LEVELS)})}
          onLevels={() => setStack([{name: 'home'}, {name: 'levels'}])}
        />
      );
  }
}

function Root() {
  const {c} = useTheme();
  return (
    <View style={[styles.root, {backgroundColor: c.bg}]}>
      <StatusBar barStyle={c.scheme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={c.bg} />
      <Navigator />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ProgressProvider>
          <Root />
        </ProgressProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1},
  loading: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  spinner: {marginTop: 24},
});
