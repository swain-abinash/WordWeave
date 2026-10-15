import React from 'react';
import {Modal, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {useStyles, useTheme} from '../state/ThemeContext';
import {fonts, kicker, Palette, radius} from '../theme';
import Icon, {IconName} from './Icon';
import {Button} from './ui';

const rules = (c: Palette): [IconName, string, string, string][] => [
  ['letters', c.accentSoft, 'Find 4 hidden words', 'Every board hides four words: 3, 4, 5 and 6 letters long. The bubbles show only how long each word is.'],
  ['swipe', '#38BDF8', 'Wind through the grid', 'Tap or drag across letters that touch up, down, left or right. No diagonals. Words can turn corners and bend around gray walls.'],
  ['grid', c.success, 'Use every letter once', 'Each letter belongs to exactly one word. A word locks in as soon as you trace its full path.'],
  ['route', c.gold, 'Right word, wrong path', 'A gold message means the word is correct, but the board needs it traced a different way.'],
  ['undo', '#F472B6', 'Undo and Reset', 'Undo removes your last letter or last word. Reset clears the whole board.'],
  ['hint', '#FB923C', 'Hints', 'Each hint shows one more letter of a word in gold. Solve with no hints for 3 stars.'],
];

export default function HowToPlay({visible, onClose}: {visible: boolean; onClose: () => void}) {
  const {c} = useTheme();
  const styles = useStyles(makeStyles);
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet}>
          <View style={styles.handle} />
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            <Text style={styles.kicker}>WORDWEAVE</Text>
            <Text style={styles.title}>How to play</Text>
            {rules(c).map(([icon, tint, heading, text]) => (
              <View key={icon} style={styles.rule}>
                <View style={[styles.iconWrap, {backgroundColor: `${tint}1F`, borderColor: `${tint}40`}]}>
                  <Icon name={icon} size={20} color={tint} />
                </View>
                <View style={styles.ruleBody}>
                  <Text style={styles.ruleTitle}>{heading}</Text>
                  <Text style={styles.text}>{text}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
          <View style={styles.footer}>
            <Button title="Got it, let's play" icon="play" onPress={onClose} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    backdrop: {flex: 1, backgroundColor: c.overlay, justifyContent: 'flex-end'},
    sheet: {
      maxHeight: '90%',
      backgroundColor: c.bgElevated,
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
      paddingTop: 12,
      borderWidth: 1,
      borderColor: c.cardBorder,
    },
    scroll: {paddingHorizontal: 24, paddingBottom: 8},
    footer: {
      paddingHorizontal: 24,
      paddingTop: 12,
      paddingBottom: 28,
      borderTopWidth: 1,
      borderTopColor: c.cardBorder,
      backgroundColor: c.bgElevated,
    },
    handle: {
      alignSelf: 'center',
      width: 44,
      height: 5,
      borderRadius: 3,
      backgroundColor: c.cardBorder,
      marginBottom: 16,
    },
    kicker: {...kicker(c), color: c.accentSoft},
    title: {color: c.text, fontSize: 26, fontFamily: fonts.black, marginTop: 4, marginBottom: 18, includeFontPadding: false},
    rule: {flexDirection: 'row', gap: 14, alignItems: 'flex-start', marginBottom: 16},
    iconWrap: {
      width: 42,
      height: 42,
      borderRadius: 13,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    ruleBody: {flex: 1},
    ruleTitle: {color: c.text, fontSize: 15, fontFamily: fonts.bold, marginBottom: 2},
    text: {color: c.textDim, fontSize: 13.5, lineHeight: 20, fontFamily: fonts.medium},
  });
