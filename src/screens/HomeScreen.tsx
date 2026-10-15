import React, {useEffect, useRef, useState} from 'react';
import {Animated, Easing, ScrollView, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import BrandMark from '../components/BrandMark';
import HowToPlay from '../components/HowToPlay';
import Icon, {IconName} from '../components/Icon';
import {GradientFill, PressableScale, ThemeToggle} from '../components/ui';
import {TOTAL_LEVELS} from '../data/levels';
import {formatTime, useProgress} from '../state/ProgressContext';
import {ThemeMode, useStyles, useTheme} from '../state/ThemeContext';
import {fonts, kicker, Palette, radius, logoPalette} from '../theme';

type Props = {onPlay: (id: number) => void; onLevels: () => void};

const LOGO_TOP = 'WORD'.split('');
const LOGO_BOTTOM = 'WEAVE'.split('');

const THEME_OPTIONS: {mode: ThemeMode; label: string; icon: IconName}[] = [
  {mode: 'system', label: 'Auto', icon: 'auto'},
  {mode: 'light', label: 'Light', icon: 'sun'},
  {mode: 'dark', label: 'Dark', icon: 'moon'},
];

function LogoTile({letter, index, color}: {letter: string; index: number; color: string}) {
  const styles = useStyles(makeStyles);
  const float = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(float, {
          toValue: 1,
          duration: 1400,
          delay: index * 120,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(float, {toValue: 0, duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: true}),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [float, index]);
  return (
    <Animated.View
      style={[
        styles.logoTile,
        {backgroundColor: color, transform: [{translateY: float.interpolate({inputRange: [0, 1], outputRange: [0, -6]})}]},
      ]}>
      <Text allowFontScaling={false} style={styles.logoLetter}>
        {letter}
      </Text>
    </Animated.View>
  );
}

export default function HomeScreen({onPlay, onLevels}: Props) {
  const {progress, currentLevel, totalStars} = useProgress();
  const {c, mode, setMode} = useTheme();
  const styles = useStyles(makeStyles);
  const [rules, setRules] = useState(false);
  const cleared = Object.keys(progress.stars).length;
  const pct = cleared / TOTAL_LEVELS;
  const save = progress.saves[currentLevel];
  const inProgress = !!save;

  const enter = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(enter, {toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true}).start();
  }, [enter]);
  const rise = {
    opacity: enter,
    transform: [{translateY: enter.interpolate({inputRange: [0, 1], outputRange: [24, 0]})}],
  };

  let playTitle = 'Start Playing';
  if (cleared >= TOTAL_LEVELS) {
    playTitle = 'Play Again';
  } else if (inProgress) {
    playTitle = 'Continue';
  } else if (cleared) {
    playTitle = 'Play';
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.glow, styles.glowA]} />
      <View style={[styles.glow, styles.glowB]} />

      <View style={styles.topBar}>
        <View style={styles.brandRow}>
          <BrandMark size={28} />
          <Text style={styles.brandName}>WORDWEAVE</Text>
        </View>
        <ThemeToggle />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.logo}>
          <View style={styles.logoRow}>
            {LOGO_TOP.map((l, i) => (
              <LogoTile key={i} letter={l} index={i} color={logoPalette[i]} />
            ))}
          </View>
          <View style={styles.logoRow}>
            {LOGO_BOTTOM.map((l, i) => (
              <LogoTile key={i} letter={l} index={i + 4} color={logoPalette[(i + 4) % logoPalette.length]} />
            ))}
          </View>
          <Text style={styles.tagline}>Find the hidden words.{'\n'}Use every letter once.</Text>
        </View>

        <Animated.View style={[styles.statsCard, rise]}>
          <View style={styles.statsRow}>
            <Stat icon="checkCircle" tint={c.success} value={cleared} label="CLEARED" />
            <View style={styles.divider} />
            <Stat icon="star" tint={c.gold} value={totalStars} label="STARS" />
            <View style={styles.divider} />
            <Stat icon="words" tint={c.accentSoft} value={progress.wordsFound} label="WORDS" />
          </View>
          <View style={styles.barTrack}>
            <View style={[styles.barFill, {width: `${Math.max(3, pct * 100)}%`}]}>
              <GradientFill />
            </View>
          </View>
          <View style={styles.barMeta}>
            <Text style={styles.barLabel}>
              {cleared} of {TOTAL_LEVELS} levels cleared
            </Text>
            <Text style={styles.barPct}>{Math.round(pct * 100)}%</Text>
          </View>
        </Animated.View>

        <Animated.View style={[styles.actions, rise]}>
          <PlayCard
            title={playTitle}
            level={currentLevel}
            detail={
              save
                ? `${save.found.length} of 4 words found · ${formatTime(save.elapsed)}`
                : cleared >= TOTAL_LEVELS
                ? `All ${TOTAL_LEVELS} boards cleared`
                : 'New board · 4 hidden words'
            }
            progress={save ? save.found.length / 4 : 0}
            onPress={() => onPlay(currentLevel)}
          />
          <View style={styles.row}>
            <QuickCard icon="grid" tint={c.accentSoft} title="Levels" detail={`${cleared}/${TOTAL_LEVELS} cleared`} onPress={onLevels} />
            <QuickCard icon="book" tint="#38BDF8" title="Rules" detail="How to play" onPress={() => setRules(true)} />
          </View>

          <View style={styles.themeCard}>
            <Text style={styles.themeLabel}>Theme</Text>
            <View style={styles.segment}>
              {THEME_OPTIONS.map(o => {
                const on = mode === o.mode;
                return (
                  <PressableScale
                    key={o.mode}
                    onPress={() => setMode(o.mode)}
                    accessibilityLabel={`${o.label} theme${on ? ', selected' : ''}`}
                    style={[styles.segBtn, on && styles.segBtnOn]}>
                    <Icon name={o.icon} size={15} color={on ? c.onAccent : c.textDim} />
                    <Text style={[styles.segText, on && styles.segTextOn]}>{o.label}</Text>
                  </PressableScale>
                );
              })}
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      <HowToPlay visible={rules} onClose={() => setRules(false)} />
    </SafeAreaView>
  );
}

