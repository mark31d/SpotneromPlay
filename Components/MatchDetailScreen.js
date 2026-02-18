import React, {useContext} from 'react';
import {View, Text, TouchableOpacity, ScrollView, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {UserTeamsContext} from '../App';
import TeamInitial from './TeamInitial';
import CircularProgress from './CircularProgress';
import {getOpponentStats} from '../data/simulateMatch';

const MAX_BAR = 8;

function StatColumn({label, value, color}) {
  const h = Math.min(1, value / MAX_BAR) * 56;
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

function TeamMatchCard({team, stats, strength, leadership}) {
  const w = stats?.wins ?? 0;
  const d = stats?.draws ?? 0;
  const l = stats?.losses ?? 0;
  const a = stats?.attack ?? 0;
  const def = stats?.defense ?? 0;
  const f = stats?.form ?? 0;
  return (
    <View style={st.teamCard}>
      <View style={st.teamHeader}>
        <TeamInitial teamName={team.name} size={44} />
        <Text style={st.teamCardName} numberOfLines={1}>{team.name}</Text>
        <View style={st.powerRow}>
          <Text style={st.powerLabel}>Power: {strength}</Text>
          <Text style={st.powerLabel}>Lead: {leadership}</Text>
        </View>
      </View>
      <View style={st.wdlRow}>
        <StatColumn label="W" value={w} color="#35D07F" />
        <StatColumn label="D" value={d} color="#F5C542" />
        <StatColumn label="L" value={l} color="#CC342D" />
      </View>
      <View style={st.circlesRow}>
        <CircularProgress value={a} label="A" color="#CC342D" size={52} />
        <CircularProgress value={def} label="D" color="#4A90E2" size={52} />
        <CircularProgress value={f} label="F" color="#F5C542" size={52} />
      </View>
    </View>
  );
}

function KeyStatRow({label, homeVal, awayVal}) {
  const total = homeVal + awayVal || 1;
  const pct = total > 0 ? Math.round((homeVal / total) * 100) : 50;
  return (
    <View style={st.keyStatRow}>
      <Text style={st.keyStatVal}>{homeVal}</Text>
      <View style={st.keyStatBarWrap}>
        <View style={[st.keyStatBarL, {flex: pct}]} />
        <View style={[st.keyStatBarR, {flex: 100 - pct}]} />
      </View>
      <Text style={st.keyStatLabel}>{label}</Text>
      <View style={st.keyStatBarWrap}>
        <View style={[st.keyStatBarR, {flex: pct}]} />
        <View style={[st.keyStatBarL, {flex: 100 - pct}]} />
      </View>
      <Text style={st.keyStatVal}>{awayVal}</Text>
    </View>
  );
}

export default function MatchDetailScreen({navigation, route}) {
  const insets = useSafeAreaInsets();
  const match = route?.params?.match;
  const {userTeams, teamStats, teamTraining, getBaseTeamStats, getStrength, getLeadership} = useContext(UserTeamsContext);

  if (!match) {
    return (
      <View style={[st.root, {paddingTop: insets.top}]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={st.backBtn}>
          <Text style={st.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={st.noMatch}>Match not found</Text>
      </View>
    );
  }

  const resultColor = r => (r === 'win' ? '#35D07F' : r === 'loss' ? '#CC342D' : '#F5C542');
  const resultLabel = r => (r === 'win' ? 'Home Win' : r === 'loss' ? 'Away Win' : 'Draw');

  const isHomeUser = userTeams.includes(match.homeTeam);
  const isAwayUser = userTeams.includes(match.awayName);
  const homeBase = isHomeUser ? (teamStats[match.homeTeam] || getBaseTeamStats(match.homeTeam)) : getOpponentStats(match.homeTeam);
  const awayBase = isAwayUser ? (teamStats[match.awayName] || getBaseTeamStats(match.awayName)) : getOpponentStats(match.awayName);
  const homeStats = isHomeUser ? {...homeBase, wins: homeBase.wins ?? 0, draws: homeBase.draws ?? 0, losses: homeBase.losses ?? 0} : {...homeBase, wins: 0, draws: 0, losses: 0};
  const awayStats = isAwayUser ? {...awayBase, wins: awayBase.wins ?? 0, draws: awayBase.draws ?? 0, losses: awayBase.losses ?? 0} : {...awayBase, wins: 0, draws: 0, losses: 0};
  const homeStr = getStrength ? getStrength(homeStats, teamTraining[match.homeTeam] || {}) : (homeStats.strength ?? 50);
  const awayStr = getStrength ? getStrength(awayStats, teamTraining[match.awayName] || {}) : (awayStats.strength ?? 50);
  const homeLead = getLeadership ? getLeadership(homeStats) : (homeStats.leadership ?? 1);
  const awayLead = getLeadership ? getLeadership(awayStats) : (awayStats.leadership ?? 1);

  return (
    <View style={[st.root, {paddingTop: insets.top}]}>
      <View style={st.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={st.backBtn}>
          <Text style={st.backText}>← Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={st.scroll} contentContainerStyle={st.scrollCt} showsVerticalScrollIndicator={false}>
        <View style={st.scoreRow}>
          <View style={st.scoreTeam}>
            <TeamInitial teamName={match.homeTeam} size={36} />
            <Text style={st.scoreName} numberOfLines={1}>{match.homeTeam}</Text>
          </View>
          <View style={st.scoreCenter}>
            <Text style={st.scoreText}>{match.homeScore} – {match.awayScore}</Text>
            <View style={[st.resultBadge, {backgroundColor: resultColor(match.result) + '30'}]}>
              <Text style={[st.resultText, {color: resultColor(match.result)}]}>{resultLabel(match.result)}</Text>
            </View>
          </View>
          <View style={st.scoreTeam}>
            <TeamInitial teamName={match.awayName} size={36} />
            <Text style={st.scoreName} numberOfLines={1}>{match.awayName}</Text>
          </View>
        </View>

        {match.matchStats ? (
          <View style={st.statsSection}>
            <Text style={st.statsTitle}>SHOTS ON TARGET</Text>
            <View style={st.barChart}>
              <View style={st.barGroup}>
                <Text style={st.barLabel}>{match.homeTeam}</Text>
                <View style={st.barTrack}>
                  <View style={[st.barFill, st.barHome, {width: `${Math.min(100, (match.matchStats.shotsOnTarget.home / 15) * 100)}%`}]} />
                </View>
                <Text style={st.barVal}>{match.matchStats.shotsOnTarget.home}</Text>
              </View>
              <View style={st.barGroup}>
                <Text style={st.barLabel}>{match.awayName}</Text>
                <View style={st.barTrack}>
                  <View style={[st.barFill, st.barAway, {width: `${Math.min(100, (match.matchStats.shotsOnTarget.away / 15) * 100)}%`}]} />
                </View>
                <Text style={st.barVal}>{match.matchStats.shotsOnTarget.away}</Text>
              </View>
            </View>
            <Text style={st.statsTitle}>KEY STATS</Text>
            <KeyStatRow label="Possession" homeVal={match.matchStats.possession.home} awayVal={match.matchStats.possession.away} />
            <KeyStatRow label="Corners" homeVal={match.matchStats.corners.home} awayVal={match.matchStats.corners.away} />
            <KeyStatRow label="Fouls" homeVal={match.matchStats.fouls.home} awayVal={match.matchStats.fouls.away} />
            <KeyStatRow label="Shots" homeVal={match.matchStats.shots.home} awayVal={match.matchStats.shots.away} />
            <KeyStatRow label="Cards" homeVal={match.matchStats.cards.home} awayVal={match.matchStats.cards.away} />
          </View>
        ) : (
          <Text style={st.noStatsText}>No stats available for this match</Text>
        )}

        <View style={st.cardsRow}>
          <TeamMatchCard team={{name: match.homeTeam}} stats={homeStats} strength={homeStr} leadership={homeLead} />
          <TeamMatchCard team={{name: match.awayName}} stats={awayStats} strength={awayStr} leadership={awayLead} />
        </View>
      </ScrollView>
      <View style={{height: insets.bottom || 16}} />
    </View>
  );
}

const st = StyleSheet.create({
  root: {flex: 1, backgroundColor: '#141214'},
  header: {paddingHorizontal: 14, paddingBottom: 8},
  backBtn: {},
  backText: {color: '#CC342D', fontSize: 16, fontWeight: '600'},
  noMatch: {color: '#B9B6B6', fontSize: 14, textAlign: 'center', marginTop: 40},

  scroll: {flex: 1},
  scrollCt: {paddingHorizontal: 14, paddingBottom: 24},
  scoreRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20},
  scoreTeam: {flex: 1, alignItems: 'center'},
  scoreName: {color: '#F4F3F3', fontSize: 12, fontWeight: '600', marginTop: 6, textAlign: 'center'},
  scoreCenter: {alignItems: 'center', paddingHorizontal: 12},
  scoreText: {color: '#F4F3F3', fontSize: 24, fontWeight: '900'},
  resultBadge: {marginTop: 8, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8},
  resultText: {fontSize: 11, fontWeight: '700'},

  statsSection: {marginBottom: 20},
  statsTitle: {color: '#B9B6B6', fontSize: 11, fontWeight: '700', letterSpacing: 0.5, marginTop: 16, marginBottom: 8},
  barChart: {marginBottom: 4},
  barGroup: {flexDirection: 'row', alignItems: 'center', marginBottom: 6},
  barLabel: {color: '#B9B6B6', fontSize: 11, width: 80},
  barTrack: {flex: 1, height: 8, backgroundColor: '#2A2325', borderRadius: 4, overflow: 'hidden'},
  barFill: {height: '100%', borderRadius: 4},
  barHome: {backgroundColor: '#CC342D'},
  barAway: {backgroundColor: '#4A90E2'},
  barVal: {color: '#F4F3F3', fontSize: 12, fontWeight: '600', width: 24, textAlign: 'right'},
  keyStatRow: {flexDirection: 'row', alignItems: 'center', marginBottom: 6},
  keyStatVal: {color: '#F4F3F3', fontSize: 12, fontWeight: '600', width: 24, textAlign: 'center'},
  keyStatBarWrap: {flex: 1, flexDirection: 'row', marginHorizontal: 6},
  keyStatBarL: {height: 6, backgroundColor: '#CC342D', borderTopLeftRadius: 3, borderBottomLeftRadius: 3},
  keyStatBarR: {height: 6, backgroundColor: '#4A90E2', borderTopRightRadius: 3, borderBottomRightRadius: 3},
  keyStatLabel: {color: '#B9B6B6', fontSize: 10, width: 56},
  noStatsText: {color: '#B9B6B6', fontSize: 13, textAlign: 'center', marginTop: 16},

  cardsRow: {flexDirection: 'row', gap: 12, marginTop: 8},
  teamCard: {flex: 1, backgroundColor: '#1B1A1B', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#2A2325'},
  teamHeader: {alignItems: 'center', marginBottom: 12},
  teamCardName: {color: '#F4F3F3', fontSize: 13, fontWeight: '700', marginTop: 6, textAlign: 'center'},
  powerRow: {flexDirection: 'row', gap: 8, marginTop: 4},
  powerLabel: {color: '#B9B6B6', fontSize: 10, fontWeight: '600'},
  wdlRow: {flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16},
  col: {alignItems: 'center'},
  barBg: {width: 24, height: 56, backgroundColor: '#2A2325', borderRadius: 4, justifyContent: 'flex-end', overflow: 'hidden'},
  barFill: {width: '100%', borderBottomLeftRadius: 4, borderBottomRightRadius: 4, minHeight: 2},
  colLabel: {color: '#B9B6B6', fontSize: 10, fontWeight: '700', marginTop: 4},
  colVal: {color: '#F4F3F3', fontSize: 12, fontWeight: '800'},
  circlesRow: {flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end'},
});
