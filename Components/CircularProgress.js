import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Svg, {Circle, G} from 'react-native-svg';

/**
 * Circular progress 0-1 (or 0-5 mapped to 0-1)
 * @param {number} value - 0 to 5 (or 0-1 if maxVal=1)
 * @param {number} size - diameter
 * @param {string} color - stroke color
 * @param {number} maxVal - max value (5 for A/D/F)
 */
export default function CircularProgress({value, size = 48, color = '#CC342D', maxVal = 5, label}) {
  const progress = Math.min(1, Math.max(0, value / maxVal));
  const strokeWidth = size * 0.12;
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - progress);

  return (
    <View style={[s.wrap, {width: size, height: size + 24}]}>
      <Svg width={size} height={size} style={s.svg}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="#2A2325"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <G rotation={-90} origin={`${size / 2}, ${size / 2}`}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </G>
      </Svg>
      {label !== undefined && (
        <View style={s.labelWrap}>
          <Text style={s.label}>{label}</Text>
          <Text style={s.value}>{Math.round(progress * 100)}%</Text>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {alignItems: 'center', justifyContent: 'flex-start'},
  svg: {},
  labelWrap: {position: 'absolute', bottom: 0, alignItems: 'center'},
  label: {color: '#B9B6B6', fontSize: 9, fontWeight: '600'},
  value: {color: '#F4F3F3', fontSize: 11, fontWeight: '800'},
});
