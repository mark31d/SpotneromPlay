import React, {useContext, useMemo} from 'react';
import {View, Text, TouchableOpacity, ScrollView, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {UserTeamsContext} from '../App';
import TeamInitial from './TeamInitial';
import CircularProgress from './CircularProgress';

const MAX_BAR = 12;

function StatColumn({label, value, color}) {
  const h = Math.min(1, value / MAX_BAR) * 48;
  return (
    <View style={st.col}>
      <View style={st.barBg}>
        <View style={[st.barFill, {height: h, backgroundColor: color}]} />
      </View>
      <Text style={st.colLabel}>{label}</Text>
      <Text style={st.colVal}>{value}</Text>
    </View>
  );
}

function LineBar({label, value, maxVal = 100, color = '#CC342D'}) {
  const pct = Math.min(100, maxVal > 0 ? (value / maxVal) * 100 : 0);
  return (
    <View style={st.lineBar}>
      {label ? <Text style={st.lineBarLabel}>{label}</Text> : null}
      <View style={st.lineBarTrack}>
        <View style={[st.lineBarFill, {width: `${pct}%`, backgroundColor: color}]} />
      </View>
      <Text style={st.lineBarVal}>{value}</Text>
    </View>
  );
}

export default function TeamStatsScreen({navigation}) {
  const insets = useSafeAreaInsets();
  const {userTeams, teamStats, teamTraining, getBaseTeamStats, getRating, getStrength, getLeadership} = useContext(UserTeamsContext);

  const teamsWithStats = useMemo(() => {
    return userTeams.map(name => {
      const s = teamStats[name] || getBaseTeamStats(name);
      const t = teamTraining[name] || {};
      return {
        name,
        ...s,
        rating: getRating(s),
        strength: getStrength(s, t),
        leadership: getLeadership(s),
      };
    }).sort((a, b) => b.rating - a.rating);
  }, [userTeams, teamStats, teamTraining]);

  return (
    <View style={[st.root, {paddingTop: insets.top}]}>
      <View style={st.header}>
        <Text style={st.title}>Team Statistics</Text>
        <TouchableOpacity style={st.trainBtn} onPress={() => navigation.navigate('TeamTraining')}>
          <Text style={st.trainBtnText}>Training</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={st.scroll} contentContainerStyle={st.scrollCt}>
        {teamsWithStats.length === 0 ? (
          <View style={st.empty}>
            <Text style={st.emptyText}>Add teams in Account</Text>
            <TouchableOpacity style={st.ctaBtn} onPress={() => navigation.navigate('Account')}>
              <Text style={st.ctaText}>Add Team</Text>
            </TouchableOpacity>
          </View>
        ) : (
          teamsWithStats.map((team, i) => (
            <View key={team.name} style={st.card}>
              <View style={st.cardHeader}>
                <View style={st.rankBadge}>
                  <Text style={st.rankText}>#{i + 1}</Text>
                </View>
                <TeamInitial teamName={team.name} size={48} />
                <View style={st.cardInfo}>
                  <Text style={st.teamName}>{team.name}</Text>
                  <View style={st.powerRow}>
                    <Text style={st.powerText}>Power: {team.strength}</Text>
                    <Text style={st.powerText}>Lead: {team.leadership}</Text>
                  </View>
                  <Text style={st.ratingText}>{team.rating} pts</Text>
                </View>
              </View>

              <View style={st.section}>
                <Text style={st.sectionTitle}>W / D / L</Text>
                <View style={st.wdlRow}>
                  <StatColumn label="W" value={team.wins ?? 0} color="#35D07F" />
                  <StatColumn label="D" value={team.draws ?? 0} color="#F5C542" />
                  <StatColumn label="L" value={team.losses ?? 0} color="#CC342D" />
                </View>
              </View>

              <View style={st.section}>
                <Text style={st.sectionTitle}>Goals</Text>
                <View style={st.goalsRow}>
                  <View style={st.goalsHalf}>
                    <Text style={st.goalsLabel}>Scored</Text>
                    <LineBar value={team.goalsScored ?? 0} maxVal={50} color="#35D07F" />
                  </View>
                  <View style={st.goalsHalf}>
                    <Text style={st.goalsLabel}>Conceded</Text>
                    <LineBar value={team.goalsConceded ?? 0} maxVal={50} color="#CC342D" />
                  </View>
                </View>
              </View>

              <View style={st.section}>
                <Text style={st.sectionTitle}>Strength</Text>
                <LineBar label="" value={team.strength} maxVal={100} color="#35D07F" />
              </View>

              <View style={st.section}>
                <Text style={st.sectionTitle}>Characteristics (A / D / F)</Text>
                <View style={st.circlesRow}>
                  <CircularProgress value={team.attack ?? 0} label="A" color="#CC342D" size={52} />
                  <CircularProgress value={team.defense ?? 0} label="D" color="#4A90E2" size={52} />
                  <CircularProgress value={team.form ?? 0} label="F" color="#F5C542" size={52} />
                </View>
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
  header: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingBottom: 12},
  title: {color: '#F4F3F3', fontSize: 20, fontWeight: '800'},
  trainBtn: {backgroundColor: '#CC342D', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10},
  trainBtnText: {color: '#fff', fontSize: 13, fontWeight: '700'},
  scroll: {flex: 1},
  scrollCt: {paddingHorizontal: 14, paddingBottom: 24},
  empty: {alignItems: 'center', paddingTop: 60},
  emptyText: {color: '#B9B6B6', fontSize: 14, marginBottom: 20},
  ctaBtn: {backgroundColor: '#CC342D', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12},
  ctaText: {color: '#fff', fontSize: 14, fontWeight: '700'},
  card: {backgroundColor: '#1B1A1B', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#2A2325'},
  cardHeader: {flexDirection: 'row', alignItems: 'center'},
  rankBadge: {width: 36, height: 36, borderRadius: 18, backgroundColor: '#CC342D', alignItems: 'center', justifyContent: 'center', marginRight: 12},
  rankText: {color: '#fff', fontSize: 12, fontWeight: '800'},
  cardInfo: {flex: 1, marginLeft: 14},
  teamName: {color: '#F4F3F3', fontSize: 16, fontWeight: '700', marginBottom: 4},
  powerRow: {flexDirection: 'row', gap: 12, marginBottom: 4},
  powerText: {color: '#35D07F', fontSize: 12, fontWeight: '600'},
  ratingText: {color: '#B9B6B6', fontSize: 12},

  section: {marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#2A2325'},
  sectionTitle: {color: '#B9B6B6', fontSize: 11, fontWeight: '700', letterSpacing: 0.5, marginBottom: 10},
  wdlRow: {flexDirection: 'row', justifyContent: 'space-around'},
  col: {alignItems: 'center'},
  barBg: {width: 22, height: 48, backgroundColor: '#2A2325', borderRadius: 4, justifyContent: 'flex-end', overflow: 'hidden'},
  barFill: {width: '100%', borderBottomLeftRadius: 4, borderBottomRightRadius: 4, minHeight: 2},
  colLabel: {color: '#B9B6B6', fontSize: 10, fontWeight: '700', marginTop: 4},
  colVal: {color: '#F4F3F3', fontSize: 12, fontWeight: '800'},
  goalsRow: {flexDirection: 'row', gap: 16},
  goalsHalf: {flex: 1},
  goalsLabel: {color: '#B9B6B6', fontSize: 10, marginBottom: 4},
  lineBar: {flexDirection: 'row', alignItems: 'center', marginBottom: 6},
  lineBarLabel: {color: '#B9B6B6', fontSize: 11, width: 50},
  lineBarTrack: {flex: 1, height: 8, backgroundColor: '#2A2325', borderRadius: 4, overflow: 'hidden'},
  lineBarFill: {height: '100%', borderRadius: 4},
  lineBarVal: {color: '#F4F3F3', fontSize: 12, fontWeight: '700', width: 28, textAlign: 'right'},
  circlesRow: {flexDirection: 'row', justifyContent: 'space-around'},
});
