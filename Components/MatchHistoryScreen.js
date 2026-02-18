import React, {useContext} from 'react';
import {View, Text, TouchableOpacity, ScrollView, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {UserTeamsContext} from '../App';
import TeamInitial from './TeamInitial';

export default function MatchHistoryScreen({navigation}) {
  const insets = useSafeAreaInsets();
  const {matchHistory} = useContext(UserTeamsContext);

  const winCount = matchHistory.filter(m => m.result === 'win').length;
  const totalGoals = matchHistory.reduce((a, m) => a + m.homeScore + m.awayScore, 0);

  const resultColor = r => (r === 'win' ? '#35D07F' : r === 'loss' ? '#CC342D' : '#F5C542');
  const resultLabel = r => (r === 'win' ? 'Win' : r === 'loss' ? 'Loss' : 'Draw');

  return (
    <View style={[st.root, {paddingTop: insets.top}]}>
      <View style={st.header}>
        <Text style={st.title}>Match History</Text>
        <View style={st.statsRow}>
          <View style={st.statPill}>
            <Text style={st.statLabel}>Wins</Text>
            <Text style={st.statVal}>{winCount}</Text>
          </View>
          <View style={st.statPill}>
            <Text style={st.statLabel}>Matches</Text>
            <Text style={st.statVal}>{matchHistory.length}</Text>
          </View>
          <View style={st.statPill}>
            <Text style={st.statLabel}>Goals</Text>
            <Text style={st.statVal}>{totalGoals}</Text>
          </View>
        </View>
      </View>

      <ScrollView style={st.scroll} contentContainerStyle={st.scrollCt}>
        {matchHistory.length === 0 ? (
          <View style={st.empty}>
            <Text style={st.emptyTitle}>No matches yet</Text>
            <Text style={st.emptySub}>
              Play matches to see your history here.
            </Text>
            <TouchableOpacity style={st.ctaBtn} onPress={() => navigation.navigate('Play')}>
              <Text style={st.ctaText}>Play Match</Text>
            </TouchableOpacity>
          </View>
        ) : (
          matchHistory.map(m => (
            <TouchableOpacity key={m.id} style={st.card} onPress={() => navigation.navigate('MatchDetail', {match: m})} activeOpacity={0.8}>
              <View style={st.cardRow}>
                <TeamInitial teamName={m.homeTeam} size={24} />
                <Text style={st.teamName} numberOfLines={1}>{m.homeTeam}</Text>
                <Text style={st.score}>{m.homeScore} – {m.awayScore}</Text>
                <Text style={st.teamName} numberOfLines={1}>{m.awayName}</Text>
                <TeamInitial teamName={m.awayName} size={24} />
              </View>
              <View style={[st.resultBadge, {backgroundColor: resultColor(m.result) + '30'}]}>
                <Text style={[st.resultText, {color: resultColor(m.result)}]}>{resultLabel(m.result)}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
      <View style={{height: insets.bottom || 16}} />
    </View>
  );
}

const st = StyleSheet.create({
  root: {flex: 1, backgroundColor: '#141214'},
  header: {paddingHorizontal: 14, paddingBottom: 12},
  title: {fontSize: 22, fontWeight: '800', color: '#F4F3F3', marginBottom: 12},
  statsRow: {flexDirection: 'row', gap: 10},
  statPill: {flex: 1, backgroundColor: '#1B1A1B', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#2A2325'},
  statLabel: {color: '#B9B6B6', fontSize: 11, fontWeight: '600', marginBottom: 2},
  statVal: {color: '#35D07F', fontSize: 16, fontWeight: '800'},

  scroll: {flex: 1},
  scrollCt: {paddingHorizontal: 14, paddingBottom: 20, gap: 8},

  empty: {alignItems: 'center', paddingTop: 60},
  emptyTitle: {color: '#F4F3F3', fontSize: 18, fontWeight: '700', marginBottom: 6},
  emptySub: {color: '#B9B6B6', fontSize: 13, textAlign: 'center', marginBottom: 24},
  ctaBtn: {backgroundColor: '#CC342D', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12},
  ctaText: {color: '#fff', fontSize: 14, fontWeight: '700'},

  card: {backgroundColor: '#1B1A1B', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#2A2325'},
  cardRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8},
  teamName: {color: '#F4F3F3', fontSize: 12, fontWeight: '600', flex: 1},
  score: {color: '#F4F3F3', fontSize: 16, fontWeight: '800'},
  resultBadge: {alignSelf: 'flex-start', marginTop: 8, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8},
  resultText: {fontSize: 10, fontWeight: '700'},
});
