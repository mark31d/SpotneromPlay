import React, {useState, useContext, useMemo} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  StyleSheet,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {BetslipContext, MatchesContext} from '../App';
import TeamInitial from './TeamInitial';

/* ── Sprite ── */
const SHEETS = {
  nav: {src: require('../assets/nav_icons.png'), cols: 5, rows: 1},
};
function Sprite({type, index, size = 16}) {
  const sh = SHEETS[type];
  const col = index % sh.cols;
  const row = Math.floor(index / sh.cols);
  return (
    <View style={{width: size, height: size, overflow: 'hidden', borderRadius: 4}}>
      <Image source={sh.src} style={{position: 'absolute', width: sh.cols * size, height: sh.rows * size, left: -col * size, top: -row * size}} resizeMode="stretch" />
    </View>
  );
}

const MARKET_KEYS = ['1X2', 'O/U', 'BTTS', 'CS'];
const MARKET_LABELS = ['1X2', 'O/U', 'BTTS', 'Correct Score'];

const NAV_ITEMS = [
  {label: 'Home', idx: 0, route: 'MainMenu'},
  {label: 'Sports', idx: 1, route: null},
  {label: '', idx: 2, route: 'Betslip', center: true},
  {label: 'My Bets', idx: 3, route: 'MyBets'},
  {label: 'Account', idx: 4, route: 'Account'},
];

