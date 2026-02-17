import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

const COLORS = [
  '#4A90D9', '#CC342D', '#35D07F', '#9B59B6', '#F5C542',
  '#E67E22', '#1ABC9C', '#E74C3C', '#3498DB', '#2ECC71',
  '#8E44AD', '#F39C12', '#16A085', '#C0392B', '#2980B9',
];

function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h) + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export default function TeamInitial({teamName, size = 28, style}) {
  const name = teamName || '?';
  const initial = name.charAt(0).toUpperCase();
  const h = hash(name);
  const color = COLORS[h % COLORS.length];

  const shapeIdx = Math.floor(h / 1000) % 6;
  const fontSize = Math.max(10, size * 0.5);

  if (shapeIdx === 4) {
    return (
      <View style={[{width: size, height: size, alignItems: 'center', justifyContent: 'center'}, style]}>
        <View
          style={{
            width: size * 0.72,
            height: size * 0.72,
            backgroundColor: color,
            transform: [{rotate: '45deg'}],
            position: 'absolute',
          }}
        />
        <Text style={[s.letter, {fontSize, color: '#fff'}]}>{initial}</Text>
      </View>
    );
  }

  const shapeStyles = [
    {borderRadius: size / 2},
    {borderRadius: 2},
    {borderRadius: size / 5},
    {borderRadius: size / 3},
    null,
    {borderRadius: size * 0.4, width: size * 1.1, height: size * 0.88},
  ];

  const shapeStyle = shapeStyles[shapeIdx] || {};
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          backgroundColor: color,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        },
        shapeStyle,
        style,
      ]}>
      <Text style={[s.letter, {fontSize, color: '#fff'}]}>{initial}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  letter: {fontWeight: '800'},
});
