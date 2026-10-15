import React, {useId} from 'react';
import Svg, {Circle, Defs, LinearGradient, Path, Rect, Stop} from 'react-native-svg';
import {brandGradient} from '../theme';

const NODES = [6, 12, 18].flatMap(x => [6, 12, 18].map(y => [x, y]));

/**
 * The WordWeave mark: one path that snakes through every cell of a 3×3 grid,
 * which is exactly how a solved board works.
 */
export default function BrandMark({size = 56}: {size?: number}) {
  const id = `bm${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={brandGradient[0]} />
          <Stop offset="1" stopColor={brandGradient[1]} />
        </LinearGradient>
      </Defs>
      <Rect width={24} height={24} rx={6.5} fill={`url(#${id})`} />
      <Path
        d="M6 6V18H12V6H18V18"
        fill="none"
        stroke="#fff"
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {NODES.map(([x, y]) => (
        <Circle key={`${x}-${y}`} cx={x} cy={y} r={1.9} fill="#fff" />
      ))}
      <Circle cx={18} cy={18} r={2.6} fill="#FFC94A" />
    </Svg>
  );
}
