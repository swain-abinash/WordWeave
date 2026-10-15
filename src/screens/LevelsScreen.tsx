import React, {useRef} from 'react';
import {ScrollView, StyleSheet, Text, useWindowDimensions, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon, {themeIcon} from '../components/Icon';
import {Chip, GradientFill, IconButton, PressableScale, Stars, ThemeToggle} from '../components/ui';
import {CHAPTERS, LEVELS} from '../data/levels';
import {useProgress} from '../state/ProgressContext';
import {useStyles, useTheme} from '../state/ThemeContext';
import {fonts, kicker, Palette, radius} from '../theme';

type Props = {onBack: () => void; onPlay: (id: number) => void};

const PER_ROW = 5;
const GAP = 10;

export default function LevelsScreen({onBack, onPlay}: Props) {
  const {progress, currentLevel, totalStars} = useProgress();
  const {c} = useTheme();
  const styles = useStyles(makeStyles);
  const {width} = useWindowDimensions();
  const tile = Math.floor((Math.min(width, 520) - 40 - GAP * (PER_ROW - 1)) / PER_ROW);
  const scroll = useRef<ScrollView>(null);
  const scrolled = useRef(false);

  /** Once the current level's chapter is laid out, bring that level into view. */
  const scrollToCurrent = (chapterY: number, from: number) => {
    if (scrolled.current) {
      return;
    }
    scrolled.current = true;
    const row = Math.floor((currentLevel - from) / PER_ROW);
    const y = chapterY + 90 + row * (tile + 12 + GAP);
    setTimeout(() => scroll.current?.scrollTo({y: Math.max(0, y - 200), animated: true}), 200);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <IconButton icon="back" label="Back" onPress={onBack} />
        <Text style={styles.title}>Levels</Text>
        <Chip icon="star" text={`${totalStars}/${LEVELS.length * 3}`} color={c.gold} />
        <ThemeToggle />
      </View>

      <ScrollView ref={scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {CHAPTERS.map((ch, chIdx) => {
          const ids = LEVELS.slice(ch.from - 1, ch.to).map(l => l.id);
          const done = ids.filter(id => progress.stars[id] !== undefined).length;
          const complete = done === ids.length;
          return (
            <View
              key={ch.title}
              style={styles.chapter}
              onLayout={
                ch.from <= currentLevel && currentLevel <= ch.to
                  ? e => scrollToCurrent(e.nativeEvent.layout.y, ch.from)
                  : undefined
              }>
              <View style={styles.chapterHead}>
                <View style={styles.chapterText}>
                  <Text style={styles.chapterKicker}>CHAPTER {chIdx + 1}</Text>
                  <Text style={styles.chapterTitle}>{ch.title}</Text>
                  <Text style={styles.chapterSub}>
                    Levels {ch.from}–{ch.to} · {ch.subtitle}
                  </Text>
                </View>
                <View style={[styles.chapterCount, complete && styles.chapterCountDone]}>
                  {complete ? <Icon name="check" size={13} color={c.success} strokeWidth={3} /> : null}
                  <Text style={[styles.chapterCountText, complete && {color: c.success}]}>
                    {done}/{ids.length}
                  </Text>
                </View>
              </View>
              <View style={styles.chapterTrack}>
                <View style={[styles.chapterFill, {width: `${(done / ids.length) * 100}%`}]} />
              </View>
              <View style={styles.grid}>
                {ids.map(id => {
                  const locked = id > progress.unlocked;
                  const stars = progress.stars[id];
                  const isCurrent = id === currentLevel && stars === undefined;
                  return (
                    <PressableScale
                      key={id}
                      disabled={locked}
                      onPress={() => onPlay(id)}
                      accessibilityLabel={locked ? `Level ${id}, locked` : `Level ${id}`}
                      style={[
                        styles.level,
                        {width: tile, height: tile + 12},
                        stars !== undefined && styles.levelDone,
                        isCurrent && styles.levelCurrent,
                        locked && styles.levelLocked,
                      ]}>
                      {isCurrent ? <GradientFill /> : null}
                      {locked ? (
                        <>
                          <Icon name="lock" size={16} color={c.textMuted} />
                          <Text style={styles.levelNumLocked}>{id}</Text>
                        </>
                      ) : (
                        <>
                          <Icon
                            name={themeIcon(LEVELS[id - 1].theme)}
                            size={13}
                            color={isCurrent ? 'rgba(255,255,255,0.85)' : c.textMuted}
                          />
                          <Text style={[styles.levelNum, isCurrent && styles.levelNumCurrent]}>{id}</Text>
                          {isCurrent ? <Icon name="play" size={10} color="#fff" /> : <Stars count={stars ?? 0} size={9} />}
                        </>
                      )}
                    </PressableScale>
                  );
                })}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    safe: {flex: 1, backgroundColor: c.bg},
    header: {flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10, gap: 10},
    title: {flex: 1, color: c.text, fontSize: 26, fontFamily: fonts.black, includeFontPadding: false},
    content: {paddingHorizontal: 20, paddingBottom: 48, alignSelf: 'center', maxWidth: 520, width: '100%'},
    chapter: {marginTop: 22},
    chapterHead: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end'},
    chapterText: {flex: 1},
    chapterKicker: {...kicker(c), color: c.accentSoft},
    chapterTitle: {color: c.text, fontSize: 20, fontFamily: fonts.heavy, marginTop: 2, includeFontPadding: false},
    chapterSub: {color: c.textMuted, fontSize: 12, fontFamily: fonts.semibold, marginTop: 2},
    chapterCount: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 999,
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.cardBorder,
    },
    chapterCountDone: {borderColor: c.success, backgroundColor: c.successTint},
    chapterCountText: {color: c.accentSoft, fontSize: 13, fontFamily: fonts.bold, includeFontPadding: false},
    chapterTrack: {
      height: 4,
      borderRadius: 2,
      backgroundColor: c.track,
      marginTop: 10,
      marginBottom: 14,
      overflow: 'hidden',
    },
    chapterFill: {height: '100%', borderRadius: 2, backgroundColor: c.accent},
    grid: {flexDirection: 'row', flexWrap: 'wrap', gap: GAP},
    level: {
      borderRadius: radius.md,
      backgroundColor: c.card,
      borderWidth: 1.5,
      borderColor: c.cardBorder,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
      overflow: 'hidden',
    },
    levelDone: {borderColor: c.levelDoneBorder, backgroundColor: c.levelDoneBg},
    levelCurrent: {borderColor: c.accentSoft},
    levelLocked: {backgroundColor: c.track, borderColor: c.track},
    levelNum: {color: c.text, fontSize: 18, fontFamily: fonts.heavy, includeFontPadding: false},
    levelNumCurrent: {color: '#fff'},
    levelNumLocked: {color: c.textMuted, fontSize: 11, fontFamily: fonts.bold, includeFontPadding: false},
  });
