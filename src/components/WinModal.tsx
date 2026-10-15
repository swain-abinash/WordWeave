import React, {useEffect, useRef} from 'react';
import {Animated, Modal, StyleSheet, Text, View} from 'react-native';
import {formatTime} from '../state/ProgressContext';
import {useStyles, useTheme} from '../state/ThemeContext';
import {fonts, kicker, Palette, radius} from '../theme';
import Icon, {themeIcon} from './Icon';
import {Button, GradientFill} from './ui';

type Props = {
  visible: boolean;
  levelId: number;
  theme: string;
  stars: number;
  /** Solve time in seconds, and the best time including this solve. */
  time: number;
  bestTime?: number;
  isLast: boolean;
  onNext: () => void;
  onLevels: () => void;
};

const STAR_TEXT = ['', 'Solved!', 'Great job!', 'Flawless!'];
const STAR_SIZES = [40, 54, 40];

export default function WinModal({visible, levelId, theme, stars, time, bestTime, isLast, onNext, onLevels}: Props) {
  const {c} = useTheme();
  const styles = useStyles(makeStyles);
  const card = useRef(new Animated.Value(0)).current;
  const starAnims = useRef([0, 1, 2].map(() => new Animated.Value(0))).current;

  useEffect(() => {
    if (!visible) {
      card.setValue(0);
      starAnims.forEach(a => a.setValue(0));
      return;
    }
    Animated.sequence([
      Animated.spring(card, {toValue: 1, friction: 6, tension: 90, useNativeDriver: true}),
      Animated.stagger(
        160,
        starAnims.map(a => Animated.spring(a, {toValue: 1, friction: 4, tension: 160, useNativeDriver: true})),
      ),
    ]).start();
  }, [visible, card, starAnims]);

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.backdrop}>
        <Animated.View
          style={[
            styles.card,
            {
              opacity: card,
              transform: [{scale: card.interpolate({inputRange: [0, 1], outputRange: [0.8, 1]})}],
            },
          ]}>
          <View style={styles.badgeGlow}>
            <View style={styles.badge}>
              <GradientFill stops={isLast ? [c.gold, c.goldDeep] : undefined} />
              <Icon name={isLast ? 'trophy' : themeIcon(theme)} size={34} color="#fff" />
            </View>
          </View>
          <Text style={styles.kicker}>
            LEVEL {levelId} · {theme.toUpperCase()}
          </Text>
          <Text style={styles.title}>{isLast ? 'You beat all 100!' : STAR_TEXT[stars]}</Text>
          <View style={styles.stars}>
            {starAnims.map((a, i) => (
              <Animated.View
                key={i}
                style={{
                  transform: [
                    {scale: a},
                    {rotate: a.interpolate({inputRange: [0, 1], outputRange: ['-90deg', '0deg']})},
                  ],
                }}>
                <Icon name="star" size={STAR_SIZES[i]} color={i < stars ? c.gold : c.cardBorder} />
              </Animated.View>
            ))}
          </View>
          <View style={styles.timeRow}>
            <Icon name="clock" size={16} color={c.accentSoft} />
            <Text style={styles.timeText}>{formatTime(time)}</Text>
            {bestTime !== undefined && bestTime < time ? (
              <Text style={styles.bestText}>Best {formatTime(bestTime)}</Text>
            ) : (
              <Text style={styles.bestText}>Best time!</Text>
            )}
          </View>
          <View style={styles.note}>
            <Icon name={stars === 3 ? 'sparkles' : 'hint'} size={15} color={stars === 3 ? c.gold : c.textDim} />
            <Text style={styles.noteText}>
              {stars === 3 ? 'Perfect: no hints used' : 'Solve with no hints for 3 stars'}
            </Text>
          </View>
          <View style={styles.actions}>
            {!isLast && <Button title="Next Level" onPress={onNext} icon="arrowRight" iconAfter />}
            <Button title="All Levels" icon="grid" variant="secondary" onPress={onLevels} />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: c.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: c.bgElevated,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: c.cardBorder,
    padding: 28,
    paddingTop: 32,
    alignItems: 'center',
  },
  badgeGlow: {
    padding: 8,
    borderRadius: 32,
    backgroundColor: c.accentTint,
    marginBottom: 16,
  },
  badge: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  kicker: {...kicker(c), color: c.textDim},
  title: {color: c.text, fontSize: 30, fontFamily: fonts.black, marginTop: 8, textAlign: 'center', includeFontPadding: false},
  stars: {flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginVertical: 18},
  timeRow: {flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10},
  timeText: {color: c.text, fontSize: 20, fontFamily: fonts.heavy, fontVariant: ['tabular-nums'], includeFontPadding: false},
  bestText: {color: c.textDim, fontSize: 13, fontFamily: fonts.semibold, includeFontPadding: false},
  note: {flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 22},
  noteText: {color: c.textDim, fontSize: 13, fontFamily: fonts.semibold, includeFontPadding: false},
  actions: {alignSelf: 'stretch', gap: 12},
});
