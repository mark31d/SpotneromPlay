import React, {useState, useContext} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {BetsContext} from '../App';

const NAV_SPRITE = {src: require('../assets/nav_icons.png'), cols: 5, rows: 1};

function NavIcon({index, size = 28, tintColor}) {
  const col = index % NAV_SPRITE.cols;
  return (
    <View style={{width: size, height: size, overflow: 'hidden'}}>
      <Image
        source={NAV_SPRITE.src}
        style={[
          {position: 'absolute', width: NAV_SPRITE.cols * size, height: size, left: -col * size, top: 0},
          tintColor && {tintColor},
        ]}
        resizeMode="stretch"
      />
    </View>
  );
}

const TABS = ['Active', 'Settled'];

const NAV_ITEMS = [
  {label: 'Home', idx: 0, route: 'MainMenu'},
  {label: 'Sports', idx: 1, route: 'OddsMarkets'},
  {label: '', idx: 2, route: 'Betslip', center: true},
  {label: 'My Bets', idx: 3, route: null},
  {label: 'Account', idx: 4, route: 'Account'},
];

export default function MyBetsScreen({navigation}) {
  const insets = useSafeAreaInsets();
  const {betHistory} = useContext(BetsContext);
  const [activeTab, setActiveTab] = useState(0);

  const displayBets = activeTab === 0
    ? betHistory.filter(b => b.status === 'pending')
    : betHistory.filter(b => b.status === 'won' || b.status === 'lost');

  const totalPts = betHistory.filter(b => b.status === 'won').reduce((a, b) => a + (b.pts || 0), 0);

  const onNav = n => {
    if (n.route) navigation.navigate(n.route);
  };

  const statusColor = s => {
    if (s === 'won') return '#35D07F';
    if (s === 'lost') return '#CC342D';
    return '#F5C542';
  };

  const statusLabel = s => {
    if (s === 'won') return 'Won';
    if (s === 'lost') return 'Lost';
    return 'Pending';
  };

  return (
    <View style={[st.root, {paddingTop: insets.top}]}>
      <View style={st.header}>
        <Text style={st.title}>My Bets</Text>
        <View style={st.statsRow}>
          <View style={st.statPill}>
            <Text style={st.statLabel}>Total Won</Text>
            <Text style={st.statVal}>{totalPts} pts</Text>
          </View>
        </View>
      </View>

      <View style={st.tabsRow}>
        {TABS.map((t, i) => (
          <TouchableOpacity
            key={t}
            style={[st.tab, activeTab === i && st.tabActive]}
            onPress={() => setActiveTab(i)}>
            <Text style={[st.tabText, activeTab === i && st.tabTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={st.scroll} contentContainerStyle={st.scrollCt}>
        {displayBets.length === 0 ? (
          <View style={st.empty}>
            <View style={st.emptyIconWrap}>
              <NavIcon index={3} size={48} />
            </View>
            <Text style={st.emptyTitle}>No bets yet</Text>
            <Text style={st.emptySub}>
              {activeTab === 0 ? 'Your active bets will appear here.' : 'Your settled bets will appear here.'}
            </Text>
            <TouchableOpacity style={st.ctaBtn} onPress={() => navigation.navigate('LiveMatches')}>
              <Text style={st.ctaText}>Browse Matches</Text>
            </TouchableOpacity>
          </View>
        ) : (
          displayBets.map(bet => (
            <View key={bet.id} style={st.card}>
              <View style={st.cardHeader}>
                <Text style={st.matchText}>{bet.match}</Text>
                <View style={[st.statusBadge, {backgroundColor: statusColor(bet.status) + '30'}]}>
                  <Text style={[st.statusText, {color: statusColor(bet.status)}]}>{statusLabel(bet.status)}</Text>
                </View>
              </View>
              <View style={st.cardRow}>
                <Text style={st.pickLabel}>{bet.pick}</Text>
                <Text style={st.oddText}>@ {bet.odd.toFixed(2)}</Text>
              </View>
              {(bet.status === 'won' || bet.status === 'lost') && (
                <Text style={[st.ptsText, {color: statusColor(bet.status)}]}>
                  {bet.status === 'won' ? '+' : ''}{bet.pts} pts
                </Text>
              )}
            </View>
          ))
        )}
      </ScrollView>

      <View style={[st.bottomNav, {paddingBottom: insets.bottom || 16}]}>
        {NAV_ITEMS.map((n, i) =>
          n.center ? (
            <TouchableOpacity key={i} style={st.navCenter} onPress={() => onNav(n)}>
              <NavIcon index={2} size={28} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity key={i} style={st.navItem} onPress={() => onNav(n)}>
              <NavIcon index={n.idx} size={28} tintColor={n.label === 'My Bets' ? '#CC342D' : undefined} />
              <Text style={[st.navLabel, n.label === 'My Bets' && st.navLabelActive]}>{n.label}</Text>
            </TouchableOpacity>
          ),
        )}
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  root: {flex: 1, backgroundColor: '#141214'},
  header: {paddingHorizontal: 14, paddingBottom: 12},
  title: {fontSize: 22, fontWeight: '800', color: '#F4F3F3', marginBottom: 12},
  statsRow: {flexDirection: 'row', gap: 10},
  statPill: {backgroundColor: '#1B1A1B', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#2A2325', flex: 1},
  statLabel: {color: '#B9B6B6', fontSize: 11, fontWeight: '600', marginBottom: 2},
  statVal: {color: '#35D07F', fontSize: 16, fontWeight: '800'},

  tabsRow: {flexDirection: 'row', marginHorizontal: 14, backgroundColor: '#1B1A1B', borderRadius: 10, padding: 2, borderWidth: 1, borderColor: '#2A2325', marginBottom: 12},
  tab: {flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8},
  tabActive: {backgroundColor: '#CC342D'},
  tabText: {fontSize: 12, fontWeight: '600', color: '#B9B6B6'},
  tabTextActive: {color: '#fff'},

  scroll: {flex: 1},
  scrollCt: {paddingHorizontal: 14, paddingBottom: 20, gap: 8},

  empty: {alignItems: 'center', paddingTop: 60},
  emptyIconWrap: {marginBottom: 16},
  emptyTitle: {color: '#F4F3F3', fontSize: 18, fontWeight: '700', marginBottom: 6},
  emptySub: {color: '#B9B6B6', fontSize: 13, textAlign: 'center', marginBottom: 24},
  ctaBtn: {backgroundColor: '#CC342D', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12},
  ctaText: {color: '#fff', fontSize: 14, fontWeight: '700'},

  card: {backgroundColor: '#1B1A1B', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#2A2325'},
  cardHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8},
  matchText: {color: '#F4F3F3', fontSize: 13, fontWeight: '600', flex: 1},
  statusBadge: {paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8},
  statusText: {fontSize: 10, fontWeight: '700'},
  cardRow: {flexDirection: 'row', alignItems: 'center', gap: 8},
  pickLabel: {color: '#CC342D', fontSize: 13, fontWeight: '700'},
  oddText: {color: '#B9B6B6', fontSize: 12},
  ptsText: {fontSize: 14, fontWeight: '800', marginTop: 6},

  bottomNav: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', backgroundColor: '#1B1A1B', borderTopWidth: 1, borderTopColor: '#2A2325', paddingTop: 8},
  navItem: {alignItems: 'center', gap: 4, minWidth: 52},
  navCenter: {width: 56, height: 56, borderRadius: 28, backgroundColor: '#AF1E20', alignItems: 'center', justifyContent: 'center', marginTop: -22, borderWidth: 3, borderColor: '#141214'},
  navLabel: {color: '#B9B6B6', fontSize: 10, fontWeight: '500'},
  navLabelActive: {color: '#CC342D'},
});
