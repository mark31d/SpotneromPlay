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

import {PredictionsContext} from '../App';

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


const NAV_ITEMS = [
  {label: 'Home', idx: 0, route: 'MainMenu'},
  {label: 'Sports', idx: 1, route: 'LiveMatches'},
  {label: '', idx: 2, route: 'PredictionCard', center: true},
  {label: 'My Predictions', idx: 3, route: null},
  {label: 'Account', idx: 4, route: 'Account'},
];

export default function MyPredictionsScreen({navigation}) {
  const insets = useSafeAreaInsets();
  const {predictionHistory} = useContext(PredictionsContext);

  const displayPredictions = predictionHistory.filter(b => b.status === 'correct' || b.status === 'incorrect');
  const correctCount = predictionHistory.filter(b => b.status === 'correct').length;

  const onNav = n => {
    if (n.route) navigation.navigate(n.route);
  };

  const statusColor = s => {
    if (s === 'correct') return '#35D07F';
    if (s === 'incorrect') return '#CC342D';
    return '#F5C542';
  };

  const statusLabel = s => {
    if (s === 'correct') return 'Correct';
    if (s === 'incorrect') return 'Incorrect';
    return 'Pending';
  };

  return (
    <View style={[st.root, {paddingTop: insets.top}]}>
      <View style={st.header}>
        <Text style={st.title}>My Predictions</Text>
        <View style={st.statsRow}>
          <View style={st.statPill}>
            <Text style={st.statLabel}>Correct</Text>
            <Text style={st.statVal}>{correctCount}</Text>
          </View>
        </View>
      </View>

      <ScrollView style={st.scroll} contentContainerStyle={st.scrollCt}>
        {displayPredictions.length === 0 ? (
          <View style={st.empty}>
            <View style={st.emptyIconWrap}>
              <NavIcon index={3} size={48} />
            </View>
            <Text style={st.emptyTitle}>No predictions yet</Text>
            <Text style={st.emptySub}>
              Make picks on matches and submit to see your results here.
            </Text>
            <TouchableOpacity style={st.ctaBtn} onPress={() => navigation.navigate('LiveMatches')}>
              <Text style={st.ctaText}>Browse Matches</Text>
            </TouchableOpacity>
          </View>
        ) : (
          displayPredictions.map(pred => (
            <View key={pred.id} style={st.card}>
              <View style={st.cardHeader}>
                <Text style={st.matchText}>{pred.match}</Text>
                <View style={[st.statusBadge, {backgroundColor: statusColor(pred.status) + '30'}]}>
                  <Text style={[st.statusText, {color: statusColor(pred.status)}]}>{statusLabel(pred.status)}</Text>
                </View>
              </View>
              <View style={st.cardRow}>
                <Text style={st.pickLabel}>{pred.pick}</Text>
              </View>
              {pred.message && (
                <Text style={[st.messageText, {color: statusColor(pred.status)}]}>{pred.message}</Text>
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
              <NavIcon index={n.idx} size={28} tintColor={n.label === 'My Predictions' ? '#CC342D' : undefined} />
              <Text style={[st.navLabel, n.label === 'My Predictions' && st.navLabelActive]}>{n.label}</Text>
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
  messageText: {fontSize: 13, fontWeight: '600', marginTop: 8, fontStyle: 'italic'},

  bottomNav: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', backgroundColor: '#1B1A1B', borderTopWidth: 1, borderTopColor: '#2A2325', paddingTop: 8},
  navItem: {alignItems: 'center', gap: 4, minWidth: 52},
  navCenter: {width: 56, height: 56, borderRadius: 28, backgroundColor: '#AF1E20', alignItems: 'center', justifyContent: 'center', marginTop: -22, borderWidth: 3, borderColor: '#141214'},
  navLabel: {color: '#B9B6B6', fontSize: 10, fontWeight: '500'},
  navLabelActive: {color: '#CC342D'},
});
