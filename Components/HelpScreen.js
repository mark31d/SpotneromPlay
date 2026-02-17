import React, {useState} from 'react';
import {View, Text, TouchableOpacity, ScrollView, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const FAQ = [
  {q: 'How do I place a bet?', a: 'Tap odds on any match to add picks to your betslip. Set your stake and tap Place Bet.'},
  {q: 'What are points?', a: 'Points are virtual currency for fun predictions. No real money is involved.'},
  {q: 'How do I add teams?', a: 'Go to Account, tap + Add Team, and enter the team name.'},
  {q: 'How does the leaderboard work?', a: 'Earn points by winning bets. Share your rank to compete with friends.'},
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
        <Text style={st.title}>Help</Text>
      </View>
      <ScrollView style={st.scroll} contentContainerStyle={st.scrollCt}>
        <Text style={st.subtitle}>FAQ & support</Text>
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
