import React, {useContext} from 'react';
import {
  View,
  Text,
  ImageBackground,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {BetslipContext, UserTeamsContext, BetsContext, MatchesContext} from '../App';
import TeamInitial from './TeamInitial';

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

export default function MainMenuScreen({navigation}) {
  const insets = useSafeAreaInsets();
  const {matches, refreshMatches} = useContext(MatchesContext);
  const {selections} = useContext(BetslipContext);
  const {userTeams} = useContext(UserTeamsContext);
  const {totalPoints} = useContext(BetsContext);
  const featuredMatches = matches.slice(0, 2);

  const onNav = n => {
    if (n.route) navigation.navigate(n.route);
    else if (n.label === 'Home') return;
  };

  return (
    <ImageBackground
      source={require('../assets/funnel_bg.png')}
      style={s.bg}
      resizeMode="cover">
      <View style={[s.overlay, {paddingTop: insets.top + 12}]}>
        <ScrollView style={s.scroll} contentContainerStyle={s.scrollCt} showsVerticalScrollIndicator={false}>
          <View style={s.header}>
            <Image source={require('../assets/logo_sportera_play.png')} style={s.logo} resizeMode="contain" />
          </View>

          {/* App purpose */}
          <View style={s.hero}>
            <Text style={s.heroTitle}>Predict. Play. Have fun.</Text>
            <Text style={s.heroSub}>
              Spotnerom Play — a fun prediction app for matches. No real money: just points, stats and the thrill of predictions.
            </Text>
          </View>

          {/* Quick stats */}
          <View style={s.statsRow}>
            <View style={s.statPill}>
              <Text style={s.statVal}>{selections.length}</Text>
              <Text style={s.statLabel}>In betslip</Text>
            </View>
            <View style={s.statPill}>
              <Text style={s.statVal}>{userTeams.length}</Text>
              <Text style={s.statLabel}>My teams</Text>
            </View>
            <View style={s.statPill}>
              <Text style={s.statVal}>{totalPoints.toLocaleString()}</Text>
              <Text style={s.statLabel}>Points</Text>
            </View>
          </View>

          {/* Featured matches */}
          <View style={s.secRow}>
            <Text style={s.sectionTitle}>Live now</Text>
            <TouchableOpacity onPress={refreshMatches} style={s.refreshBtn}>
              <Text style={s.refreshText}>Refresh</Text>
            </TouchableOpacity>
          </View>
          {featuredMatches.map(m => (
            <TouchableOpacity
              key={m.id}
              style={s.matchCard}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('MatchDetails', {match: m})}>
              <View style={s.matchHeader}>
                <Text style={s.matchLeague}>{m.league}</Text>
                {m.minute != null ? (
                  <View style={s.liveBadge}>
                    <Text style={s.liveText}>LIVE {m.minute}'</Text>
                  </View>
                ) : (
                  <Text style={s.timeText}>{m.time || m.period || '—'}</Text>
                )}
              </View>
              <View style={s.matchTeams}>
                <View style={s.teamRow}>
                  <TeamInitial teamName={m.homeName} size={28} />
                  <Text style={s.teamName}>{m.homeName}</Text>
                </View>
                <Text style={s.matchScore}>{m.homeScore} – {m.awayScore}</Text>
                <View style={[s.teamRow, s.teamRowAway]}>
                  <TeamInitial teamName={m.awayName} size={28} />
                  <Text style={s.teamName}>{m.awayName}</Text>
                </View>
              </View>
              <Text style={s.matchCta}>Watch & bet</Text>
            </TouchableOpacity>
          ))}

          {/* Navigation hint */}
          <View style={s.navHint}>
            <Text style={s.navHintTitle}>Navigate</Text>
            <Text style={s.navHintText}>Use the tabs below: Home, Sports (odds), Betslip, My Bets, Account.</Text>
          </View>

          {/* Quick actions */}
          <Text style={s.sectionTitle}>Quick actions</Text>
          <View style={s.actionsRow}>
            <TouchableOpacity
              style={[s.actionBtn, s.actionPrimary]}
              onPress={() => navigation.navigate('LiveMatches')}
              activeOpacity={0.8}>
              <Image source={require('../assets/live_matches.png')} style={s.actionIconImg} resizeMode="contain" />
              <Text style={s.actionText}>All matches</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.actionBtn, s.actionSecondary]}
              onPress={() => navigation.navigate('Account')}
              activeOpacity={0.8}>
              <View style={s.actionIconWrap}><Text style={s.actionIconText}>+</Text></View>
              <Text style={s.actionText}>Add team</Text>
            </TouchableOpacity>
          </View>
          <View style={s.actionsRow}>
            <TouchableOpacity
              style={[s.actionBtn, s.actionSecondary]}
              onPress={() => navigation.navigate('Betslip')}
              activeOpacity={0.8}>
              <Image source={require('../assets/betslip.png')} style={s.actionIconImg} resizeMode="contain" />
              <Text style={s.actionText}>My betslip</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.actionBtn, s.actionSecondary]}
              onPress={() => navigation.navigate('MyBets')}
              activeOpacity={0.8}>
              <Image source={require('../assets/prediction.png')} style={s.actionIconImg} resizeMode="contain" />
              <Text style={s.actionText}>Bet history</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <View style={[s.bottomNav, {paddingBottom: insets.bottom || 16}]}>
          {[
            {label: 'Home', idx: 0, route: null},
            {label: 'Sports', idx: 1, route: 'OddsMarkets'},
            {label: '', idx: 2, route: 'Betslip', center: true},
            {label: 'My Bets', idx: 3, route: 'MyBets'},
            {label: 'Account', idx: 4, route: 'Account'},
          ].map((n, i) =>
            n.center ? (
              <TouchableOpacity key={i} style={s.navCenter} onPress={() => onNav(n)}>
                <NavIcon index={2} size={28} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity key={i} style={s.navItem} onPress={() => n.route && navigation.navigate(n.route)}>
                <NavIcon index={n.idx} size={28} tintColor={n.label === 'Home' ? '#CC342D' : undefined} />
                <Text style={[s.navLabel, n.label === 'Home' && s.navLabelActive]}>{n.label}</Text>
              </TouchableOpacity>
            ),
          )}
        </View>
      </View>
    </ImageBackground>
  );
}

