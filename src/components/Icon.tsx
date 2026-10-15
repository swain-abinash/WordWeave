import React from 'react';
import Svg, {Circle, Path, Rect} from 'react-native-svg';

/**
 * Line icon set (24×24 grid, 2px round strokes, Lucide-style).
 * Shapes marked `fill` are drawn solid in the icon color instead of outlined.
 */
type Shape =
  | {d: string; fill?: boolean}
  | {circle: [number, number, number]; fill?: boolean}
  | {rect: [number, number, number, number, number]};

const ICONS = {
  // UI
  back: [{d: 'm15 18-6-6 6-6'}],
  arrowRight: [{d: 'M5 12h14'}, {d: 'm12 5 7 7-7 7'}],
  undo: [{d: 'M9 14 4 9l5-5'}, {d: 'M4 9h10.5a5.5 5.5 0 0 1 0 11H11'}],
  reset: [{d: 'M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8'}, {d: 'M3 3v5h5'}],
  clock: [{circle: [12, 12, 10]}, {d: 'M12 6v6l4 2'}],
  sun: [
    {circle: [12, 12, 4]},
    {d: 'M12 2v2'},
    {d: 'M12 20v2'},
    {d: 'm4.93 4.93 1.41 1.41'},
    {d: 'm17.66 17.66 1.41 1.41'},
    {d: 'M2 12h2'},
    {d: 'M20 12h2'},
    {d: 'm6.34 17.66-1.41 1.41'},
    {d: 'm19.07 4.93-1.41 1.41'},
  ],
  moon: [{d: 'M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z'}],
  auto: [{circle: [12, 12, 10]}, {d: 'M12 2a10 10 0 0 1 0 20Z', fill: true}],
  help: [{circle: [12, 12, 10]}, {d: 'M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3'}, {d: 'M12 17h.01'}],
  hint: [
    {d: 'M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5'},
    {d: 'M9 18h6'},
    {d: 'M10 22h4'},
  ],
  play: [{d: 'M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5Z', fill: true}],
  grid: [
    {rect: [3, 3, 7, 7, 1.5]},
    {rect: [14, 3, 7, 7, 1.5]},
    {rect: [14, 14, 7, 7, 1.5]},
    {rect: [3, 14, 7, 7, 1.5]},
  ],
  book: [
    {d: 'M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z'},
    {d: 'M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z'},
  ],
  star: [
    {
      d: 'M11.1 2.9a1 1 0 0 1 1.8 0l2.3 4.7 5.2.8a1 1 0 0 1 .55 1.7l-3.75 3.65.9 5.15a1 1 0 0 1-1.45 1.05L12 17.5l-4.65 2.45a1 1 0 0 1-1.45-1.05l.9-5.15L3.05 10.1a1 1 0 0 1 .55-1.7l5.2-.8Z',
      fill: true,
    },
  ],
  lock: [{rect: [4, 11, 16, 11, 2.5]}, {d: 'M8 11V7a4 4 0 0 1 8 0v4'}],
  trophy: [
    {d: 'M6 9H4.5a2.5 2.5 0 0 1 0-5H6'},
    {d: 'M18 9h1.5a2.5 2.5 0 0 0 0-5H18'},
    {d: 'M4 22h16'},
    {d: 'M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22'},
    {d: 'M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22'},
    {d: 'M18 2H6v7a6 6 0 0 0 12 0z'},
  ],
  check: [{d: 'M20 6 9 17l-5-5'}],
  checkCircle: [{circle: [12, 12, 10]}, {d: 'm8.5 12 2.5 2.5 4.5-5'}],
  x: [{d: 'M18 6 6 18'}, {d: 'm6 6 12 12'}],
  xCircle: [{circle: [12, 12, 10]}, {d: 'm15 9-6 6'}, {d: 'm9 9 6 6'}],
  info: [{circle: [12, 12, 10]}, {d: 'M12 16v-4'}, {d: 'M12 8h.01'}],
  route: [
    {circle: [6, 19, 3]},
    {d: 'M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15'},
    {circle: [18, 5, 3]},
  ],
  letters: [{d: 'M4 7V4h16v3'}, {d: 'M9 20h6'}, {d: 'M12 4v16'}],
  swipe: [
    {d: 'M18 11V6a2 2 0 0 0-4 0'},
    {d: 'M14 10V4a2 2 0 0 0-4 0v2'},
    {d: 'M10 10.5V6a2 2 0 0 0-4 0v8'},
    {d: 'M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-6-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15'},
  ],
  sparkles: [
    {d: 'M10 3.5 11.6 8.4 16.5 10l-4.9 1.6L10 16.5l-1.6-4.9L3.5 10l4.9-1.6Z'},
    {d: 'M18.5 14.5 19.3 16.7 21.5 17.5 19.3 18.3 18.5 20.5 17.7 18.3 15.5 17.5 17.7 16.7Z'},
  ],
  words: [{d: 'M4 6h16'}, {d: 'M4 12h10'}, {d: 'M4 18h13'}],

  // Level themes
  flower: [
    {d: 'M7 20h10'},
    {d: 'M10 20c5.5-2.5.8-6.4 3-10'},
    {d: 'M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z'},
    {d: 'M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z'},
  ],
  medal: [{circle: [12, 15, 6]}, {d: 'M8.6 10 6 3h4l2 5'}, {d: 'M15.4 10 18 3h-4l-2 5'}, {d: 'm12 12.5.8 1.6 1.7.3-1.25 1.2.3 1.7L12 16.5l-1.55.8.3-1.7-1.25-1.2 1.7-.3Z'}],
  laptop: [
    {d: 'M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9'},
    {d: 'M2 19.5A1.5 1.5 0 0 0 3.5 21h17a1.5 1.5 0 0 0 1.5-1.5V16H2Z'},
  ],
  palette: [
    {d: 'M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.65-.75 1.65-1.69 0-.44-.18-.84-.44-1.13-.29-.29-.44-.65-.44-1.12a1.64 1.64 0 0 1 1.67-1.67h2c3.05 0 5.55-2.5 5.55-5.55C21.97 6.01 17.46 2 12 2Z'},
    {circle: [13.5, 6.5, 1.2], fill: true},
    {circle: [17.5, 10.5, 1.2], fill: true},
    {circle: [8.5, 7.5, 1.2], fill: true},
    {circle: [6.5, 12.5, 1.2], fill: true},
  ],
  rocket: [
    {d: 'M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z'},
    {d: 'm12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z'},
    {d: 'M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0'},
    {d: 'M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5'},
  ],
  apple: [
    {d: 'M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z'},
    {d: 'M10 2c1 .5 2 2 2 5'},
  ],
  tree: [
    {d: 'm17 14 3 3.3a1 1 0 0 1-.7 1.7H4.7a1 1 0 0 1-.7-1.7L7 14h-.3a1 1 0 0 1-.7-1.7L9 9h-.2A1 1 0 0 1 8 7.3L12 3l4 4.3a1 1 0 0 1-.8 1.7H15l3 3.3a1 1 0 0 1-.7 1.7z'},
    {d: 'M12 22v-3'},
  ],
  smile: [{circle: [12, 12, 10]}, {d: 'M8 14s1.5 2 4 2 4-2 4-2'}, {d: 'M9 9h.01'}, {d: 'M15 9h.01'}],
  heartPulse: [
    {d: 'M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z'},
    {d: 'M3.2 12h6.3l.5-1 2 4.5 2-7 1.5 3.5h5.3'},
  ],
  briefcase: [{rect: [2, 7, 20, 14, 2]}, {d: 'M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16'}],
  car: [
    {d: 'M19 17h2v-5l-2.2-5.1A2 2 0 0 0 17 5.7H7a2 2 0 0 0-1.8 1.2L3 12v5h2'},
    {d: 'M9 17h6'},
    {d: 'M3 12h18'},
    {circle: [7, 17, 2]},
    {circle: [17, 17, 2]},
  ],
  utensils: [
    {d: 'M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2'},
    {d: 'M7 2v20'},
    {d: 'M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7'},
  ],
  chefHat: [
    {d: 'M17 21a1 1 0 0 0 1-1v-5.35c0-.46.32-.84.73-1.04a4 4 0 0 0-2.14-7.59 5 5 0 0 0-9.18 0 4 4 0 0 0-2.14 7.59c.41.2.73.58.73 1.04V20a1 1 0 0 0 1 1Z'},
    {d: 'M6 17h12'},
  ],
  plane: [
    {d: 'M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z'},
  ],
  house: [
    {d: 'M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8'},
    {d: 'M3 10a2 2 0 0 1 .7-1.53l7-6a2 2 0 0 1 2.6 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z'},
  ],
  pizza: [
    {d: 'm2 16 20 6-6-20A20 20 0 0 0 2 16'},
    {d: 'M5.7 17.1A17 17 0 0 1 17.1 5.7'},
    {d: 'M15 11h.01'},
    {d: 'M11 15h.01'},
    {d: 'M16 16h.01'},
  ],
  bird: [
    {d: 'M16 7h.01'},
    {d: 'M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.28-2.3L2 20'},
    {d: 'm20 7 2 .5-2 .5'},
    {d: 'M10 18v3'},
    {d: 'M14 17.75V21'},
    {d: 'M7 18a6 6 0 0 0 3.84-10.61'},
  ],
  music: [{d: 'M9 18V5l12-2v13'}, {circle: [6, 18, 3]}, {circle: [18, 16, 3]}],
  waves: [
    {d: 'M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1'},
    {d: 'M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1'},
    {d: 'M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1'},
  ],
  cloudSun: [
    {d: 'M12 2v2'},
    {d: 'm4.93 4.93 1.41 1.41'},
    {d: 'M20 12h2'},
    {d: 'm19.07 4.93-1.41 1.41'},
    {d: 'M15.95 12.65a4 4 0 0 0-5.93-4.13'},
    {d: 'M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6Z'},
  ],
  paw: [
    {circle: [11, 4, 2]},
    {circle: [18, 8, 2]},
    {circle: [20, 16, 2]},
    {d: 'M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.05Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z'},
  ],
} satisfies Record<string, Shape[]>;

