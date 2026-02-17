import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

export function LiveBadge({size = 20}) {
  return (
    <View style={[s.liveBadge, {paddingHorizontal: size * 0.4, paddingVertical: size * 0.15, borderRadius: size * 0.3}]}>
      <Text style={[s.liveText, {fontSize: size * 0.5}]}>LIVE</Text>
    </View>
  );
}

export function MoreDotsIcon({size = 20}) {
  const dotSize = size * 0.2;
  return (
    <View style={[s.moreDots, {width: size, height: size}]}>
      <View style={[s.dot, {width: dotSize, height: dotSize, borderRadius: dotSize / 2}]} />
      <View style={[s.dot, {width: dotSize, height: dotSize, borderRadius: dotSize / 2}]} />
      <View style={[s.dot, {width: dotSize, height: dotSize, borderRadius: dotSize / 2}]} />
    </View>
  );
}

export function PlusIcon({size = 18, color}) {
  const wrapStyle = color ? {backgroundColor: 'transparent', borderColor: 'transparent'} : null;
  return (
    <View style={[s.plusWrap, {width: size, height: size, borderRadius: size / 2}, wrapStyle]}>
      <Text style={[s.plusText, {fontSize: size * 0.8}, color && {color}]}>+</Text>
    </View>
  );
}

export function SortIndicator({size = 10}) {
  return (
    <View style={[s.sortDot, {width: size, height: size, borderRadius: size / 2}]} />
  );
}

export function StatIcon({index, size = 24}) {
  const letters = ['W', 'S', 'L', '?', 'P', 'L'];
  const colors = ['#35D07F', '#F5C542', '#B9B6B6', '#9B59B6', '#CC342D', '#4A90D9'];
  const i = index % letters.length;
  return (
    <View style={[s.statIcon, {width: size, height: size, borderRadius: size / 2, backgroundColor: colors[i] + '40'}]}>
      <Text style={[s.statIconText, {fontSize: size * 0.5, color: colors[i], fontWeight: '700'}]}>{letters[i]}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  liveBadge: {backgroundColor: '#CC342D'},
  liveText: {color: '#fff', fontWeight: '800'},
  moreDots: {flexDirection: 'column', alignItems: 'center', justifyContent: 'space-evenly'},
  dot: {backgroundColor: '#B9B6B6'},
  plusWrap: {backgroundColor: '#2A2325', borderWidth: 1, borderColor: '#2A2325', alignItems: 'center', justifyContent: 'center'},
  plusText: {color: '#F4F3F3', fontWeight: '700'},
  sortDot: {backgroundColor: '#CC342D'},
  statIcon: {alignItems: 'center', justifyContent: 'center'},
  statIconText: {},
});
