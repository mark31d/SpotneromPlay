import React, {useState, useContext, useMemo} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Share,
  StyleSheet,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {PredictionCardContext} from '../App';
import TeamInitial from './TeamInitial';
import PlayerAvatar from './PlayerAvatar';
import {LiveBadge} from './DrawnBadge';

/* ── Mock data ── */
const KEY_STATS = [
  {label: 'Possession', home: '62%', away: '38%', homeP: 62},
  {label: 'Corners', home: '7', away: '5', homeP: 58},
  {label: 'Fouls', home: '11', away: '15', homeP: 42},
  {label: 'Shots', home: '14', away: '8', homeP: 64},
  {label: 'Cards', home: '2', away: '3', homeP: 40},
];

const PLAYERS_DATA = [
  {name: 'R. Marquez', pos: 'FW', rating: 8.4, goals: 2, assists: 1, card: 'yellow', avatarIndex: 0},
  {name: 'L. Fischer', pos: 'MF', rating: 7.9, goals: 0, assists: 1, card: null, avatarIndex: 1},
  {name: 'D. Okafor', pos: 'DF', rating: 7.2, goals: 0, assists: 0, card: 'red', avatarIndex: 2},
  {name: 'K. Tanaka', pos: 'FW', rating: 7.8, goals: 1, assists: 0, card: null, avatarIndex: 3},
  {name: 'J. Petrov', pos: 'MF', rating: 7.0, goals: 0, assists: 2, card: 'yellow', avatarIndex: 4},
  {name: 'M. Santos', pos: 'GK', rating: 6.8, goals: 0, assists: 0, card: null, avatarIndex: 5},
];

const H2H_DATA = [
  {date: '2025-12-01', home: 1, away: 2},
  {date: '2025-09-15', home: 3, away: 1},
  {date: '2025-05-20', home: 0, away: 0},
];


const SEGS = ['Stats', 'Lineups', 'H2H', 'Markets'];

