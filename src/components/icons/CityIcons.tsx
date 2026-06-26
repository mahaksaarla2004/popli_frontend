import React from 'react';
import Svg, { Path, Rect, Circle, Line, Polygon, G } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
}

export const MumbaiIcon = ({ size = 24, color = '#fff' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <G stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <Rect x="3" y="18" width="18" height="2" />
      <Rect x="9" y="14" width="6" height="4" />
      <Path d="M7 14 Q12 6 17 14" />
      <Path d="M5 14 Q12 3 19 14" />
      <Path d="M9 14 Q12 9 15 14" />
      <Line x1="12" y1="3" x2="12" y2="6" />
    </G>
  </Svg>
);

export const DelhiIcon = ({ size = 24, color = '#fff' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <G stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <Rect x="10" y="18" width="4" height="2" />
      <Rect x="9" y="14" width="6" height="4" />
      <Rect x="10" y="10" width="4" height="4" />
      <Rect x="11" y="6" width="2" height="4" />
      <Path d="M11 6 Q12 3 13 6" />
      <Line x1="8" y1="18" x2="16" y2="18" />
    </G>
  </Svg>
);

export const BengaluruIcon = ({ size = 24, color = '#fff' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <G stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <Rect x="2" y="18" width="20" height="2" />
      <Rect x="4" y="12" width="4" height="6" />
      <Rect x="10" y="10" width="4" height="8" />
      <Rect x="16" y="13" width="4" height="5" />
      <Path d="M4 12 Q6 8 8 12" />
      <Path d="M10 10 Q12 6 14 10" />
      <Path d="M16 13 Q18 10 20 13" />
      <Line x1="11" y1="6" x2="13" y2="6" />
      <Line x1="12" y1="4" x2="12" y2="6" />
    </G>
  </Svg>
);

export const KolkataIcon = ({ size = 24, color = '#fff' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <G stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <Rect x="3" y="18" width="18" height="2" />
      <Rect x="7" y="12" width="10" height="6" />
      <Path d="M7 12 Q12 6 17 12" />
      <Path d="M9 12 Q12 8 15 12" />
      <Line x1="12" y1="6" x2="12" y2="8" />
      <Circle cx="12" cy="5" r="1.2" />
      <Line x1="5" y1="18" x2="5" y2="14" />
      <Line x1="19" y1="18" x2="19" y2="14" />
    </G>
  </Svg>
);

export const ChennaiIcon = ({ size = 24, color = '#fff' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <G stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <Rect x="3" y="18" width="18" height="2" />
      <Rect x="9" y="13" width="6" height="5" />
      <Rect x="10" y="9" width="4" height="4" />
      <Rect x="11" y="6" width="2" height="3" />
      <Path d="M11 6 Q12 4 13 6" />
      <Rect x="5" y="15" width="3" height="3" />
      <Rect x="16" y="15" width="3" height="3" />
      <Path d="M5 15 Q6 13 8 15" />
      <Path d="M16 15 Q17 13 19 15" />
    </G>
  </Svg>
);

export const IndoreIcon = ({ size = 24, color = '#fff' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <G stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <Rect x="3" y="18" width="18" height="2" />
      <Rect x="6" y="13" width="12" height="5" />
      <Path d="M6 13 Q12 7 18 13" />
      <Line x1="12" y1="7" x2="12" y2="10" />
      <Path d="M10 10 Q12 7 14 10" />
      <Line x1="8" y1="13" x2="8" y2="18" />
      <Line x1="12" y1="13" x2="12" y2="18" />
      <Line x1="16" y1="13" x2="16" y2="18" />
      <Path d="M4 13 L6 13" />
      <Path d="M18 13 L20 13" />
    </G>
  </Svg>
);
