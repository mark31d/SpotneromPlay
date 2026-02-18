import React from 'react';
import {View, Text, TouchableOpacity, ScrollView, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {StatIcon, CheckIcon} from './DrawnBadge';

const ACHIEVEMENTS = [
  {id: '1', title: 'First Match', desc: 'Simulate your first match', iconIdx: 0, unlocked: true},
  {id: '2', title: 'First Win', desc: 'Win your first match', iconIdx: 1, unlocked: true},
  {id: '3', title: 'Rating 10', desc: 'Reach 10 rating points', iconIdx: 4, unlocked: true},
  {id: '4', title: 'Hot Streak', desc: 'Win 5 matches in a row', iconIdx: 5, unlocked: false},
  {id: '5', title: 'Century', desc: 'Reach 100 rating points', iconIdx: 0, unlocked: false},
  {id: '6', title: 'Loyal Fan', desc: 'Add 5 teams', iconIdx: 1, unlocked: false},
];

export default function AchievementsScreen({navigation}) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[st.root, {paddingTop: insets.top}]}>
      <View style={st.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={st.backBtn}>
          <Text style={st.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={st.title}>Achievements</Text>
      </View>
      <ScrollView style={st.scroll} contentContainerStyle={st.scrollCt}>
        <Text style={st.subtitle}>Badges & milestones</Text>
        {ACHIEVEMENTS.map(a => (
          <View key={a.id} style={[st.card, !a.unlocked && st.cardLocked]}>
            <View style={st.cardIcon}>
              <StatIcon index={a.iconIdx} size={32} />
            </View>
            <View style={st.cardContent}>
              <Text style={[st.cardTitle, !a.unlocked && st.textMuted]}>{a.title}</Text>
              <Text style={[st.cardDesc, !a.unlocked && st.textMuted]}>{a.desc}</Text>
            </View>
            {a.unlocked ? (
              <CheckIcon size={20} />
            ) : (
              <Text style={st.locked}>Locked</Text>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  root: {flex: 1, backgroundColor: '#141214'},
  header: {flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingBottom: 12},
  backBtn: {marginRight: 12},
  backText: {color: '#CC342D', fontSize: 16, fontWeight: '600'},
  title: {color: '#F4F3F3', fontSize: 20, fontWeight: '800'},
  scroll: {flex: 1},
  scrollCt: {paddingHorizontal: 14, paddingBottom: 24},
  subtitle: {color: '#B9B6B6', fontSize: 13, marginBottom: 16},
  card: {flexDirection: 'row', alignItems: 'center', backgroundColor: '#1B1A1B', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#2A2325'},
  cardLocked: {opacity: 0.7},
  cardIcon: {marginRight: 14},
  cardContent: {flex: 1},
  cardTitle: {color: '#F4F3F3', fontSize: 15, fontWeight: '700', marginBottom: 2},
  cardDesc: {color: '#B9B6B6', fontSize: 12},
  textMuted: {color: '#666'},
  locked: {color: '#666', fontSize: 11, fontWeight: '600'},
});