export default function OddsMarketsScreen({navigation, route}) {
  const insets = useSafeAreaInsets();
  const {matches} = useContext(MatchesContext);
  const {selections, addSelection} = useContext(BetslipContext);
  const preselectMatchId = route?.params?.preselectMatchId;

  const [marketIdx, setMarketIdx] = useState(0);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [filterSport, setFilterSport] = useState('Football');
  const [filterTime, setFilterTime] = useState('All');
  const [infoMatch, setInfoMatch] = useState(null);

  const selCount = selections.length;
  const marketKey = MARKET_KEYS[marketIdx];

  const displayMatches = useMemo(() => {
    let list = matches;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(m => m.homeName.toLowerCase().includes(q) || m.awayName.toLowerCase().includes(q));
    }
    return list;
  }, [matches, searchQuery]);

  const isSelected = (matchId, pick) =>
    selections.some(s => s.matchId === matchId && s.market === marketKey && s.pickLabel === pick);

  const handleOdd = (match, pick, val) => {
    addSelection(match.id, marketKey, pick, val, `${match.homeName} vs ${match.awayName}`);
  };

  const onNav = n => {
    if (n.route) navigation.navigate(n.route);
  };

  return (
    <View style={[st.root, {paddingTop: insets.top}]}>
      {/* Header */}
      <View style={st.headerRow}>
        <Text style={st.title}>Odds</Text>
        <View style={st.headerIcons}>
          <TouchableOpacity style={st.iconBtn} onPress={() => setFilterVisible(true)}>
            <Image source={require('../assets/ic_filter.png')} style={st.icSm} resizeMode="contain" />
          </TouchableOpacity>
          <TouchableOpacity style={st.iconBtn} onPress={() => setSearchVisible(true)}>
            <Image source={require('../assets/ic_search.png')} style={st.icSm} resizeMode="contain" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Market Segments */}
      <View style={st.segRow}>
        {MARKET_LABELS.map((m, i) => (
          <TouchableOpacity key={m} style={[st.segItem, marketIdx === i && st.segActive]} onPress={() => setMarketIdx(i)}>
            <Text style={[st.segText, marketIdx === i && {color: '#fff'}]}>{m}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Inline search */}
      {searchVisible && (
        <View style={st.inlineSearch}>
          <TextInput
            style={st.searchInput}
            placeholder="Search teams..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          <TouchableOpacity onPress={() => {setSearchVisible(false); setSearchQuery('');}}>
            <Text style={st.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Table Header */}
      <View style={st.tblHeader}>
        <Text style={[st.th, {flex: 2, textAlign: 'left'}]}>Match</Text>
        {(displayMatches[0]?.odds?.[marketKey]?.picks || []).map((p, i) => (
          <Text key={i} style={st.th}>{p.l}</Text>
        ))}
        <Text style={st.th} />
      </View>

      {/* Table Body */}
      <ScrollView style={st.scroll}>
        {displayMatches.map(match => {
          const picks = match.odds[marketKey]?.picks || [];
          return (
            <View key={match.id} style={[st.row, preselectMatchId === match.id && st.rowHighlight]}>
              <View style={[st.matchCell, {flex: 2}]}>
                <View style={st.teamLine}>
                  <TeamInitial teamName={match.homeName} size={24} />
                  <Text style={st.teamText}>{match.homeName}</Text>
                </View>
                <View style={st.teamLine}>
                  <TeamInitial teamName={match.awayName} size={24} />
                  <Text style={st.teamText}>{match.awayName}</Text>
                </View>
                <Text style={st.leagueText}>{match.league} · {match.time}</Text>
              </View>
              {picks.map((p, i) => (
                <TouchableOpacity
                  key={i}
                  style={st.oddCell}
                  onPress={() => handleOdd(match, p.l, p.v)}>
                  <View style={[st.oddPill, isSelected(match.id, p.l) && st.oddPillSel]}>
                    <Text style={[st.oddVal, isSelected(match.id, p.l) && {color: '#fff'}]}>{p.v.toFixed(2)}</Text>
                  </View>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={st.infoBtn} onPress={() => setInfoMatch(match)}>
                <Image source={require('../assets/inf.png')} style={st.infIcon} resizeMode="contain" />
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>

      {/* Floating Betslip */}
      {selCount > 0 && (
        <TouchableOpacity style={[st.floatBs, {bottom: 70 + (insets.bottom || 16)}]} onPress={() => navigation.navigate('Betslip')}>
          <Text style={st.floatBsText}>Betslip</Text>
          <View style={st.floatBsCount}>
            <Text style={st.floatBsCountText}>{selCount}</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Bottom Nav */}
      <View style={[st.bottomNav, {paddingBottom: insets.bottom || 16}]}>
        {NAV_ITEMS.map((n, i) =>
          n.center ? (
            <TouchableOpacity key={i} style={st.navCenter} onPress={() => onNav(n)}>
              <Sprite type="nav" index={2} size={28} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity key={i} style={st.navItem} onPress={() => onNav(n)}>
              <Sprite type="nav" index={n.idx} size={28} />
              <Text style={[st.navLabel, n.label === 'Sports' && st.navLabelActive]}>{n.label}</Text>
            </TouchableOpacity>
          ),
        )}
      </View>

      {/* Filter Modal */}
      <Modal visible={filterVisible} transparent animationType="slide">
        <View style={st.modalOverlay}>
          <View style={st.modalBox}>
            <View style={st.modalHeader}>
              <Text style={st.modalTitle}>Filters</Text>
              <TouchableOpacity onPress={() => setFilterVisible(false)}>
                <Text style={st.modalClose}>Done</Text>
              </TouchableOpacity>
            </View>
            <Text style={st.filterLabel}>Sport</Text>
            {['Football', 'Tennis'].map(s2 => (
              <TouchableOpacity key={s2} style={st.filterRow} onPress={() => setFilterSport(s2)}>
                <View style={[st.filterCheck, filterSport === s2 && st.filterCheckActive]} />
                <Text style={st.filterText}>{s2}</Text>
              </TouchableOpacity>
            ))}
            <Text style={[st.filterLabel, {marginTop: 16}]}>Time</Text>
            {['All', 'Live', 'Today'].map(t => (
              <TouchableOpacity key={t} style={st.filterRow} onPress={() => setFilterTime(t)}>
                <View style={[st.filterCheck, filterTime === t && st.filterCheckActive]} />
                <Text style={st.filterText}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Info Modal */}
      <Modal visible={!!infoMatch} transparent animationType="fade">
        <TouchableOpacity style={st.modalOverlay} activeOpacity={1} onPress={() => setInfoMatch(null)}>
          <View style={st.infoBox}>
            {infoMatch && (
              <>
                <Text style={st.infoTitle}>{infoMatch.homeName} vs {infoMatch.awayName}</Text>
                <Text style={st.infoSub}>{infoMatch.league} · {infoMatch.time}</Text>
                <View style={st.infoOdds}>
                  {(infoMatch.odds['1X2']?.picks || []).map((p, i) => (
                    <View key={i} style={st.infoOddItem}>
                      <Text style={st.infoOddLabel}>{p.l}</Text>
                      <Text style={st.infoOddVal}>{p.v.toFixed(2)}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const st = StyleSheet.create({
  root: {flex: 1, backgroundColor: '#141214'},
  headerRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingBottom: 6},
  title: {fontSize: 20, fontWeight: '800', color: '#F4F3F3'},
  headerIcons: {flexDirection: 'row', gap: 8},
  iconBtn: {width: 34, height: 34, borderRadius: 17, backgroundColor: '#1B1A1B', borderWidth: 1, borderColor: '#2A2325', alignItems: 'center', justifyContent: 'center'},
  icSm: {width: 18, height: 18, tintColor: '#FFFFFF'},

  segRow: {flexDirection: 'row', marginHorizontal: 14, backgroundColor: '#1B1A1B', borderRadius: 12, padding: 3, borderWidth: 1, borderColor: '#2A2325', marginBottom: 10},
  segItem: {flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center'},
  segActive: {backgroundColor: '#CC342D'},
  segText: {fontSize: 11, fontWeight: '600', color: '#B9B6B6'},

  inlineSearch: {flexDirection: 'row', alignItems: 'center', marginHorizontal: 14, gap: 8, marginBottom: 8},
  searchInput: {flex: 1, backgroundColor: '#222022', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, color: '#F4F3F3', fontSize: 13, borderWidth: 1, borderColor: '#2A2325'},
  cancelText: {color: '#CC342D', fontSize: 13, fontWeight: '600'},

  tblHeader: {flexDirection: 'row', paddingHorizontal: 14, paddingBottom: 8, paddingTop: 4, borderBottomWidth: 1, borderBottomColor: '#2A2325', alignItems: 'center'},
  th: {fontSize: 11, fontWeight: '700', color: '#B9B6B6', flex: 1, textAlign: 'center'},

  scroll: {flex: 1, paddingHorizontal: 12},
  row: {flexDirection: 'row', alignItems: 'center', backgroundColor: '#1B1A1B', borderRadius: 14, marginTop: 6, paddingVertical: 12, paddingHorizontal: 12},
  rowHighlight: {borderWidth: 1, borderColor: '#CC342D'},
  matchCell: {gap: 4},
  teamLine: {flexDirection: 'row', alignItems: 'center', gap: 8},
  teamText: {fontSize: 12, fontWeight: '600', color: '#F4F3F3'},
  leagueText: {fontSize: 10, color: '#B9B6B6', marginTop: 2},
  oddCell: {flex: 1, alignItems: 'center'},
  oddPill: {paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10, backgroundColor: 'rgba(42,35,37,0.8)', borderWidth: 1, borderColor: '#2A2325', minWidth: 52, alignItems: 'center'},
  oddPillSel: {backgroundColor: '#CC342D', borderColor: '#CC342D'},
  oddVal: {fontSize: 12, fontWeight: '700', color: '#F4F3F3'},
  infoBtn: {paddingLeft: 8, paddingVertical: 4},
  infIcon: {width: 22, height: 22, tintColor: '#fff'},

  floatBs: {position: 'absolute', right: 16, backgroundColor: '#AF1E20', borderRadius: 24, paddingHorizontal: 20, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 8, shadowColor: '#AF1E20', shadowOpacity: 0.5, shadowRadius: 16, elevation: 8},
  floatBsText: {color: '#fff', fontSize: 13, fontWeight: '700'},
  floatBsCount: {width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center'},
  floatBsCountText: {color: '#CC342D', fontSize: 11, fontWeight: '800'},

  bottomNav: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', backgroundColor: '#1B1A1B', borderTopWidth: 1, borderTopColor: '#2A2325', paddingTop: 8},
  navItem: {alignItems: 'center', gap: 4, minWidth: 52},
  navCenter: {width: 56, height: 56, borderRadius: 28, backgroundColor: '#AF1E20', alignItems: 'center', justifyContent: 'center', marginTop: -22, borderWidth: 3, borderColor: '#141214'},
  navLabel: {color: '#B9B6B6', fontSize: 10, fontWeight: '500'},
  navLabelActive: {color: '#CC342D'},

  modalOverlay: {flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end'},
  modalBox: {backgroundColor: '#1B1A1B', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20},
  modalHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16},
  modalTitle: {color: '#F4F3F3', fontSize: 18, fontWeight: '700'},
  modalClose: {color: '#CC342D', fontSize: 14, fontWeight: '600'},
  filterLabel: {color: '#B9B6B6', fontSize: 12, fontWeight: '600', marginBottom: 8},
  filterRow: {flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10},
  filterCheck: {width: 20, height: 20, borderRadius: 4, borderWidth: 2, borderColor: '#2A2325'},
  filterCheckActive: {backgroundColor: '#CC342D', borderColor: '#CC342D'},
  filterText: {color: '#F4F3F3', fontSize: 14},

  infoBox: {backgroundColor: '#1B1A1B', borderRadius: 18, padding: 24, marginHorizontal: 24, marginBottom: 120},
  infoTitle: {color: '#F4F3F3', fontSize: 18, fontWeight: '700', marginBottom: 6},
  infoSub: {color: '#B9B6B6', fontSize: 13, marginBottom: 14},
  infoOdds: {flexDirection: 'row', gap: 12},
  infoOddItem: {flex: 1, alignItems: 'center', paddingVertical: 12, backgroundColor: '#222022', borderRadius: 12, borderWidth: 1, borderColor: '#2A2325'},
  infoOddLabel: {color: '#B9B6B6', fontSize: 11, fontWeight: '600'},
  infoOddVal: {color: '#F4F3F3', fontSize: 15, fontWeight: '700', marginTop: 4},
});