export type IconName = keyof typeof ICONS;

type Props = {
  name: IconName;
  size?: number;
  color: string;
  strokeWidth?: number;
};

export default function Icon({name, size = 22, color, strokeWidth = 2}: Props) {
  const shapes: Shape[] = ICONS[name];
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {shapes.map((s, i) => {
        const fill = 'fill' in s && s.fill;
        const paint = {
          fill: fill ? color : 'none',
          stroke: color,
          strokeWidth: fill ? strokeWidth * 0.5 : strokeWidth,
          strokeLinecap: 'round' as const,
          strokeLinejoin: 'round' as const,
        };
        if ('circle' in s) {
          const [cx, cy, r] = s.circle;
          return <Circle key={i} cx={cx} cy={cy} r={r} {...paint} />;
        }
        if ('rect' in s) {
          const [x, y, width, height, rx] = s.rect;
          return <Rect key={i} x={x} y={y} width={width} height={height} rx={rx} {...paint} />;
        }
        return <Path key={i} d={s.d} {...paint} />;
      })}
    </Svg>
  );
}

const THEME_ICONS: Record<string, IconName> = {
  Garden: 'flower',
  Sports: 'medal',
  Tech: 'laptop',
  Colors: 'palette',
  Space: 'rocket',
  Fruits: 'apple',
  Nature: 'tree',
  Feelings: 'smile',
  Body: 'heartPulse',
  'Work Life': 'briefcase',
  Vehicles: 'car',
  Kitchen: 'utensils',
  Jobs: 'chefHat',
  Travel: 'plane',
  Home: 'house',
  Food: 'pizza',
  Birds: 'bird',
  Music: 'music',
  Ocean: 'waves',
  Weather: 'cloudSun',
  Animals: 'paw',
};

/** Icon for a level's theme; new themes from the generator fall back to sparkles. */
export const themeIcon = (theme: string): IconName => THEME_ICONS[theme] ?? 'sparkles';
