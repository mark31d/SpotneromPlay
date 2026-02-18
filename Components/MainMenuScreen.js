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
import {UserTeamsContext} from '../App';

export default function MainMenuScreen({navigation}) {
  const insets = useSafeAreaInsets();
  const {userTeams, matchHistory} = useContext(UserTeamsContext);

  const winCount = matchHistory.filter(m => m.result === 'win').length;

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

          <View style={s.hero}>
            <Text style={s.heroTitle}>Simulate. Compete. Have fun.</Text>
            <Text style={s.heroSub}>
              Spotnerom Play — simulate matches with your teams. Build rating, track stats, climb the leaderboard.
            </Text>
          </View>

          <View style={s.statsRow}>
            <View style={s.statPill}>
              <Text style={s.statVal}>{userTeams.length}</Text>
              <Text style={s.statLabel}>Teams</Text>
            </View>
            <View style={s.statPill}>
              <Text style={s.statVal}>{matchHistory.length}</Text>
              <Text style={s.statLabel}>Matches</Text>
            </View>
            <View style={s.statPill}>
              <Text style={s.statVal}>{winCount}</Text>
              <Text style={s.statLabel}>Wins</Text>
            </View>
          </View>

          <View style={s.navHint}>
            <Text style={s.navHintTitle}>Quick start</Text>
            <Text style={s.navHintText}>Play: select your team and opponent, simulate a match. History: see past results. Account: manage teams.</Text>
          </View>

          <Text style={s.sectionTitle}>Quick actions</Text>
          <View style={s.actionsRow}>
            <TouchableOpacity
              style={[s.actionBtn, s.actionPrimary]}
              onPress={() => navigation.navigate('Play')}
              activeOpacity={0.8}>
              <Image source={require('../assets/live_matches.png')} style={s.actionIconImg} resizeMode="contain" />
              <Text style={s.actionText}>Play Match</Text>
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
              onPress={() => {
                if (matchHistory.length > 0) {
                  navigation.navigate('MatchDetail', {match: matchHistory[0]});
                } else {
                  navigation.navigate('MatchHistory');
                }
              }}
              activeOpacity={0.8}>
              <Image source={require('../assets/prediction.png')} style={s.actionIconImg} resizeMode="contain" />
              <Text style={s.actionText}>Match history</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.actionBtn, s.actionSecondary]}
              onPress={() => navigation.navigate('Leaderboard')}
              activeOpacity={0.8}>
              <Image source={require('../assets/prediction_card.png')} style={s.actionIconImg} resizeMode="contain" />
              <Text style={s.actionText}>Leaderboard</Text>
            </TouchableOpacity>
          </View>
          <View style={s.actionsRow}>
            <TouchableOpacity
              style={[s.actionBtn, s.actionSecondary]}
              onPress={() => navigation.navigate('TeamStats')}
              activeOpacity={0.8}>
              <Image source={require('../assets/live_matches.png')} style={s.actionIconImg} resizeMode="contain" />
              <Text style={s.actionText}>Team Stats</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.actionBtn, s.actionSecondary]}
              onPress={() => navigation.navigate('TeamTraining')}
              activeOpacity={0.8}>
              <Image source={require('../assets/flash.png')} style={s.actionIconImg} resizeMode="contain" />
              <Text style={s.actionText}>Training</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        <View style={{height: insets.bottom || 16}} />
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
  navHint: {backgroundColor: 'rgba(42,35,37,0.6)', borderRadius: 12, padding: 14, marginBottom: 20, borderWidth: 1, borderColor: '#2A2325'},
  navHintTitle: {color: '#F4F3F3', fontSize: 12, fontWeight: '700', marginBottom: 4},
  navHintText: {color: '#B9B6B6', fontSize: 11, lineHeight: 16},

  actionsRow: {flexDirection: 'row', gap: 10, marginBottom: 10},
  actionBtn: {flex: 1, borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1},
  actionPrimary: {backgroundColor: '#CC342D', borderColor: '#CC342D'},
  actionSecondary: {backgroundColor: '#1B1A1B', borderColor: '#2A2325'},
  actionIconImg: {width: 28, height: 28, marginBottom: 6, tintColor: '#FFFFFF'},
  actionIconWrap: {width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 6},
  actionIconText: {color: '#FFFFFF', fontSize: 18, fontWeight: '700'},
  actionText: {color: '#F4F3F3', fontSize: 12, fontWeight: '700'},
});
