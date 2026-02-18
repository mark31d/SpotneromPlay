import React, {useContext, useMemo} from 'react';
import {View, Text, TouchableOpacity, ScrollView, StyleSheet, Share} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {UserTeamsContext, ProfileContext} from '../App';
import TeamInitial from './TeamInitial';

export default function LeaderboardScreen({navigation}) {
  const insets = useSafeAreaInsets();
  const {userTeams, teamStats, getBaseTeamStats, getRating} = useContext(UserTeamsContext);
  const {profile} = useContext(ProfileContext);

  const leaderboard = useMemo(() => {
    return userTeams
      .map(name => {
        const s = teamStats[name] || getBaseTeamStats(name);
        return {
          name,
          rating: getRating(s),
          wins: s.wins || 0,
          losses: s.losses || 0,
          draws: s.draws || 0,
          goalsScored: s.goalsScored || 0,
          goalsConceded: s.goalsConceded || 0,
          attack: s.attack ?? 0,
          defense: s.defense ?? 0,
          form: s.form ?? 0,
        };
      })
      .sort((a, b) => b.rating - a.rating)
      .map((p, i) => ({...p, rank: i + 1}));
  }, [userTeams, teamStats]);

  const topRating = leaderboard[0]?.rating ?? 0;

  const shareRank = () => {
    const msg = `My teams on Spotnerom Play leaderboard! Top rating: ${topRating}. Simulate. Compete. Have fun.`;
    Share.share({message: msg, title: 'Spotnerom Play'}).catch(() => {});
  };

  return (
    <View style={[st.root, {paddingTop: insets.top}]}>
      <View style={st.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={st.backBtn}>
          <Text style={st.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={st.title}>Leaderboard</Text>
      </View>
      <ScrollView style={st.scroll} contentContainerStyle={st.scrollCt}>
        <Text style={st.subtitle}>Teams by rating (wins×3 + draws)</Text>
        <TouchableOpacity style={st.shareBtn} onPress={shareRank} activeOpacity={0.8}>
          <Text style={st.shareBtnText}>Share</Text>
        </TouchableOpacity>
        {leaderboard.length === 0 ? (
          <Text style={st.empty}>Add teams in Account to see them here.</Text>
        ) : (
          leaderboard.map((p, i) => (
            <View key={p.name} style={st.row}>
              <Text style={st.rank}>#{p.rank}</Text>
              <TeamInitial teamName={p.name} size={40} />
              <View style={st.rowInfo}>
                <Text style={st.name}>{p.name}</Text>
                <Text style={st.pts}>{p.rating} pts · W{p.wins} D{p.draws} L{p.losses} · {p.goalsScored}/{p.goalsConceded}</Text>
                <Text style={st.attrs}>A:{p.attack} D:{p.defense} F:{p.form}</Text>
              </View>
            </View>
          ))
        )}
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
  subtitle: {color: '#B9B6B6', fontSize: 13, marginBottom: 12},
  shareBtn: {backgroundColor: '#CC342D', borderRadius: 12, padding: 12, alignItems: 'center', marginBottom: 20},
  shareBtnText: {color: '#fff', fontSize: 14, fontWeight: '700'},
  empty: {color: '#B9B6B6', fontSize: 14, textAlign: 'center'},
  row: {flexDirection: 'row', alignItems: 'center', backgroundColor: '#1B1A1B', borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#2A2325'},
  rank: {width: 36, color: '#B9B6B6', fontSize: 14, fontWeight: '700'},
  rowInfo: {flex: 1, marginLeft: 12},
  name: {color: '#F4F3F3', fontSize: 16, fontWeight: '700'},
  pts: {color: '#35D07F', fontSize: 13, fontWeight: '600', marginTop: 2},
  attrs: {color: '#B9B6B6', fontSize: 11, marginTop: 2},
});