export default function MatchDetailsScreen({route, navigation}) {
  const {match} = route.params;
  const insets = useSafeAreaInsets();
  const {selections, addSelection} = useContext(PredictionCardContext);

  const [seg, setSeg] = useState(0);
  const [fav, setFav] = useState(false);
  const [sortKey, setSortKey] = useState('rating');
  const [quickMarket, setQuickMarket] = useState(0);

  const selCount = selections.length;

  const isSelected = (matchId, market, pick) =>
    selections.some(s => s.matchId === matchId && s.market === market && s.pickLabel === pick);

  const handleOdd = (market, pick, val) => {
    addSelection(match.id, market, pick, val, `${match.homeName} vs ${match.awayName}`);
  };

  const sortedPlayers = useMemo(() => {
    return [...PLAYERS_DATA].sort((a, b) => {
      if (sortKey === 'rating') return b.rating - a.rating;
      if (sortKey === 'goals') return b.goals - a.goals;
      if (sortKey === 'cards') return (b.card ? 1 : 0) - (a.card ? 1 : 0);
      return 0;
    });
  }, [sortKey]);

  const handleSeg = i => {
    if (i === 3) {
      navigation.navigate('Markets', {preselectMatchId: match.id});
    } else {
      setSeg(i);
    }
  };

  const handleShare = async () => {
    try {
      const msg = `${match.homeName} vs ${match.awayName} ${match.homeScore}–${match.awayScore} | ${match.league} | Spotnerom Play`;
      await Share.share({
        message: msg,
        title: 'Match',
      });
    } catch (_) {}
  };

  return (
    <View style={[st.root, {paddingTop: insets.top}]}>
      {/* Header */}
      <View style={st.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={st.backBtn}>
          <Image source={require('../assets/ic_back.png')} style={st.icSm} resizeMode="contain" />
          <Text style={st.backText}>Back</Text>
        </TouchableOpacity>
        <View style={st.headerActions}>
          <TouchableOpacity style={st.actBtn} onPress={() => setFav(!fav)}>
            <Image
              source={require('../assets/ic_star.png')}
              style={[st.icSm, fav && {tintColor: '#CC342D'}]}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <TouchableOpacity style={st.actBtn} onPress={handleShare}>
            <Image source={require('../assets/ic_share.png')} style={st.icSm} resizeMode="contain" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Hero */}
      <View style={st.liveInfo}>
        <LiveBadge size={22} />
        <Text style={st.timer}>{(match.minute || 73)}'</Text>
      </View>
      <View style={st.hero}>
        <View style={st.heroTeam}>
          <TeamInitial teamName={match.homeName} size={42} />
          <Text style={st.heroName}>{match.homeName}</Text>
        </View>
        <Text style={st.heroScore}>{match.homeScore} – {match.awayScore}</Text>
        <View style={st.heroTeam}>
          <TeamInitial teamName={match.awayName} size={42} />
          <Text style={st.heroName}>{match.awayName}</Text>
        </View>
      </View>

      {/* Segments */}
      <View style={st.segRow}>
        {SEGS.map((s2, i) => (
          <TouchableOpacity key={s2} style={[st.segItem, seg === i && st.segActive]} onPress={() => handleSeg(i)} activeOpacity={1}>
            <Text style={[st.segText, seg === i && st.segTextActive]}>{s2}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView style={st.scroll} contentContainerStyle={st.scrollCt}>
        {seg === 0 && (
          <>
            {/* Win Probability */}
            <View style={st.chartCard}>
              <Text style={st.chartTitle}>WIN PROBABILITY</Text>
              <View style={st.wpBar}>
                <View style={[st.wpHome, {flex: match.pct1 || 40}]}>
                  <Text style={st.wpLabel}>{match.pct1 || 40}%</Text>
                </View>
                <View style={[st.wpDraw, {flex: match.pctX || 30}]}>
                  <Text style={st.wpLabelDark}>{match.pctX || 30}%</Text>
                </View>
                <View style={[st.wpAway, {flex: match.pct2 || 30}]}>
                  <Text style={st.wpLabel}>{match.pct2 || 30}%</Text>
                </View>
              </View>
              <View style={st.wpLegend}>
                <View style={st.legendItem}><View style={[st.legendDot, {backgroundColor: '#CC342D'}]} /><Text style={st.legendText}>{match.homeName}</Text></View>
                <View style={st.legendItem}><View style={[st.legendDot, {backgroundColor: '#555'}]} /><Text style={st.legendText}>Draw</Text></View>
                <View style={st.legendItem}><View style={[st.legendDot, {backgroundColor: '#B9B6B6'}]} /><Text style={st.legendText}>{match.awayName}</Text></View>
              </View>
            </View>

            {/* Shots on Target */}
            <View style={st.chartCard}>
              <Text style={st.chartTitle}>SHOTS ON TARGET</Text>
              <View style={st.barChart}>
                <View style={st.barGroup}>
                  <Text style={st.barLabel}>Home</Text>
                  <View style={st.barTrack}>
                    <View style={[st.barFill, st.barHome, {width: '72%'}]} />
                  </View>
                  <Text style={st.barVal}>8</Text>
                </View>
                <View style={st.barGroup}>
                  <Text style={st.barLabel}>Away</Text>
                  <View style={st.barTrack}>
                    <View style={[st.barFill, st.barAway, {width: '45%'}]} />
                  </View>
                  <Text style={st.barVal}>5</Text>
                </View>
              </View>
            </View>

            {/* Key Stats */}
            <View style={st.statsCard}>
              <Text style={st.chartTitle}>KEY STATS</Text>
              {KEY_STATS.map((s2, i) => (
                <View key={i} style={st.statRow}>
                  <Text style={st.statValL}>{s2.home}</Text>
                  <View style={st.statBarWrap}>
                    <View style={[st.statBarL, {flex: s2.homeP}]} />
                    <View style={[st.statBarR, {flex: 100 - s2.homeP}]} />
                  </View>
                  <Text style={st.statName}>{s2.label}</Text>
                  <View style={st.statBarWrap}>
                    <View style={[st.statBarR, {flex: s2.homeP}]} />
                    <View style={[st.statBarL, {flex: 100 - s2.homeP}]} />
                  </View>
                  <Text style={st.statValR}>{s2.away}</Text>
                </View>
              ))}
            </View>

            {/* Players */}
            <View style={st.statsCard}>
              <Text style={st.chartTitle}>PLAYERS</Text>
              <View style={st.tblHeader}>
                <Text style={[st.th, {flex: 2.5}]}>Player</Text>
                <Text style={st.th}>Pos</Text>
                <TouchableOpacity onPress={() => setSortKey('rating')} style={st.thBtn} activeOpacity={1}>
                  <Text style={[st.th, sortKey === 'rating' && {color: '#CC342D'}]}>Rating</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setSortKey('goals')} style={st.thBtn} activeOpacity={1}>
                  <Text style={[st.th, sortKey === 'goals' && {color: '#CC342D'}]}>G</Text>
                </TouchableOpacity>
                <Text style={st.th}>A</Text>
                <TouchableOpacity onPress={() => setSortKey('cards')} style={st.thBtn} activeOpacity={1}>
                  <Text style={[st.th, sortKey === 'cards' && {color: '#CC342D'}]}>Cards</Text>
                </TouchableOpacity>
              </View>
              {sortedPlayers.map((p, i) => (
                <View key={i} style={st.tblRow}>
                  <View style={[st.playerCell, {flex: 2.5}]}>
                    <PlayerAvatar playerName={p.name} size={20} />
                    <Text style={st.playerName}>{p.name}</Text>
                  </View>
                  <Text style={st.td}>{p.pos}</Text>
                  <Text style={[st.td, p.rating >= 7.5 && {color: '#35D07F', fontWeight: '700'}]}>{p.rating}</Text>
                  <Text style={st.td}>{p.goals}</Text>
                  <Text style={st.td}>{p.assists}</Text>
                  <View style={st.tdCards}>
                    {p.card === 'yellow' && <View style={[st.cardIcon, {backgroundColor: '#F5C542'}]} />}
                    {p.card === 'red' && <View style={[st.cardIcon, {backgroundColor: '#CC342D'}]} />}
                    {!p.card && <Text style={st.td}>–</Text>}
                  </View>
                </View>
              ))}
            </View>

            {/* Quick Markets */}
            <View style={st.statsCard}>
              <Text style={st.chartTitle}>QUICK PICKS</Text>
              <View style={st.qmTabs}>
                {['1X2', 'O/U', 'BTTS'].map((mk, i) => (
                  <TouchableOpacity key={mk} style={[st.qmTab, quickMarket === i && st.qmTabActive]} onPress={() => setQuickMarket(i)} activeOpacity={1}>
                    <Text style={[st.qmTabText, quickMarket === i && {color: '#fff'}]}>{mk}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={st.qmPicks}>
                {(match.markets?.[['1X2', 'O/U', 'BTTS'][quickMarket]]?.picks || []).map((p, i) => {
                  const mk = ['1X2', 'O/U', 'BTTS'][quickMarket];
                  const display = mk === '1X2' ? (p.l === 'Win' ? match.homeName : p.l === 'Lose' ? match.awayName : 'Draw') : p.l;
                  return (
                  <TouchableOpacity
                    key={i}
                    style={[st.qmPill, isSelected(match.id, mk, p.l) && st.qmPillSel]}
                    onPress={() => handleOdd(mk, p.l, p.v)}
                    activeOpacity={1}>
                    <Text style={[st.qmPillLabel, isSelected(match.id, mk, p.l) && {color: '#fff'}]} numberOfLines={1}>{display}</Text>
                    <Text style={[st.qmPillVal, isSelected(match.id, mk, p.l) && {color: '#fff'}]}>{p.v}%</Text>
                  </TouchableOpacity>
                );})}
              </View>
            </View>
          </>
        )}

        {seg === 1 && (
          <View style={st.statsCard}>
            <Text style={st.chartTitle}>LINEUPS</Text>
            {PLAYERS_DATA.map((p, i) => (
              <View key={i} style={st.lineupRow}>
                <PlayerAvatar playerName={p.name} size={28} />
                <View style={{flex: 1, marginLeft: 10}}>
                  <Text style={st.lineupName}>{p.name}</Text>
                  <Text style={st.lineupPos}>{p.pos}</Text>
                </View>
                <Text style={st.lineupRating}>{p.rating}</Text>
              </View>
            ))}
          </View>
        )}

        {seg === 2 && (
          <View style={st.statsCard}>
            <Text style={st.chartTitle}>HEAD TO HEAD</Text>
            {H2H_DATA.map((h, i) => (
              <View key={i} style={st.h2hRow}>
                <Text style={st.h2hDate}>{h.date}</Text>
                <View style={st.h2hScore}>
                  <Text style={st.h2hTeam}>{match.homeName}</Text>
                  <Text style={st.h2hResult}>{h.home} – {h.away}</Text>
                  <Text style={st.h2hTeam}>{match.awayName}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Sticky Prediction Card */}
      <View style={[st.stickyPc, {paddingBottom: insets.bottom || 16}]}>
        <View>
          <Text style={st.pcInfo}>{selCount} Pick{selCount !== 1 ? 's' : ''}</Text>
        </View>
        <TouchableOpacity style={st.pcBtn} onPress={() => navigation.navigate('PredictionCard')}>
          <Text style={st.pcBtnText}>Open Prediction Card</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const st = StyleSheet.create({
  root: {flex: 1, backgroundColor: '#141214'},
  headerBar: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingBottom: 4},
  backBtn: {flexDirection: 'row', alignItems: 'center', gap: 4},
  backText: {color: '#B9B6B6', fontSize: 12, fontWeight: '500'},
  icSm: {width: 18, height: 18, tintColor: '#FFFFFF'},
  headerActions: {flexDirection: 'row', gap: 10},
  actBtn: {width: 32, height: 32, borderRadius: 16, backgroundColor: '#1B1A1B', borderWidth: 1, borderColor: '#2A2325', alignItems: 'center', justifyContent: 'center'},

  liveInfo: {flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 4},
  timer: {fontSize: 12, color: '#B9B6B6', fontWeight: '600'},
  hero: {flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 14, paddingVertical: 8, marginHorizontal: 14, borderRadius: 16, marginBottom: 6, backgroundColor: 'rgba(83,11,20,0.15)'},
  heroTeam: {alignItems: 'center', gap: 4, width: 70},
  heroName: {fontSize: 10, fontWeight: '600', color: '#F4F3F3', textAlign: 'center'},
  heroScore: {fontSize: 32, fontWeight: '900', color: '#F4F3F3', letterSpacing: 4},

  segRow: {flexDirection: 'row', marginHorizontal: 14, backgroundColor: '#1B1A1B', borderRadius: 10, padding: 2, borderWidth: 1, borderColor: '#2A2325', marginBottom: 6},
  segItem: {flex: 1, paddingVertical: 6, borderRadius: 8, alignItems: 'center'},
  segActive: {backgroundColor: '#CC342D'},
  segText: {fontSize: 10, fontWeight: '600', color: '#B9B6B6'},
  segTextActive: {color: '#fff'},

  scroll: {flex: 1},
  scrollCt: {paddingHorizontal: 12, paddingBottom: 12, gap: 8},

  chartCard: {backgroundColor: '#1B1A1B', borderRadius: 14, padding: 10, borderWidth: 1, borderColor: '#2A2325'},
  chartTitle: {fontSize: 10, fontWeight: '700', color: '#F4F3F3', letterSpacing: 0.5, marginBottom: 4},

  wpBar: {flexDirection: 'row', height: 28, borderRadius: 8, overflow: 'hidden', marginBottom: 8},
  wpHome: {backgroundColor: '#CC342D', justifyContent: 'center', alignItems: 'center'},
  wpDraw: {backgroundColor: '#444', justifyContent: 'center', alignItems: 'center'},
  wpAway: {backgroundColor: '#B9B6B6', justifyContent: 'center', alignItems: 'center'},
  wpLabel: {color: '#fff', fontSize: 10, fontWeight: '700'},
  wpLabelDark: {color: '#ddd', fontSize: 10, fontWeight: '700'},
  wpLegend: {flexDirection: 'row', justifyContent: 'center', gap: 16},
  legendItem: {flexDirection: 'row', alignItems: 'center', gap: 4},
  legendDot: {width: 8, height: 8, borderRadius: 4},
  legendText: {color: '#B9B6B6', fontSize: 9},

  barChart: {gap: 10},
  barGroup: {flexDirection: 'row', alignItems: 'center', gap: 8},
  barLabel: {color: '#B9B6B6', fontSize: 10, width: 40},
  barTrack: {flex: 1, height: 16, backgroundColor: '#2A2325', borderRadius: 4, overflow: 'hidden'},
  barFill: {height: '100%', borderRadius: 4},
  barHome: {backgroundColor: '#CC342D'},
  barAway: {backgroundColor: '#B9B6B6', opacity: 0.5},
  barVal: {color: '#F4F3F3', fontSize: 11, fontWeight: '700', width: 20, textAlign: 'right'},

  statsCard: {backgroundColor: '#1B1A1B', borderRadius: 14, padding: 10, borderWidth: 1, borderColor: '#2A2325'},
  statRow: {flexDirection: 'row', alignItems: 'center', paddingVertical: 4, borderBottomWidth: 0.5, borderBottomColor: 'rgba(42,35,37,0.5)'},
  statValL: {fontSize: 10, fontWeight: '700', color: '#F4F3F3', width: 30, textAlign: 'left'},
  statValR: {fontSize: 10, fontWeight: '700', color: '#F4F3F3', width: 30, textAlign: 'right'},
  statName: {fontSize: 9, color: '#B9B6B6', fontWeight: '500', textAlign: 'center', flex: 1},
  statBarWrap: {flexDirection: 'row', flex: 1, gap: 1, marginHorizontal: 4},
  statBarL: {height: 3, borderRadius: 2, backgroundColor: '#CC342D'},
  statBarR: {height: 3, borderRadius: 2, backgroundColor: '#444'},

  tblHeader: {flexDirection: 'row', paddingBottom: 4, borderBottomWidth: 1, borderBottomColor: '#2A2325'},
  th: {fontSize: 9, color: '#B9B6B6', fontWeight: '600', flex: 1, textAlign: 'center'},
  thBtn: {flex: 1},
  tblRow: {flexDirection: 'row', alignItems: 'center', paddingVertical: 4, borderBottomWidth: 0.5, borderBottomColor: 'rgba(42,35,37,0.3)'},
  playerCell: {flexDirection: 'row', alignItems: 'center', gap: 5},
  playerName: {fontSize: 9, color: '#F4F3F3', fontWeight: '500'},
  td: {fontSize: 9, color: '#F4F3F3', flex: 1, textAlign: 'center'},
  tdCards: {flex: 1, alignItems: 'center'},
  cardIcon: {width: 7, height: 10, borderRadius: 1},

  qmTabs: {flexDirection: 'row', gap: 6, marginBottom: 10},
  qmTab: {paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8, backgroundColor: '#222022', borderWidth: 1, borderColor: '#2A2325'},
  qmTabActive: {backgroundColor: '#CC342D', borderColor: '#CC342D'},
  qmTabText: {fontSize: 10, fontWeight: '600', color: '#B9B6B6'},
  qmPicks: {flexDirection: 'row', gap: 8},
  qmPill: {flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 10, backgroundColor: 'rgba(42,35,37,0.8)', borderWidth: 1, borderColor: '#2A2325'},
  qmPillSel: {backgroundColor: '#CC342D', borderColor: '#CC342D'},
  qmPillLabel: {fontSize: 10, color: '#B9B6B6', fontWeight: '600'},
  qmPillVal: {fontSize: 12, color: '#F4F3F3', fontWeight: '700', marginTop: 2},

  lineupRow: {flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#2A2325'},
  lineupName: {color: '#F4F3F3', fontSize: 13, fontWeight: '600'},
  lineupPos: {color: '#B9B6B6', fontSize: 11},
  lineupRating: {color: '#35D07F', fontSize: 14, fontWeight: '700'},

  h2hRow: {paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#2A2325'},
  h2hDate: {color: '#B9B6B6', fontSize: 10, marginBottom: 4},
  h2hScore: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  h2hTeam: {color: '#F4F3F3', fontSize: 12, fontWeight: '600', flex: 1},
  h2hResult: {color: '#F4F3F3', fontSize: 18, fontWeight: '800', letterSpacing: 2},

  stickyPc: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#1B1A1B', borderTopWidth: 1, borderTopColor: '#2A2325', paddingHorizontal: 14, paddingTop: 8},
  pcInfo: {color: '#F4F3F3', fontSize: 12, fontWeight: '600'},
  pcMultiplier: {color: '#B9B6B6', fontSize: 10, marginTop: 1},
  pcBtn: {backgroundColor: '#AF1E20', paddingHorizontal: 20, paddingVertical: 9, borderRadius: 10, shadowColor: '#AF1E20', shadowOpacity: 0.3, shadowRadius: 10, elevation: 4},
  pcBtnText: {color: '#fff', fontSize: 12, fontWeight: '700'},
});