/** A half-width shortcut card: tinted icon, title and a one-line detail. */
function QuickCard({
  icon,
  tint,
  title,
  detail,
  onPress,
}: {
  icon: IconName;
  tint: string;
  title: string;
  detail: string;
  onPress: () => void;
}) {
  const {c} = useTheme();
  const styles = useStyles(makeStyles);
  return (
    <PressableScale onPress={onPress} accessibilityLabel={`${title}, ${detail}`} style={styles.quick}>
      <View style={[styles.quickIcon, {backgroundColor: `${tint}22`, borderColor: `${tint}44`}]}>
        <Icon name={icon} size={20} color={tint} />
      </View>
      <View style={styles.quickText}>
        <Text style={styles.quickTitle}>{title}</Text>
        <Text style={styles.quickDetail} numberOfLines={1}>
          {detail}
        </Text>
      </View>
      <Icon name="arrowRight" size={16} color={c.textMuted} />
    </PressableScale>
  );
}

/** The main call to action: a big gradient card with the level, progress and a round play button. */
function PlayCard({
  title,
  level,
  detail,
  progress,
  onPress,
}: {
  title: string;
  level: number;
  detail: string;
  progress: number;
  onPress: () => void;
}) {
  const {c} = useTheme();
  const styles = useStyles(makeStyles);
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {toValue: 1, duration: 1100, easing: Easing.out(Easing.quad), useNativeDriver: true}),
        Animated.timing(pulse, {toValue: 0, duration: 0, useNativeDriver: true}),
        Animated.delay(600),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <PressableScale onPress={onPress} accessibilityLabel={`${title}, level ${level}. ${detail}`} style={styles.playCard}>
      <GradientFill />
      <View style={styles.playSheen} />
      <View style={styles.playText}>
        <Text style={styles.playKicker}>{title.toUpperCase()}</Text>
        <Text style={styles.playLevel}>Level {level}</Text>
        <Text style={styles.playDetail} numberOfLines={1}>
          {detail}
        </Text>
        {progress > 0 ? (
          <View style={styles.playTrack}>
            <View style={[styles.playFill, {width: `${progress * 100}%`}]} />
          </View>
        ) : null}
      </View>
      <View style={styles.playBtnWrap}>
        <Animated.View
          style={[
            styles.playRing,
            {
              opacity: pulse.interpolate({inputRange: [0, 1], outputRange: [0.5, 0]}),
              transform: [{scale: pulse.interpolate({inputRange: [0, 1], outputRange: [1, 1.45]})}],
            },
          ]}
        />
        <View style={styles.playBtn}>
          <Icon name="play" size={26} color={c.accentDeep} />
        </View>
      </View>
    </PressableScale>
  );
}

