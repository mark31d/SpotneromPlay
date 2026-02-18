import React, {useState} from 'react';
import {View, Text, TouchableOpacity, ScrollView, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const FAQ = [
  {q: 'What is Spotnerom Play?', a: 'A match simulator. You add teams, simulate matches by attack, defense and form, build rating from wins and draws, train teams, and compete on the leaderboard.'},
  {q: 'How do I simulate a match?', a: 'Go to Play, select your team and opponent, then tap Simulate Match. The result is based on attack, defense and form.'},
  {q: 'What is rating?', a: 'Rating = wins × 3 + draws. Teams climb the leaderboard by winning and drawing matches.'},
  {q: 'How do I add teams?', a: 'Go to Account, tap + Add Team, and enter the team name. Each team gets random attack/defense/form stats.'},
  {q: 'How does the leaderboard work?', a: 'Teams are ranked by rating. More wins and draws = higher rank. Check Match History for full stats.'},
];

export default function HelpScreen({navigation}) {
  const insets = useSafeAreaInsets();
  const [expanded, setExpanded] = useState(null);

  return (
    <View style={[st.root, {paddingTop: insets.top}]}>
      <View style={st.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={st.backBtn}>
          <Text style={st.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={st.title}>Support</Text>
      </View>
      <ScrollView style={st.scroll} contentContainerStyle={st.scrollCt}>
        <Text style={st.subtitle}>FAQ & how-to</Text>
        {FAQ.map((item, i) => (
          <TouchableOpacity key={i} style={st.faqItem} onPress={() => setExpanded(expanded === i ? null : i)} activeOpacity={0.8}>
            <Text style={st.faqQ}>{item.q}</Text>
            {expanded === i && <Text style={st.faqA}>{item.a}</Text>}
          </TouchableOpacity>
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
  faqItem: {backgroundColor: '#1B1A1B', borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#2A2325'},
  faqQ: {color: '#F4F3F3', fontSize: 15, fontWeight: '600'},
  faqA: {color: '#B9B6B6', fontSize: 13, marginTop: 8, lineHeight: 20},
});
