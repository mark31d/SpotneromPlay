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

export function CloseIcon({size = 18, color = '#CC342D'}) {
  const w = size * 0.12;
  return (
    <View style={[s.closeWrap, {width: size, height: size}]}>
      <View style={[s.closeLine, {width: size * 1.4, height: w, backgroundColor: color}, s.closeLine1]} />
      <View style={[s.closeLine, {width: size * 1.4, height: w, backgroundColor: color}, s.closeLine2]} />
    </View>
  );
}

export function ChevronRightIcon({size = 16, color = '#B9B6B6'}) {
  return (
    <Text style={[s.chevronText, {fontSize: size * 1.1, color}]}>›</Text>
  );
}

export function StarIcon({size = 18, filled = false, color = '#CC342D'}) {
  return (
    <View style={[s.starWrap, {width: size, height: size, borderColor: color}]}>
      {filled && <View style={[s.starFill, {backgroundColor: color}]} />}
    </View>
  );
}

export function CheckIcon({size = 18, color = '#35D07F'}) {
  const w = size * 0.15;
  return (
    <View style={[s.checkWrap, {width: size, height: size, transform: [{rotate: '180deg'}]}]}>
      <View style={[s.checkLine, {width: size * 0.6, height: w, backgroundColor: color}, s.checkShort]} />
      <View style={[s.checkLine, {width: size * 0.35, height: w, backgroundColor: color}, s.checkLong]} />
    </View>
  );
}

export function GoalIcon({size = 14, color = '#B9B6B6'}) {
  return (
    <View style={[s.goalIcon, {width: size, height: size, borderRadius: size / 2, borderColor: color}]} />
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
  closeWrap: {alignItems: 'center', justifyContent: 'center'},
  closeLine: {position: 'absolute', borderRadius: 2},
  closeLine1: {transform: [{rotate: '45deg'}]},
  closeLine2: {transform: [{rotate: '-45deg'}]},
  chevronText: {fontWeight: '600'},
  starWrap: {borderWidth: 2, borderRadius: 4, alignItems: 'center', justifyContent: 'center'},
  starFill: {position: 'absolute', width: '70%', height: '70%', borderRadius: 2},
  checkWrap: {alignItems: 'center', justifyContent: 'center'},
  checkLine: {position: 'absolute', borderRadius: 2},
  checkShort: {transform: [{rotate: '-45deg'}], bottom: '45%', left: '10%'},
  checkLong: {transform: [{rotate: '45deg'}], top: '35%', right: '15%'},
  goalIcon: {borderWidth: 2},
});