function Stat({icon, tint, value, label}: {icon: IconName; tint: string; value: number; label: string}) {
  const styles = useStyles(makeStyles);
  return (
    <View style={styles.stat}>
      <View style={styles.statTop}>
        <Icon name={icon} size={18} color={tint} />
        <Text style={styles.statValue}>{value}</Text>
      </View>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    safe: {flex: 1, backgroundColor: c.bg},
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 24,
      paddingTop: 8,
    },
    content: {flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingBottom: 24},
    glow: {position: 'absolute', width: 340, height: 340, borderRadius: 170, opacity: c.glowOpacity},
    glowA: {backgroundColor: c.accent, top: -80, left: -120},
    glowB: {backgroundColor: '#FF6B8B', bottom: -120, right: -140},
    logo: {alignItems: 'center', marginBottom: 28},
    brandRow: {flexDirection: 'row', alignItems: 'center', gap: 8},
    brandName: {...kicker(c), color: c.textDim, fontSize: 12, letterSpacing: 3},
    logoRow: {flexDirection: 'row', gap: 8, marginBottom: 8},
    logoTile: {
      width: 54,
      height: 54,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: c.shadow,
      shadowOpacity: c.scheme === 'dark' ? 0.4 : 0.18,
      shadowRadius: 10,
      shadowOffset: {width: 0, height: 6},
      elevation: 6,
    },
    logoLetter: {fontSize: 28, fontFamily: fonts.black, color: c.ink, includeFontPadding: false},
    tagline: {
      color: c.textDim,
      fontSize: 15,
      lineHeight: 22,
      fontFamily: fonts.medium,
      marginTop: 12,
      textAlign: 'center',
    },
    statsCard: {
      backgroundColor: c.card,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.cardBorder,
      padding: 20,
      marginBottom: 20,
    },
    statsRow: {flexDirection: 'row', alignItems: 'center', marginBottom: 18},
    stat: {flex: 1, alignItems: 'center'},
    statTop: {flexDirection: 'row', alignItems: 'center', gap: 6},
    statValue: {color: c.text, fontSize: 22, fontFamily: fonts.heavy, includeFontPadding: false},
    statLabel: {...kicker(c), marginTop: 6},
    divider: {width: 1, height: 32, backgroundColor: c.cardBorder},
    barTrack: {height: 10, borderRadius: 5, backgroundColor: c.track, overflow: 'hidden'},
    barFill: {height: '100%', borderRadius: 5, overflow: 'hidden'},
    barMeta: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10},
    barLabel: {color: c.textDim, fontSize: 12, fontFamily: fonts.semibold, includeFontPadding: false},
    barPct: {color: c.accentSoft, fontSize: 12, fontFamily: fonts.bold, includeFontPadding: false},
    actions: {gap: 12},
    playCard: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 108,
      paddingLeft: 22,
      paddingRight: 18,
      paddingVertical: 16,
      borderRadius: radius.xl,
      overflow: 'hidden',
      backgroundColor: c.accent,
      shadowColor: c.accent,
      shadowOpacity: c.scheme === 'dark' ? 0.6 : 0.4,
      shadowRadius: 22,
      shadowOffset: {width: 0, height: 10},
      elevation: 12,
    },
    playSheen: {
      position: 'absolute',
      top: -60,
      right: -40,
      width: 180,
      height: 180,
      borderRadius: 90,
      backgroundColor: 'rgba(255,255,255,0.09)',
    },
    playText: {flex: 1, paddingRight: 12},
    playKicker: {
      color: 'rgba(255,255,255,0.75)',
      fontSize: 11,
      letterSpacing: 1.8,
      fontFamily: fonts.bold,
      includeFontPadding: false,
    },
    playLevel: {color: '#fff', fontSize: 28, lineHeight: 34, fontFamily: fonts.black, includeFontPadding: false},
    playDetail: {color: 'rgba(255,255,255,0.85)', fontSize: 13, fontFamily: fonts.medium, includeFontPadding: false},
    playTrack: {
      height: 5,
      borderRadius: 3,
      backgroundColor: 'rgba(255,255,255,0.22)',
      marginTop: 10,
      overflow: 'hidden',
    },
    playFill: {height: '100%', borderRadius: 3, backgroundColor: '#fff'},
    playBtnWrap: {width: 64, height: 64, alignItems: 'center', justifyContent: 'center'},
    playRing: {position: 'absolute', width: 64, height: 64, borderRadius: 32, backgroundColor: '#fff'},
    playBtn: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
      paddingLeft: 4,
    },
    row: {flexDirection: 'row', gap: 12},
    quick: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: 14,
      paddingVertical: 14,
      borderRadius: radius.lg,
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.cardBorder,
    },
    quickIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    quickText: {flex: 1},
    quickTitle: {color: c.text, fontSize: 16, fontFamily: fonts.bold, includeFontPadding: false},
    quickDetail: {color: c.textMuted, fontSize: 12, fontFamily: fonts.medium, marginTop: 2, includeFontPadding: false},
    themeCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 8,
      paddingLeft: 16,
      paddingRight: 6,
      paddingVertical: 6,
      borderRadius: radius.lg,
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.cardBorder,
    },
    themeLabel: {color: c.text, fontSize: 14, fontFamily: fonts.semibold, includeFontPadding: false},
    segment: {flexDirection: 'row', gap: 4, padding: 3, borderRadius: 14, backgroundColor: c.track},
    segBtn: {flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, height: 34, borderRadius: 11},
    segBtnOn: {backgroundColor: c.accent},
    segText: {color: c.textDim, fontSize: 13, fontFamily: fonts.semibold, includeFontPadding: false},
    segTextOn: {color: c.onAccent},
  });
