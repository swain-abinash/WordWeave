import React, {useId, useRef} from 'react';
import {Animated, Pressable, StyleProp, StyleSheet, Text, View, ViewStyle} from 'react-native';
import Svg, {Defs, LinearGradient, Rect, Stop} from 'react-native-svg';
import {useStyles, useTheme} from '../state/ThemeContext';
import {brandGradient, fonts, Palette, radius} from '../theme';
import Icon, {IconName} from './Icon';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/** Fills its parent with a diagonal gradient. The parent should set `overflow: 'hidden'` and a border radius. */
export function GradientFill({stops = brandGradient}: {stops?: readonly [string, string]}) {
  const id = `g${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={stops[0]} />
          <Stop offset="1" stopColor={stops[1]} />
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  );
}

type PressableScaleProps = {
  onPress?: () => void;
  disabled?: boolean;
  /** Applied to the pressable itself, so layout styles such as `flex: 1` work. */
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
  hitSlop?: number;
  accessibilityLabel?: string;
};

export function PressableScale({onPress, disabled, style, children, hitSlop, accessibilityLabel}: PressableScaleProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const to = (v: number) =>
    Animated.spring(scale, {toValue: v, friction: 5, tension: 300, useNativeDriver: true}).start();
  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={hitSlop}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{disabled}}
      onPressIn={() => to(0.95)}
      onPressOut={() => to(1)}
      style={[style, {transform: [{scale}]}, disabled && base.disabled]}>
      {children}
    </AnimatedPressable>
  );
}

type ButtonProps = {
  title: string;
  subtitle?: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  icon?: IconName;
  /** Put the icon after the label, e.g. a forward arrow. */
  iconAfter?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({title, subtitle, onPress, variant = 'primary', disabled, icon, iconAfter, style}: ButtonProps) {
  const {c} = useTheme();
  const styles = useStyles(makeStyles);
  const primary = variant === 'primary';
  const iconEl = icon ? (
    <View style={[styles.btnIconWrap, !primary && styles.btnIconWrapAlt]}>
      <Icon name={icon} size={primary ? 20 : 18} color={primary ? c.onAccent : c.accentSoft} />
    </View>
  ) : null;
  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={subtitle ? `${title}, ${subtitle}` : title}
      style={[styles.btn, primary ? styles.primary : styles.secondary, style]}>
      {primary ? <GradientFill /> : null}
      {primary ? <View style={styles.sheen} /> : null}
      <View style={styles.btnRow}>
        {!iconAfter && iconEl}
        <View style={styles.btnLabel}>
          <Text style={[styles.btnText, !primary && styles.btnTextAlt]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? <Text style={styles.btnSub}>{subtitle}</Text> : null}
        </View>
        {iconAfter && iconEl}
      </View>
    </PressableScale>
  );
}

type IconButtonProps = {
  icon: IconName;
  onPress: () => void;
  label: string;
  tint?: string;
};

export function IconButton({icon, onPress, label, tint}: IconButtonProps) {
  const {c} = useTheme();
  const styles = useStyles(makeStyles);
  return (
    <PressableScale onPress={onPress} style={styles.iconBtn} hitSlop={8} accessibilityLabel={label}>
      <Icon name={icon} size={22} color={tint ?? c.text} />
    </PressableScale>
  );
}

/** One-tap switch between light and dark (overrides the phone setting until "Auto" is picked again). */
export function ThemeToggle() {
  const {c, setMode} = useTheme();
  const dark = c.scheme === 'dark';
  return (
    <IconButton
      icon={dark ? 'sun' : 'moon'}
      label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      tint={dark ? c.gold : c.accentSoft}
      onPress={() => setMode(dark ? 'light' : 'dark')}
    />
  );
}

export function Stars({count, size = 16, total = 3}: {count: number; size?: number; total?: number}) {
  const {c} = useTheme();
  return (
    <View style={base.stars} accessibilityLabel={`${count} of ${total} stars`}>
      {Array.from({length: total}, (_, i) => (
        <Icon key={i} name="star" size={size} color={i < count ? c.gold : c.cardBorder} />
      ))}
    </View>
  );
}

/** Rounded capsule with an icon and a short value, e.g. star totals. */
export function Chip({icon, text, color}: {icon: IconName; text: string; color?: string}) {
  const {c} = useTheme();
  const styles = useStyles(makeStyles);
  return (
    <View style={styles.chip}>
      <Icon name={icon} size={15} color={color ?? c.text} />
      <Text style={[styles.chipText, {color: color ?? c.text}]}>{text}</Text>
    </View>
  );
}

const base = StyleSheet.create({
  disabled: {opacity: 0.4},
  stars: {flexDirection: 'row', gap: 2},
});

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    btn: {
      minHeight: 58,
      paddingVertical: 12,
      paddingHorizontal: 18,
      borderRadius: radius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    primary: {
      backgroundColor: c.accent,
      shadowColor: c.accent,
      shadowOpacity: c.scheme === 'dark' ? 0.55 : 0.35,
      shadowRadius: 18,
      shadowOffset: {width: 0, height: 8},
      elevation: 10,
    },
    secondary: {
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.cardBorder,
    },
    sheen: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '50%',
      backgroundColor: 'rgba(255,255,255,0.08)',
    },
    btnRow: {flexDirection: 'row', alignItems: 'center', gap: 12},
    btnLabel: {alignItems: 'center'},
    btnIconWrap: {
      width: 32,
      height: 32,
      borderRadius: 10,
      backgroundColor: 'rgba(255,255,255,0.18)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    btnIconWrapAlt: {backgroundColor: c.accentTint},
    btnText: {color: c.onAccent, fontSize: 17, fontFamily: fonts.bold, textAlign: 'center', includeFontPadding: false},
    btnTextAlt: {color: c.text, fontSize: 16},
    btnSub: {
      color: 'rgba(255,255,255,0.8)',
      fontSize: 12,
      fontFamily: fonts.semibold,
      textAlign: 'center',
      marginTop: 2,
      includeFontPadding: false,
    },
    iconBtn: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.cardBorder,
      alignItems: 'center',
      justifyContent: 'center',
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: c.card,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderWidth: 1,
      borderColor: c.cardBorder,
    },
    chipText: {fontFamily: fonts.bold, fontSize: 14, includeFontPadding: false},
  });