const s = StyleSheet.create({
  bg: {flex: 1},
  overlay: {flex: 1, backgroundColor: 'rgba(20,18,20,0.65)'},
  scroll: {flex: 1},
  scrollCt: {paddingHorizontal: 16, paddingBottom: 20},
  header: {alignItems: 'center', marginBottom: 16},
  logo: {width: 160, height: 60},

  hero: {backgroundColor: 'rgba(27,26,27,0.9)', borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#2A2325'},
  heroTitle: {color: '#F4F3F3', fontSize: 20, fontWeight: '800', marginBottom: 8},
  heroSub: {color: 'rgba(244,243,243,0.8)', fontSize: 13, lineHeight: 20},

  statsRow: {flexDirection: 'row', gap: 10, marginBottom: 24},
  statPill: {flex: 1, backgroundColor: '#1B1A1B', borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#2A2325'},
  statVal: {color: '#CC342D', fontSize: 22, fontWeight: '800', marginBottom: 2},
  statLabel: {color: '#B9B6B6', fontSize: 11, fontWeight: '600'},

  sectionTitle: {color: '#B9B6B6', fontSize: 12, fontWeight: '700', letterSpacing: 0.5, marginBottom: 10},
  secRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10},
  refreshBtn: {paddingVertical: 4, paddingHorizontal: 10, backgroundColor: 'rgba(204,52,45,0.2)', borderRadius: 8},
  refreshText: {color: '#CC342D', fontSize: 11, fontWeight: '700'},
  navHint: {backgroundColor: 'rgba(42,35,37,0.6)', borderRadius: 12, padding: 14, marginBottom: 20, borderWidth: 1, borderColor: '#2A2325'},
  navHintTitle: {color: '#F4F3F3', fontSize: 12, fontWeight: '700', marginBottom: 4},
  navHintText: {color: '#B9B6B6', fontSize: 11, lineHeight: 16},
  matchCard: {backgroundColor: '#1B1A1B', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#2A2325'},
  matchHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10},
  matchLeague: {color: '#B9B6B6', fontSize: 11, fontWeight: '600'},
  liveBadge: {backgroundColor: '#CC342D', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6},
  liveText: {color: '#fff', fontSize: 10, fontWeight: '700'},
  timeText: {color: '#B9B6B6', fontSize: 10, fontWeight: '600'},
  matchTeams: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8},
  teamRow: {flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1},
  teamRowAway: {justifyContent: 'flex-end'},
  teamName: {color: '#F4F3F3', fontSize: 13, fontWeight: '600'},
  matchScore: {fontSize: 18, fontWeight: '800', color: '#F4F3F3', minWidth: 50, textAlign: 'center'},
  matchCta: {color: '#CC342D', fontSize: 12, fontWeight: '600', textAlign: 'center'},

  actionsRow: {flexDirection: 'row', gap: 10, marginBottom: 10},
  actionBtn: {flex: 1, borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1},
  actionPrimary: {backgroundColor: '#CC342D', borderColor: '#CC342D'},
  actionSecondary: {backgroundColor: '#1B1A1B', borderColor: '#2A2325'},
  actionIconImg: {width: 28, height: 28, marginBottom: 6, tintColor: '#FFFFFF'},
  actionIconWrap: {width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 6},
  actionIconText: {color: '#FFFFFF', fontSize: 18, fontWeight: '700'},
  actionText: {color: '#F4F3F3', fontSize: 12, fontWeight: '700'},

  bottomNav: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', backgroundColor: '#1B1A1B', borderTopWidth: 1, borderTopColor: '#2A2325', paddingTop: 6},
  navItem: {alignItems: 'center', gap: 4, minWidth: 52},
  navCenter: {width: 56, height: 56, borderRadius: 28, backgroundColor: '#AF1E20', alignItems: 'center', justifyContent: 'center', marginTop: -22, borderWidth: 3, borderColor: '#141214', shadowColor: '#AF1E20', shadowOpacity: 0.4, shadowRadius: 12, elevation: 6},
  navLabel: {color: '#B9B6B6', fontSize: 10, fontWeight: '500'},
  navLabelActive: {color: '#CC342D'},
});
