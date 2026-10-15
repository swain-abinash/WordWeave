import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import type {Level} from '../data/levels';
import {useStyles, useTheme} from '../state/ThemeContext';
import {fonts, Palette} from '../theme';

type Props = {
  level: Level;
  found: number[];
  reveals: Record<number, number>;
  width: number;
  /** Bubble size cap, smaller on short screens. */
  maxBox?: number;
};

const GAP = 5;

/**
 * The hidden words as rows of bubbles (3, 4, 5 and 6 letters), centered into a neat stack.
 * Bubbles stay empty until the word is found; hints fill them in gold one letter at a time.
 */
export default function WordSlots({
  level,
  found,
  reveals,
  width,
  maxBox = 34,
}: Props) {
  const {c} = useTheme();
  const styles = useStyles(makeStyles);
  const longest = Math.max(...level.words.map(w => w.word.length));
  const box = Math.min(
    maxBox,
    Math.floor((width - GAP * (longest - 1)) / longest),
  );

  return (
    <View
      style={styles.wrap}
      accessibilityLabel={`${found.length} of ${level.words.length} words found`}>
      {level.words.map((w, i) => {
        const isFound = found.includes(i);
        const swatch = c.words[i % c.words.length];
        const shown = isFound ? w.word.length : reveals[i] ?? 0;
        return (
          <View key={i} style={styles.row}>
            {w.word.split('').map((ch, j) => {
              const visible = j < shown;
              return (
                <View
                  key={j}
                  style={[
                    styles.box,
                    {width: box, height: box, borderRadius: box * 0.3},
                    isFound && {
                      backgroundColor: swatch.fill,
                      borderColor: swatch.shade,
                      borderBottomColor: swatch.shade,
                      borderBottomWidth: 3,
                    },
                    !isFound && visible && styles.hintBox,
                  ]}>
                  {visible ? (
                    <Text
                      allowFontScaling={false}
                      style={[
                        styles.letter,
                        {
                          fontSize: box * 0.48,
                          color: isFound ? c.onWord : c.gold,
                        },
                        isFound && {
                          textShadowColor: swatch.shade,
                          textShadowOffset: {width: 0, height: 1},
                          textShadowRadius: 0,
                        },
                      ]}>
                      {ch}
                    </Text>
                  ) : (
                    <View style={styles.dot} />
                  )}
                </View>
              );
            })}
          </View>
        );
      })}
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    wrap: {alignItems: 'center', gap: 7},
    row: {flexDirection: 'row', gap: GAP},
    box: {
      backgroundColor: c.track,
      borderWidth: 1.5,
      borderColor: c.cardBorder,
      alignItems: 'center',
      justifyContent: 'center',
    },
    hintBox: {borderColor: c.gold},
    letter: {fontFamily: fonts.black, includeFontPadding: false},
    dot: {
      width: 5,
      height: 5,
      borderRadius: 2.5,
      backgroundColor: c.textMuted,
      opacity: 0.6,
    },
  });
