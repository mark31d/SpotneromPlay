import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

const COLORS = [
  '#4A90D9', '#CC342D', '#35D07F', '#9B59B6', '#F5C542',
  '#E67E22', '#1ABC9C', '#E74C3C', '#3498DB', '#2ECC71',
];

function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h) + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export default function PlayerAvatar({playerName, size = 28}) {
  const name = playerName || '?';
  const initial = name.charAt(0).toUpperCase();
  const h = hash(name);
  const color = COLORS[h % COLORS.length];
  const fontSize = Math.max(10, size * 0.5);

  return (
    <View
      style={[
        s.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
      ]}>
      <Text style={[s.letter, {fontSize, color: '#fff'}]}>{initial}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  circle: {alignItems: 'center', justifyContent: 'center'},
  letter: {fontWeight: '800'},
});
