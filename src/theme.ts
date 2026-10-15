import {TextStyle} from 'react-native';

/** A tile color: main fill plus a darker shade for its raised edge. */
export type Swatch = {fill: string; shade: string};

/** Found-word colors, shared by both themes. No reds or golds: red means "wrong", gold means "hint". */
const WORD_SWATCHES: Swatch[] = [
  {fill: '#3B82F6', shade: '#1D4ED8'},
  {fill: '#10B981', shade: '#047857'},
  {fill: '#8B5CF6', shade: '#6D28D9'},
  {fill: '#06B6D4', shade: '#0E7490'},
  {fill: '#6366F1', shade: '#4338CA'},
  {fill: '#22C55E', shade: '#15803D'},
  {fill: '#0EA5E9', shade: '#0369A1'},
  {fill: '#A855F7', shade: '#7E22CE'},
];

/** Every color the UI uses. Screens read the active palette from ThemeContext. */
export type Palette = {
  scheme: 'dark' | 'light';
  bg: string;
  bgElevated: string;
  card: string;
  cardBorder: string;
  /** Board backdrop behind the tiles. */
  boardBg: string;
  /** Progress bar tracks. */
  track: string;
  tile: string;
  tileBorder: string;
  /** Raised bottom edge of a plain tile. */
  tileShade: string;
  /** Blocked (gray wall) tiles. */
  wall: string;
  wallBorder: string;
  text: string;
  textDim: string;
  textMuted: string;
  /** Dark text drawn on top of bright tiles and badges (both themes). */
  ink: string;
  accent: string;
  /** Accent for icons and small text on the page background. */
  accentSoft: string;
  accentDeep: string;
  /** Text and icons on top of accent fills. */
  onAccent: string;
  /** Soft accent tint behind icons. */
  accentTint: string;
  gold: string;
  goldDeep: string;
  danger: string;
  success: string;
  successTint: string;
  warning: string;
  /** Found-word colors, in order, and the letter color drawn on them. */
  words: Swatch[];
  onWord: string;
  /** The path being traced, a wrong path, and a right word on the wrong path. */
  select: Swatch;
  wrong: Swatch;
  near: Swatch;
  levelDoneBg: string;
  levelDoneBorder: string;
  overlay: string;
  shadow: string;
  glowOpacity: number;
};

export const darkPalette: Palette = {
  scheme: 'dark',
  bg: '#0B0D1F',
  bgElevated: '#141733',
  card: '#1A1E40',
  cardBorder: '#272C58',
  boardBg: '#141733',
  track: '#141733',
  tile: '#222754',
  tileBorder: '#30366E',
  tileShade: '#151937',
  wall: '#3A3D52',
  wallBorder: '#4A4E66',
  text: '#F4F5FF',
  textDim: '#A3A7D1',
  textMuted: '#6A70A6',
  ink: '#14162E',
  accent: '#7C5CFF',
  accentSoft: '#A592FF',
  accentDeep: '#5A3BE6',
  onAccent: '#FFFFFF',
  accentTint: 'rgba(124,92,255,0.16)',
  gold: '#FFC94A',
  goldDeep: '#F59E0B',
  danger: '#FF5D73',
  success: '#3DDC97',
  successTint: 'rgba(61,220,151,0.12)',
  warning: '#FFB547',
  words: WORD_SWATCHES,
  onWord: '#FFFFFF',
  select: {fill: '#7C5CFF', shade: '#4C2FD1'},
  wrong: {fill: '#F43F5E', shade: '#BE123C'},
  near: {fill: '#F59E0B', shade: '#B45309'},
  levelDoneBg: '#20254D',
  levelDoneBorder: '#3A3F78',
  overlay: 'rgba(6,7,20,0.8)',
  shadow: '#000000',
  glowOpacity: 0.18,
};

export const lightPalette: Palette = {
  scheme: 'light',
  bg: '#F3F4FA',
  bgElevated: '#FFFFFF',
  card: '#FFFFFF',
  cardBorder: '#E1E3F0',
  boardBg: '#E8EAF5',
  track: '#ECEEF7',
  tile: '#FFFFFF',
  tileBorder: '#D3D6EA',
  tileShade: '#C2C6DC',
  wall: '#C5C8D8',
  wallBorder: '#B3B7CB',
  text: '#181B38',
  textDim: '#525877',
  textMuted: '#868BAA',
  ink: '#14162E',
  accent: '#6C4BF5',
  accentSoft: '#6C4BF5',
  accentDeep: '#5A3BE6',
  onAccent: '#FFFFFF',
  accentTint: 'rgba(108,75,245,0.1)',
  gold: '#D99A00',
  goldDeep: '#F59E0B',
  danger: '#E23A55',
  success: '#0F9D63',
  successTint: 'rgba(15,157,99,0.1)',
  warning: '#D98200',
  words: WORD_SWATCHES,
  onWord: '#FFFFFF',
  select: {fill: '#6C4BF5', shade: '#4527C9'},
  wrong: {fill: '#F43F5E', shade: '#BE123C'},
  near: {fill: '#F59E0B', shade: '#B45309'},
  levelDoneBg: '#F0ECFF',
  levelDoneBorder: '#D9CFFF',
  overlay: 'rgba(24,27,56,0.45)',
  shadow: '#3B3F6B',
  glowOpacity: 0.1,
};

/** Two-stop brand gradient, used for primary buttons, the brand mark and highlights. */
export const brandGradient = ['#9277FF', '#5A3BE6'] as const;

/** Bright tile colors for the WORD WEAVE logo on the home screen. */
export const logoPalette = [
  '#FF6B8B',
  '#38BDF8',
  '#3DDC97',
  '#FFB547',
  '#A78BFA',
  '#F472B6',
  '#2DD4BF',
  '#FB923C',
];

/** Poppins, bundled in android/app/src/main/assets/fonts. Use these instead of fontWeight. */
export const fonts = {
  medium: 'Poppins-Medium',
  semibold: 'Poppins-SemiBold',
  bold: 'Poppins-Bold',
  heavy: 'Poppins-ExtraBold',
  black: 'Poppins-Black',
};

export const radius = {sm: 10, md: 16, lg: 24, xl: 32};

/** Small, uppercase, tracked-out label text. */
export const kicker = (c: Palette): TextStyle => ({
  color: c.textMuted,
  fontSize: 11,
  fontFamily: fonts.bold,
  letterSpacing: 1.6,
  includeFontPadding: false,
});
