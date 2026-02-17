import React, {useState, useContext, useMemo} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  FlatList,
  Share,
  StyleSheet,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {BetslipContext, BetsContext, MatchesContext} from '../App';
import TeamInitial from './TeamInitial';
import PlayerAvatar from './PlayerAvatar';
import {LiveBadge, MoreDotsIcon, PlusIcon, SortIndicator} from './DrawnBadge';
import ConfirmModal from './ConfirmModal';

/* ── Sprite helper (nav only) ── */
const NAV_SHEET = {src: require('../assets/nav_icons.png'), cols: 5, rows: 1};
function NavSprite({index, size = 28}) {
  const col = index % NAV_SHEET.cols;
  return (
    <View style={{width: size, height: size, overflow: 'hidden'}}>
      <Image
        source={NAV_SHEET.src}
        style={{position: 'absolute', width: NAV_SHEET.cols * size, height: size, left: -col * size, top: 0}}
        resizeMode="stretch"
      />
    </View>
  );
}

const PLAYERS = [
  {name: 'R. Marquez', avatarIndex: 0, goals: 2, assists: 1, shots: 5, card: 'yellow'},
  {name: 'K. Tanaka', avatarIndex: 1, goals: 1, assists: 0, shots: 3, card: null},
  {name: 'D. Okafor', avatarIndex: 2, goals: 0, assists: 0, shots: 1, card: 'red'},
];

const TABS = ['Live', 'Top', 'Today', 'Odds'];
const CHIPS = ['Football', 'Tennis', 'Basketball', 'Esports'];

const NAV_ITEMS = [
  {label: 'Home', idx: 0, route: 'MainMenu'},
  {label: 'Sports', idx: 1, route: 'OddsMarkets'},
  {label: '', idx: 2, route: 'Betslip', center: true},
  {label: 'My Bets', idx: 3, route: 'MyBets'},
  {label: 'Account', idx: 4, route: 'Account'},
];

