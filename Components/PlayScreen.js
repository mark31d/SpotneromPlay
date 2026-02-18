import React, {useState, useContext} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {UserTeamsContext} from '../App';
import TeamInitial from './TeamInitial';
import CircularProgress from './CircularProgress';
import {getOpponents, pickRandomMatch, simulateMatch} from '../data/simulateMatch';

const MAX_BAR = 8;
const SEGS = ['Select', 'Stats'];

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
        <Text style={st.teamName} numberOfLines={1}>{team.name}</Text>
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

export default function PlayScreen({navigation}) {
  const insets = useSafeAreaInsets();
  const {userTeams, teamStats, teamTraining, getBaseTeamStats, getRating, getStrength, getLeadership, recordMatch} = useContext(UserTeamsContext);
  const [seg, setSeg] = useState(0);
  const [myTeam, setMyTeam] = useState(null);
  const [opponent, setOpponent] = useState(null);
  const [match, setMatch] = useState(null);
  const [simulating, setSimulating] = useState(false);

  const opponents = getOpponents(14, userTeams);

  const runSimulation = (team1, team2) => {
    const s1 = team1.isUser ? (teamStats[team1.name] || getBaseTeamStats(team1.name)) : team1;
    const s2 = team2.isUser ? (teamStats[team2.name] || getBaseTeamStats(team2.name)) : team2;
    const t1 = teamTraining[team1.name] || {};
    const t2 = teamTraining[team2.name] || {};
    const strength1 = team1.isUser ? getStrength(s1, t1) : getStrength(s1, t1);
    const strength2 = team2.isUser ? getStrength(s2, t2) : getStrength(s2, t2);

    const {homeScore, awayScore, result, matchStats} = simulateMatch(
      {...s1, strength: strength1},
      {...s2, strength: strength2},
    );

    if (team1.isUser) recordMatch(team1.name, team2.name, homeScore, awayScore, result, matchStats);
    if (team2.isUser) {
      const result2 = result === 'win' ? 'loss' : result === 'loss' ? 'win' : 'draw';
      const swapStats = matchStats ? {
        shotsOnTarget: {home: matchStats.shotsOnTarget.away, away: matchStats.shotsOnTarget.home},
        possession: {home: matchStats.possession.away, away: matchStats.possession.home},
        corners: {home: matchStats.corners.away, away: matchStats.corners.home},
        fouls: {home: matchStats.fouls.away, away: matchStats.fouls.home},
        shots: {home: matchStats.shots.away, away: matchStats.shots.home},
        cards: {home: matchStats.cards.away, away: matchStats.cards.home},
      } : null;
      recordMatch(team2.name, team1.name, awayScore, homeScore, result2, swapStats);
    }

    const stats1 = {...s1, strength: strength1, leadership: getLeadership(s1)};
    const stats2 = {...s2, strength: strength2, leadership: getLeadership(s2)};

    setMatch({
      team1: {...team1, stats: stats1},
      team2: {...team2, stats: stats2},
      homeScore,
      awayScore,
      result,
      matchStats,
    });
    setSeg(1);
  };

  const handleSimulateSelected = () => {
    if (!myTeam || !opponent) return;
    setSimulating(true);
    setMatch(null);
    const t1 = {name: myTeam, isUser: true};
    const t2 = opponent;
    setTimeout(() => {
      runSimulation(t1, t2);
      setSimulating(false);
    }, 1200);
  };

  const handleSimulateRandom = () => {
    if (userTeams.length === 0) return;
    setSimulating(true);
    setMatch(null);
    setTimeout(() => {
      const picked = pickRandomMatch(userTeams, teamStats, getBaseTeamStats, getStrength, teamTraining);
      if (!picked) {
        setSimulating(false);
        return;
      }
      runSimulation(picked.team1, picked.team2);
      setSimulating(false);
    }, 1200);
  };

  if (userTeams.length === 0) {
    return (
      <View style={[st.root, {paddingTop: insets.top}]}>
        <View style={st.header}>
          <Text style={st.title}>Play Match</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Account')} style={st.backBtn}>
            <Text style={st.backText}>Add Team</Text>
          </TouchableOpacity>
        </View>
        <View style={st.empty}>
          <Text style={st.emptyTitle}>No teams yet</Text>
          <Text style={st.emptySub}>Add a team in Account to start playing.</Text>
          <TouchableOpacity style={st.ctaBtn} onPress={() => navigation.navigate('Account')}>
            <Text style={st.ctaText}>Add Team</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[st.root, {paddingTop: insets.top}]}>
      <View style={st.header}>
        <Text style={st.title}>Play Match</Text>
      </View>

      <View style={st.segRow}>
        {SEGS.map((s, i) => (
          <TouchableOpacity key={s} style={[st.segItem, seg === i && st.segActive]} onPress={() => setSeg(i)} activeOpacity={1}>
            <Text style={[st.segText, seg === i && st.segTextActive]}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={st.scroll} contentContainerStyle={st.scrollCt}>
        {seg === 0 && (
          <>
            <Text style={st.sectionLabel}>Your team</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={st.chips}>
              {userTeams.map(t => {
                const s = teamStats[t] || getBaseTeamStats(t);
                const tr = teamTraining[t] || {};
                const str = getStrength(s, tr);
                return (
                  <TouchableOpacity
                    key={t}
                    style={[st.chip, myTeam === t && st.chipSel]}
                    onPress={() => setMyTeam(myTeam === t ? null : t)}
                    activeOpacity={0.8}>
                    <TeamInitial teamName={t} size={24} />
                    <Text style={[st.chipText, myTeam === t && st.chipTextSel]} numberOfLines={1}>{t}</Text>
                    <Text style={st.chipStat}>A:{s.attack ?? 0} D:{s.defense ?? 0} F:{s.form ?? 0} · P:{str}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <Text style={st.sectionLabel}>Opponent</Text>
            <View style={st.oppGrid}>
              {opponents.map(o => (
                <TouchableOpacity
                  key={o.name}
                  style={[st.oppCard, opponent?.name === o.name && st.oppCardSel]}
                  onPress={() => setOpponent(opponent?.name === o.name ? null : o)}
                  activeOpacity={0.8}>
                  <TeamInitial teamName={o.name} size={28} />
                  <Text style={[st.oppName, opponent?.name === o.name && st.oppNameSel]} numberOfLines={1}>{o.name}</Text>
                  <Text style={st.oppStat}>A:{o.attack} D:{o.defense} F:{o.form}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[st.simBtn, (!myTeam || !opponent || simulating) && st.simBtnDisabled]}
              onPress={handleSimulateSelected}
              disabled={!myTeam || !opponent || simulating}
              activeOpacity={0.8}>
              {simulating ? <ActivityIndicator color="#fff" /> : <Text style={st.simBtnText}>Simulate Match</Text>}
            </TouchableOpacity>

            <Text style={st.orDivider}>— or —</Text>

            <TouchableOpacity
              style={[st.simBtnAlt, simulating && st.simBtnDisabled]}
              onPress={handleSimulateRandom}
              disabled={simulating}
              activeOpacity={0.8}>
              <Text style={st.simBtnTextAlt}>Random Match</Text>
            </TouchableOpacity>
          </>
        )}

        {seg === 1 && match && (
          <>
            <View style={st.matchCard}>
              <View style={st.scoreRow}>
                <View style={st.scoreTeam}>
                  <TeamInitial teamName={match.team1.name} size={36} />
                  <Text style={st.scoreName} numberOfLines={1}>{match.team1.name}</Text>
                </View>
                <View style={st.scoreCenter}>
                  <Text style={st.scoreText}>{match.homeScore} – {match.awayScore}</Text>
                  <View style={[st.resultBadge, st[`result${match.result}`]]}>
                    <Text style={st.resultText}>
                      {match.result === 'win' ? 'Home Win' : match.result === 'loss' ? 'Away Win' : 'Draw'}
                    </Text>
                  </View>
                </View>
                <View style={st.scoreTeam}>
                  <TeamInitial teamName={match.team2.name} size={36} />
                  <Text style={st.scoreName} numberOfLines={1}>{match.team2.name}</Text>
                </View>
              </View>

              {match.matchStats && (
                <View style={st.statsSection}>
                  <Text style={st.statsTitle}>SHOTS ON TARGET</Text>
                  <View style={st.barChart}>
                    <View style={st.barGroup}>
                      <Text style={st.barLabel}>{match.team1.name}</Text>
                      <View style={st.barTrack}>
                        <View style={[st.barFill, st.barHome, {width: `${Math.min(100, (match.matchStats.shotsOnTarget.home / 15) * 100)}%`}]} />
                      </View>
                      <Text style={st.barVal}>{match.matchStats.shotsOnTarget.home}</Text>
                    </View>
                    <View style={st.barGroup}>
                      <Text style={st.barLabel}>{match.team2.name}</Text>
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
              )}

              <View style={st.cardsRow}>
                <TeamMatchCard
                  team={match.team1}
                  stats={match.team1.stats}
                  strength={match.team1.stats?.strength ?? 50}
                  leadership={match.team1.stats?.leadership ?? 1}
                />
                <TeamMatchCard
                  team={match.team2}
                  stats={match.team2.stats}
                  strength={match.team2.stats?.strength ?? 50}
                  leadership={match.team2.stats?.leadership ?? 1}
                />
              </View>

              <View style={st.matchActions}>
                <TouchableOpacity
                  style={[st.matchActionBtn, st.matchActionPrimary]}
                  onPress={() => {
                    setSimulating(true);
                    setTimeout(() => {
                      runSimulation(match.team1, match.team2);
                      setSimulating(false);
                    }, 800);
                  }}
                  disabled={simulating}
                  activeOpacity={0.8}>
                  <Text style={st.matchActionText}>Rematch</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={st.matchActionBtn}
                  onPress={() => navigation.navigate('TeamTraining')}
                  activeOpacity={0.8}>
                  <Text style={st.matchActionText}>Train</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={st.matchActionBtn}
                  onPress={() => navigation.navigate('TeamStats')}
                  activeOpacity={0.8}>
                  <Text style={st.matchActionText}>Stats</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={st.matchActionBtn}
                  onPress={() => setSeg(0)}
                  activeOpacity={0.8}>
                  <Text style={st.matchActionText}>New Match</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}

        {seg === 1 && !match && (
          <View style={st.emptyMatch}>
            <Text style={st.emptyMatchText}>Simulate a match to see stats</Text>
            <TouchableOpacity style={st.ctaBtn} onPress={() => setSeg(0)}>
              <Text style={st.ctaText}>Select Teams</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  root: {flex: 1, backgroundColor: '#141214'},
  header: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingBottom: 12},
  backBtn: {},
  backText: {color: '#CC342D', fontSize: 16, fontWeight: '600'},
  title: {color: '#F4F3F3', fontSize: 20, fontWeight: '800'},

  segRow: {flexDirection: 'row', paddingHorizontal: 14, marginBottom: 12},
  segItem: {flex: 1, paddingVertical: 10, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent'},
  segActive: {borderBottomColor: '#CC342D'},
  segText: {color: '#B9B6B6', fontSize: 14, fontWeight: '600'},
  segTextActive: {color: '#CC342D'},

  scroll: {flex: 1},
  scrollCt: {paddingHorizontal: 14, paddingBottom: 24},
  sectionLabel: {color: '#B9B6B6', fontSize: 12, fontWeight: '700', marginBottom: 10},
  chips: {marginBottom: 20},
  chip: {width: 110, alignItems: 'center', backgroundColor: '#1B1A1B', borderRadius: 12, padding: 12, marginRight: 10, borderWidth: 1, borderColor: '#2A2325'},
  chipSel: {borderColor: '#CC342D', backgroundColor: 'rgba(204,52,45,0.2)'},
  chipText: {color: '#F4F3F3', fontSize: 12, fontWeight: '600', marginTop: 6},
  chipTextSel: {color: '#CC342D'},
  chipStat: {color: '#666', fontSize: 9, marginTop: 2},
  oppGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20},
  oppCard: {width: '47%', backgroundColor: '#1B1A1B', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#2A2325', alignItems: 'center'},
  oppCardSel: {borderColor: '#CC342D', backgroundColor: 'rgba(204,52,45,0.2)'},
  oppName: {color: '#F4F3F3', fontSize: 14, fontWeight: '700', marginTop: 8},
  oppNameSel: {color: '#CC342D'},
  oppStat: {color: '#666', fontSize: 11, marginTop: 4},
  simBtn: {backgroundColor: '#CC342D', paddingVertical: 16, borderRadius: 14, alignItems: 'center'},
  simBtnDisabled: {opacity: 0.5},
  simBtnText: {color: '#fff', fontSize: 16, fontWeight: '700'},
  orDivider: {color: '#666', fontSize: 12, textAlign: 'center', marginVertical: 16},
  simBtnAlt: {backgroundColor: '#2A2325', paddingVertical: 14, borderRadius: 14, alignItems: 'center', borderWidth: 1, borderColor: '#3A3335'},
  simBtnTextAlt: {color: '#B9B6B6', fontSize: 14, fontWeight: '600'},

  matchCard: {backgroundColor: '#1B1A1B', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#2A2325'},
  scoreRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16},
  scoreTeam: {flex: 1, alignItems: 'center'},
  scoreName: {color: '#F4F3F3', fontSize: 12, fontWeight: '600', marginTop: 6, textAlign: 'center'},
  scoreCenter: {alignItems: 'center', paddingHorizontal: 12},
  scoreText: {color: '#F4F3F3', fontSize: 24, fontWeight: '900'},
  resultBadge: {marginTop: 8, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8},
  resultwin: {backgroundColor: 'rgba(53,208,127,0.3)'},
  resultloss: {backgroundColor: 'rgba(204,52,45,0.3)'},
  resultdraw: {backgroundColor: 'rgba(245,197,66,0.3)'},
  resultText: {color: '#F4F3F3', fontSize: 11, fontWeight: '700'},

  statsSection: {marginBottom: 20},
  statsTitle: {color: '#B9B6B6', fontSize: 11, fontWeight: '700', letterSpacing: 0.5, marginBottom: 10, marginTop: 8},
  barChart: {marginBottom: 16},
  barGroup: {flexDirection: 'row', alignItems: 'center', marginBottom: 8},
  barLabel: {color: '#F4F3F3', fontSize: 12, width: 80},
  barTrack: {flex: 1, height: 20, backgroundColor: '#2A2325', borderRadius: 4, overflow: 'hidden', flexDirection: 'row'},
  barFill: {height: '100%', borderRadius: 4},
  barHome: {backgroundColor: '#CC342D'},
  barAway: {backgroundColor: '#4A5568'},
  barVal: {color: '#F4F3F3', fontSize: 12, fontWeight: '700', width: 24, textAlign: 'right'},

  keyStatRow: {flexDirection: 'row', alignItems: 'center', marginBottom: 8},
  keyStatVal: {color: '#F4F3F3', fontSize: 12, fontWeight: '600', width: 28, textAlign: 'center'},
  keyStatBarWrap: {flex: 1, flexDirection: 'row', height: 8},
  keyStatBarL: {backgroundColor: '#CC342D', borderTopLeftRadius: 4, borderBottomLeftRadius: 4},
  keyStatBarR: {backgroundColor: '#4A5568', borderTopRightRadius: 4, borderBottomRightRadius: 4},
  keyStatLabel: {color: '#B9B6B6', fontSize: 10, width: 70, textAlign: 'center'},

  cardsRow: {flexDirection: 'row', gap: 12},
  teamCard: {flex: 1, backgroundColor: '#141214', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#2A2325'},
  teamHeader: {alignItems: 'center', marginBottom: 12},
  teamName: {color: '#F4F3F3', fontSize: 13, fontWeight: '700', marginTop: 6, textAlign: 'center'},
  powerRow: {flexDirection: 'row', gap: 8, marginTop: 4},
  powerLabel: {color: '#B9B6B6', fontSize: 10, fontWeight: '600'},
  wdlRow: {flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16},
  col: {alignItems: 'center'},
  barBg: {width: 24, height: 56, backgroundColor: '#2A2325', borderRadius: 4, justifyContent: 'flex-end', overflow: 'hidden'},
  barFill: {width: '100%', borderBottomLeftRadius: 4, borderBottomRightRadius: 4, minHeight: 2},
  colLabel: {color: '#B9B6B6', fontSize: 10, fontWeight: '700', marginTop: 4},
  colVal: {color: '#F4F3F3', fontSize: 12, fontWeight: '800'},
  circlesRow: {flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end'},

  matchActions: {flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 16},
  matchActionBtn: {flex: 1, minWidth: 70, paddingVertical: 12, borderRadius: 12, alignItems: 'center', backgroundColor: '#2A2325', borderWidth: 1, borderColor: '#3A3335'},
  matchActionPrimary: {backgroundColor: '#CC342D', borderColor: '#CC342D'},
  matchActionText: {color: '#F4F3F3', fontSize: 13, fontWeight: '700'},
  emptyMatch: {alignItems: 'center', paddingTop: 60},
  emptyMatchText: {color: '#B9B6B6', fontSize: 14, marginBottom: 20},

  empty: {flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80},
  emptyTitle: {color: '#F4F3F3', fontSize: 18, fontWeight: '700', marginBottom: 8},
  emptySub: {color: '#B9B6B6', fontSize: 14, marginBottom: 24},
  ctaBtn: {backgroundColor: '#CC342D', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12},
  ctaText: {color: '#fff', fontSize: 14, fontWeight: '700'},
});
