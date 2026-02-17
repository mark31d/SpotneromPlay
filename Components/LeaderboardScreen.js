import React, {useContext} from 'react';
import {View, Text, TouchableOpacity, ScrollView, StyleSheet, Share} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {BetsContext, ProfileContext} from '../App';
import PlayerAvatar from './PlayerAvatar';

export default function LeaderboardScreen({navigation}) {
  const insets = useSafeAreaInsets();
  const {totalPoints} = useContext(BetsContext);
  const {profile} = useContext(ProfileContext);

  const leaderboard = [
    {rank: 1, name: profile.userName || 'You', pts: totalPoints, isYou: true},
  ];

  const shareRank = () => {
    const msg = `I'm on the Spotnerom Play leaderboard with ${totalPoints.toLocaleString()} pts! Predict. Play. Have fun.`;
    Share.share({message: msg, title: 'Spotnerom Play'}).catch(() => {});
  };

  return (
    <View style={[st.root, {paddingTop: insets.top}]}>
      <View style={st.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={st.backBtn}>
          <Text style={st.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={st.title}>Leaderboard</Text>
      </View>
      <ScrollView style={st.scroll} contentContainerStyle={st.scrollCt}>
        <Text style={st.subtitle}>Compete with friends</Text>
        <TouchableOpacity style={st.shareBtn} onPress={shareRank} activeOpacity={0.8}>
          <Text style={st.shareBtnText}>Share my rank</Text>
        </TouchableOpacity>
        {leaderboard.map((p, i) => (
          <View key={i} style={[st.row, p.isYou && st.rowYou]}>
            <Text style={st.rank}>#{p.rank}</Text>
            <PlayerAvatar playerName={p.name} size={40} />
            <View style={st.rowInfo}>
              <Text style={[st.name, p.isYou && st.nameYou]}>{p.name || 'You'}</Text>
              <Text style={st.pts}>{p.pts.toLocaleString()} pts</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  root: {flex: 1, backgroundColor: '#141214'},
  header: {flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingBottom: 12},
  backBtn: {marginRight: 12},
  backText: {color: '#CC342D', fontSize: 16, fontWeight: '600'},
  title: {color: '#F4F3F3', fontSize: 20, fontWeight: '800'},
  scroll: {flex: 1},
  scrollCt: {paddingHorizontal: 14, paddingBottom: 24},
  subtitle: {color: '#B9B6B6', fontSize: 13, marginBottom: 12},
  shareBtn: {backgroundColor: '#CC342D', borderRadius: 12, padding: 12, alignItems: 'center', marginBottom: 20},
  shareBtnText: {color: '#fff', fontSize: 14, fontWeight: '700'},
  row: {flexDirection: 'row', alignItems: 'center', backgroundColor: '#1B1A1B', borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#2A2325'},
  rowYou: {borderColor: '#CC342D', backgroundColor: 'rgba(204,52,45,0.1)'},
  rank: {width: 36, color: '#B9B6B6', fontSize: 14, fontWeight: '700'},
  rowInfo: {flex: 1, marginLeft: 12},
  name: {color: '#F4F3F3', fontSize: 16, fontWeight: '700'},
  nameYou: {color: '#CC342D'},
  pts: {color: '#35D07F', fontSize: 13, fontWeight: '600', marginTop: 2},
});