export default function LiveMatchesScreen({navigation}) {
  const insets = useSafeAreaInsets();
  const {matches, refreshMatches} = useContext(MatchesContext);
  const {selections, addSelection} = useContext(BetslipContext);

  const [activeTab, setActiveTab] = useState(0);
  const [activeChip, setActiveChip] = useState(0);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifVisible, setNotifVisible] = useState(false);
  const [moreVisible, setMoreVisible] = useState(false);
  const [moreMatch, setMoreMatch] = useState(null);
  const [feedbackModal, setFeedbackModal] = useState(null);
  const [favorites, setFavorites] = useState({});
  const [playerSort, setPlayerSort] = useState('goals');

  const displayMatches = useMemo(() => {
    let list = [...matches];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        m =>
          m.homeName.toLowerCase().includes(q) ||
          m.awayName.toLowerCase().includes(q),
      );
    }
    if (activeTab === 1) {
      list.sort((a, b) => b.homeScore + b.awayScore - (a.homeScore + a.awayScore));
    }
    if (activeTab === 2) {
      list = list.map(m => ({...m, minute: null, period: '19:30'}));
    }
    return list;
  }, [matches, activeTab, searchQuery]);

  const isSelected = (matchId, pick) =>
    selections.some(
      s => s.matchId === matchId && s.market === '1X2' && s.pickLabel === pick,
    );

  const handleOdd = (match, pick, odd) => {
    const ml = `${match.homeName} vs ${match.awayName}`;
    addSelection(match.id, '1X2', pick, odd, ml);
  };

  const handlePlus = match => {
    if (!isSelected(match.id, '1') && !isSelected(match.id, 'X') && !isSelected(match.id, '2')) {
      const picks = [
        {label: '1', odd: match.odds1},
        {label: 'X', odd: match.oddsX},
        {label: '2', odd: match.odds2},
      ];
      const lucky = picks[Math.floor(Math.random() * picks.length)];
      handleOdd(match, lucky.label, lucky.odd);
    }
  };

  const sortedPlayers = useMemo(() => {
    return [...PLAYERS].sort((a, b) => {
      if (playerSort === 'goals') return b.goals - a.goals;
      if (playerSort === 'shots') return b.shots - a.shots;
      return 0;
    });
  }, [playerSort]);

  const {totalPoints} = useContext(BetsContext);

  const onNav = n => {
    if (n.route) navigation.navigate(n.route);
  };

  const onTab = i => {
    if (i === 3) {
      navigation.navigate('OddsMarkets');
    } else {
      setActiveTab(i);
    }
  };

  return (
    <View style={[st.root, {paddingTop: insets.top}]}>
      {/* Top Bar */}
      <View style={st.topBar}>
        <TouchableOpacity onPress={() => navigation.navigate('MainMenu')} style={st.topBarLeft}>
          <Image source={require('../assets/logo_sportera_play.png')} style={st.topLogo} resizeMode="contain" />
        </TouchableOpacity>
        <View style={st.topBarRight}>
          <View style={st.balancePill}>
            <Text style={st.balanceText}>{totalPoints.toLocaleString()} pts</Text>
          </View>
          <TouchableOpacity style={st.iconBtn} onPress={() => setNotifVisible(true)}>
            <Image source={require('../assets/ic_bell.png')} style={st.iconImg} resizeMode="contain" />
            <View style={st.redDot} />
          </TouchableOpacity>
          <TouchableOpacity style={st.iconBtn} onPress={() => setSearchVisible(true)}>
            <Image source={require('../assets/ic_search.png')} style={st.iconImg} resizeMode="contain" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View style={st.tabsRow}>
        {TABS.map((t, i) => (
          <TouchableOpacity key={t} onPress={() => onTab(i)} style={st.tab}>
            <Text style={[st.tabText, activeTab === i && st.tabTextActive]}>{t}</Text>
            {activeTab === i && <View style={st.tabLine} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* Chips + Refresh */}
      <View style={st.chipsRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={st.chipsScroll} contentContainerStyle={st.chipsCt}>
        {CHIPS.map((c, i) => (
          <TouchableOpacity
            key={c}
            style={[st.chip, activeChip === i && st.chipActive]}
            onPress={() => setActiveChip(i)}>
            <Text style={[st.chipText, activeChip === i && st.chipTextActive]}>{c}</Text>
          </TouchableOpacity>
        ))}
        </ScrollView>
        <TouchableOpacity onPress={refreshMatches} style={st.refreshChip}>
          <Text style={st.refreshChipText}>New</Text>
        </TouchableOpacity>
      </View>

      {/* Matches + Players */}
      <ScrollView style={st.scroll} contentContainerStyle={st.scrollCt}>
        {displayMatches.map(match => (
          <TouchableOpacity
            key={match.id}
            style={st.card}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('MatchDetails', {match})}>
            {/* Header */}
            <View style={st.cardHeader}>
              {match.minute !== null ? (
                <>
                  <LiveBadge size={20} />
                  <Text style={st.minute}>{match.minute}'</Text>
                </>
              ) : null}
              <Text style={st.period}>{match.period}</Text>
              <View style={{flex: 1}} />
              <TouchableOpacity
                onPress={e => {
                  e.stopPropagation?.();
                  setMoreMatch(match);
                  setMoreVisible(true);
                }}>
                <MoreDotsIcon size={20} />
              </TouchableOpacity>
            </View>

            {/* Teams + Score */}
            <View style={st.teamsRow}>
              <View style={st.teamSide}>
                <TeamInitial teamName={match.homeName} size={28} />
                <Text style={st.teamName}>{match.homeName}</Text>
              </View>
              <Text style={st.score}>{match.homeScore} – {match.awayScore}</Text>
              <View style={[st.teamSide, st.teamAway]}>
                <Text style={st.teamName}>{match.awayName}</Text>
                <TeamInitial teamName={match.awayName} size={28} />
              </View>
            </View>

            {/* Momentum */}
            <View style={st.momentumBar}>
              <View style={[st.momHome, {flex: match.momentum}]} />
              <View style={[st.momAway, {flex: 100 - match.momentum}]} />
            </View>

            {/* Odds */}
            <View style={st.oddsRow}>
              {[
                {label: '1', val: match.odds1},
                {label: 'X', val: match.oddsX},
                {label: '2', val: match.odds2},
              ].map(o => (
                <TouchableOpacity
                  key={o.label}
                  style={[st.oddPill, isSelected(match.id, o.label) && st.oddPillSel]}
                  onPress={e => {
                    e.stopPropagation?.();
                    handleOdd(match, o.label, o.val);
                  }}>
                  <Text style={[st.oddLabel, isSelected(match.id, o.label) && {color: '#fff'}]}>{o.label}</Text>
                  <Text style={[st.oddVal, isSelected(match.id, o.label) && {color: '#fff'}]}> {o.val.toFixed(2)}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={st.plusBtn}
                onPress={e => {
                  e.stopPropagation?.();
                  handlePlus(match);
                }}>
                <PlusIcon size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}

        {/* Top Players */}
        <View style={st.playerCard}>
          <Text style={st.playerTitle}>TOP PLAYERS</Text>
          <View style={st.playerHeaderRow}>
            <Text style={[st.ph, {flex: 2}]}>Player</Text>
            <TouchableOpacity onPress={() => setPlayerSort('goals')} style={st.phBtn}>
              <Text style={st.ph}>G</Text>
              {playerSort === 'goals' && <SortIndicator size={10} />}
            </TouchableOpacity>
            <Text style={st.ph}>A</Text>
            <TouchableOpacity onPress={() => setPlayerSort('shots')} style={st.phBtn}>
              <Text style={st.ph}>Shots</Text>
              {playerSort === 'shots' && <SortIndicator size={10} />}
            </TouchableOpacity>
            <Text style={st.ph}>Cards</Text>
          </View>
          {sortedPlayers.map((p, i) => (
            <View key={i} style={st.playerRow}>
              <View style={[st.playerCell, {flex: 2}]}>
                <PlayerAvatar playerName={p.name} size={20} />
                <Text style={st.playerName}>{p.name}</Text>
              </View>
              <Text style={st.pv}>{p.goals}</Text>
              <Text style={st.pv}>{p.assists}</Text>
              <Text style={st.pv}>{p.shots}</Text>
              <View style={st.cardIconWrap}>
                {p.card === 'yellow' && <View style={[st.cardIcon, {backgroundColor: '#F5C542'}]} />}
                {p.card === 'red' && <View style={[st.cardIcon, {backgroundColor: '#CC342D'}]} />}
                {!p.card && <Text style={st.pv}>–</Text>}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Nav */}
      <View style={[st.bottomNav, {paddingBottom: insets.bottom || 16}]}>
        {NAV_ITEMS.map((n, i) =>
          n.center ? (
            <TouchableOpacity key={i} style={st.navCenter} onPress={() => onNav(n)}>
              <NavSprite index={2} size={28} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity key={i} style={st.navItem} onPress={() => onNav(n)}>
              <NavSprite index={n.idx} size={28} />
              <Text style={[st.navLabel, n.label === 'Sports' && st.navLabelActive]}>{n.label}</Text>
            </TouchableOpacity>
          ),
        )}
      </View>

      {/* Search Modal */}
      <Modal visible={searchVisible} transparent animationType="slide">
        <View style={st.modalOverlay}>
          <View style={st.modalBox}>
            <View style={st.modalHeader}>
              <Text style={st.modalTitle}>Search</Text>
              <TouchableOpacity onPress={() => {setSearchVisible(false); setSearchQuery('');}}>
                <Text style={st.modalClose}>Close</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={st.searchInput}
              placeholder="Search teams..."
              placeholderTextColor="#666"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            <FlatList
              data={displayMatches}
              keyExtractor={m => m.id}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={st.searchRow}
                  onPress={() => {
                    setSearchVisible(false);
                    setSearchQuery('');
                    navigation.navigate('MatchDetails', {match: item});
                  }}>
                  <Text style={st.searchRowText}>{item.homeName} vs {item.awayName}</Text>
                  <Text style={st.searchRowSub}>{item.homeScore} – {item.awayScore}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Notifications Modal */}
      <Modal visible={notifVisible} transparent animationType="slide">
        <View style={st.modalOverlay}>
          <View style={st.modalBox}>
            <View style={st.modalHeader}>
              <Text style={st.modalTitle}>Notifications</Text>
              <TouchableOpacity onPress={() => setNotifVisible(false)}>
                <Text style={st.modalClose}>Close</Text>
              </TouchableOpacity>
            </View>
            {['Goal scored! Atlas City 2-1', 'Match starting: Nova United vs Zenith SC', 'Final whistle approaching: Solar Kings'].map((n, i) => (
              <View key={i} style={st.notifRow}>
                <View style={st.notifDot} />
                <Text style={st.notifText}>{n}</Text>
              </View>
            ))}
          </View>
        </View>
      </Modal>

      {/* More Actions Modal */}
      <Modal visible={moreVisible} transparent animationType="fade">
        <TouchableOpacity style={st.modalOverlay} activeOpacity={1} onPress={() => setMoreVisible(false)}>
          <View style={st.moreBox}>
            <TouchableOpacity
              style={st.moreRow}
              onPress={() => {
                if (moreMatch) setFavorites(f => ({...f, [moreMatch.id]: !f[moreMatch.id]}));
                setMoreVisible(false);
              }}>
              <Text style={st.moreText}>{moreMatch && favorites[moreMatch.id] ? '★ Unfavorite' : '☆ Favorite'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={st.moreRow} onPress={() => {
              setMoreVisible(false);
              if (moreMatch) {
                const msg = `${moreMatch.homeName} vs ${moreMatch.awayName} ${moreMatch.homeScore}–${moreMatch.awayScore} | ${moreMatch.league} | Spotnerom Play`;
                Share.share({message: msg, title: 'Match'}).catch(() => {});
              }
            }}>
              <Text style={st.moreText}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity style={st.moreRow} onPress={() => { setMoreVisible(false); setFeedbackModal({title: 'Pinned', message: 'Match pinned to favorites.'}); }}>
              <Text style={st.moreText}>Pin</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {feedbackModal && (
        <ConfirmModal
          visible={!!feedbackModal}
          title={feedbackModal.title}
          message={feedbackModal.message}
          onClose={() => setFeedbackModal(null)}
        />
      )}
    </View>
  );
}

const st = StyleSheet.create({
  root: {flex: 1, backgroundColor: '#141214'},
  topBar: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingBottom: 6},
  topBarLeft: {flexDirection: 'row', alignItems: 'center'},
  topLogo: {width: 120, height: 32},
  topBarRight: {flexDirection: 'row', alignItems: 'center', gap: 8},
  balancePill: {backgroundColor: '#1B1A1B', borderWidth: 1, borderColor: '#2A2325', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4},
  balanceText: {color: '#35D07F', fontSize: 11, fontWeight: '700'},
  iconBtn: {width: 34, height: 34, borderRadius: 17, backgroundColor: '#1B1A1B', borderWidth: 1, borderColor: '#2A2325', alignItems: 'center', justifyContent: 'center'},
  iconImg: {width: 18, height: 18, tintColor: '#FFFFFF'},
  redDot: {position: 'absolute', top: -1, right: -1, width: 8, height: 8, borderRadius: 4, backgroundColor: '#CC342D', borderWidth: 1.5, borderColor: '#141214'},

  tabsRow: {flexDirection: 'row', paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: '#2A2325'},
  tab: {marginRight: 20, paddingVertical: 8},
  tabText: {fontSize: 12, fontWeight: '600', color: '#B9B6B6'},
  tabTextActive: {color: '#F4F3F3'},
  tabLine: {position: 'absolute', bottom: -1, left: 0, right: 0, height: 2, backgroundColor: '#CC342D', borderRadius: 1},

  chipsRow: {flexDirection: 'row', alignItems: 'center', paddingRight: 14},
  chipsScroll: {flexGrow: 0, flex: 1},
  chipsCt: {paddingHorizontal: 14, gap: 8, paddingVertical: 10},
  refreshChip: {paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#CC342D', borderRadius: 20, marginLeft: 8},
  refreshChipText: {color: '#fff', fontSize: 11, fontWeight: '700'},
  chip: {paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, backgroundColor: '#1B1A1B', borderWidth: 1, borderColor: '#2A2325'},
  chipActive: {backgroundColor: '#CC342D', borderColor: '#CC342D'},
  chipText: {fontSize: 10, fontWeight: '600', color: '#B9B6B6'},
  chipTextActive: {color: '#fff'},

  scroll: {flex: 1},
  scrollCt: {paddingHorizontal: 12, paddingBottom: 12, gap: 8},

  card: {backgroundColor: '#1B1A1B', borderRadius: 16, padding: 10, borderWidth: 1, borderColor: '#2A2325'},
  cardHeader: {flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6},
  minute: {fontSize: 10, color: '#B9B6B6', fontWeight: '600'},
  period: {fontSize: 9, color: 'rgba(185,182,182,0.6)'},

  teamsRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6},
  teamSide: {flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1},
  teamAway: {justifyContent: 'flex-end'},
  teamName: {fontSize: 11, fontWeight: '600', color: '#F4F3F3'},
  score: {fontSize: 20, fontWeight: '800', color: '#F4F3F3', minWidth: 56, textAlign: 'center', letterSpacing: 2},

  momentumBar: {flexDirection: 'row', height: 3, borderRadius: 2, overflow: 'hidden', marginBottom: 8, backgroundColor: '#2A2325'},
  momHome: {backgroundColor: '#CC342D', borderTopLeftRadius: 2, borderBottomLeftRadius: 2},
  momAway: {backgroundColor: '#B9B6B6', opacity: 0.3},

  oddsRow: {flexDirection: 'row', gap: 6, alignItems: 'center'},
  oddPill: {flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 6, borderRadius: 10, backgroundColor: 'rgba(42,35,37,0.8)', borderWidth: 1, borderColor: '#2A2325'},
  oddPillSel: {backgroundColor: '#CC342D', borderColor: '#CC342D'},
  oddLabel: {fontSize: 9, color: '#B9B6B6', fontWeight: '600'},
  oddVal: {fontSize: 10, color: '#F4F3F3', fontWeight: '700'},
  plusBtn: {width: 32, height: 32, borderRadius: 16, backgroundColor: '#CC342D', borderWidth: 1, borderColor: '#CC342D', alignItems: 'center', justifyContent: 'center'},

  playerCard: {backgroundColor: '#1B1A1B', borderRadius: 14, padding: 10, borderWidth: 1, borderColor: '#2A2325', marginTop: 4},
  playerTitle: {fontSize: 10, fontWeight: '700', color: '#F4F3F3', letterSpacing: 0.5, marginBottom: 6},
  playerHeaderRow: {flexDirection: 'row', paddingBottom: 4, borderBottomWidth: 1, borderBottomColor: '#2A2325'},
  ph: {fontSize: 9, color: '#B9B6B6', fontWeight: '600', flex: 1, textAlign: 'center'},
  phBtn: {flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 2},
  playerRow: {flexDirection: 'row', alignItems: 'center', paddingVertical: 4, borderBottomWidth: 0.5, borderBottomColor: 'rgba(42,35,37,0.5)'},
  playerCell: {flexDirection: 'row', alignItems: 'center', gap: 5},
  playerName: {fontSize: 9, color: '#F4F3F3', fontWeight: '500'},
  pv: {fontSize: 9, color: '#F4F3F3', fontWeight: '500', flex: 1, textAlign: 'center'},
  cardIconWrap: {flex: 1, alignItems: 'center'},
  cardIcon: {width: 7, height: 10, borderRadius: 1},

  bottomNav: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', backgroundColor: '#1B1A1B', borderTopWidth: 1, borderTopColor: '#2A2325', paddingTop: 8},
  navItem: {alignItems: 'center', gap: 4, minWidth: 52},
  navCenter: {width: 56, height: 56, borderRadius: 28, backgroundColor: '#AF1E20', alignItems: 'center', justifyContent: 'center', marginTop: -22, borderWidth: 3, borderColor: '#141214', shadowColor: '#AF1E20', shadowOpacity: 0.4, shadowRadius: 12, elevation: 6},
  navLabel: {color: '#B9B6B6', fontSize: 10, fontWeight: '500'},
  navLabelActive: {color: '#CC342D'},

  modalOverlay: {flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end'},
  modalBox: {backgroundColor: '#1B1A1B', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '70%'},
  modalHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16},
  modalTitle: {color: '#F4F3F3', fontSize: 18, fontWeight: '700'},
  modalClose: {color: '#CC342D', fontSize: 14, fontWeight: '600'},
  searchInput: {backgroundColor: '#222022', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, color: '#F4F3F3', fontSize: 14, marginBottom: 12, borderWidth: 1, borderColor: '#2A2325'},
  searchRow: {paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#2A2325'},
  searchRowText: {color: '#F4F3F3', fontSize: 14, fontWeight: '600'},
  searchRowSub: {color: '#B9B6B6', fontSize: 12, marginTop: 2},
  notifRow: {flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#2A2325'},
  notifDot: {width: 6, height: 6, borderRadius: 3, backgroundColor: '#CC342D'},
  notifText: {color: '#F4F3F3', fontSize: 13},
  moreBox: {backgroundColor: '#1B1A1B', borderRadius: 16, padding: 8, marginHorizontal: 40, marginBottom: 100},
  moreRow: {paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#2A2325'},
  moreText: {color: '#F4F3F3', fontSize: 14, fontWeight: '500'},
});
