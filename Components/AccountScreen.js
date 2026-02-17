import React, {useState, useContext} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {launchImageLibrary} from 'react-native-image-picker';
import {UserTeamsContext, BetsContext, ProfileContext} from '../App';
import TeamInitial from './TeamInitial';
import {StatIcon} from './DrawnBadge';

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
  {label: 'Sports', idx: 1, route: 'OddsMarkets'},
  {label: '', idx: 2, route: 'Betslip', center: true},
  {label: 'My Bets', idx: 3, route: 'MyBets'},
  {label: 'Account', idx: 4, route: null},
];

/* ── Entertaining stats (not real currency) ── */
const STATS = [
  {label: 'Total Points', value: null, badgeIdx: 4},
  {label: 'Bets Won', value: '47', badgeIdx: 0},
  {label: 'Win Streak', value: '5', badgeIdx: 1},
  {label: 'Level', value: 'Pro Predictor', badgeIdx: 5},
];

const MENU_ITEMS = [
  {label: 'Achievements', desc: 'Badges & milestones', badgeIdx: 4, route: 'Achievements'},
  {label: 'Leaderboard', desc: 'Compete with friends', badgeIdx: 1, route: 'Leaderboard'},
  {label: 'Settings', desc: 'App preferences', badgeIdx: 2, route: 'Settings'},
  {label: 'Help', desc: 'FAQ & support', badgeIdx: 3, route: 'Help'},
];

function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h) + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function getRandomStats(teamName) {
  const h = hash(teamName);
  return {
    wins: 10 + (h % 25),
    losses: 5 + ((h >> 2) % 15),
    goals: 30 + ((h >> 4) % 50),
    pts: 100 + ((h >> 6) % 200),
  };
}

export default function AccountScreen({navigation}) {
  const insets = useSafeAreaInsets();
  const {userTeams, addTeam, removeTeam} = useContext(UserTeamsContext);
  const {totalPoints} = useContext(BetsContext);
  const {profile, setUserProfile} = useContext(ProfileContext);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [editName, setEditName] = useState('');
  const [editPhotoUri, setEditPhotoUri] = useState('');

  const onNav = n => {
    if (n.route) navigation.navigate(n.route);
  };

  const handleAddTeam = () => {
    addTeam(newTeamName);
    setNewTeamName('');
    setAddModalVisible(false);
  };

  const openProfileEdit = () => {
    setEditName(profile.userName || '');
    setEditPhotoUri(profile.userPhotoUri || '');
    setProfileModalVisible(true);
  };

  const pickPhoto = () => {
    launchImageLibrary({mediaType: 'photo', includeBase64: false}, res => {
      if (res.didCancel) return;
      if (res.errorCode) {
        Alert.alert('Error', res.errorMessage || 'Could not pick image');
        return;
      }
      const uri = res.assets?.[0]?.uri;
      if (uri) setEditPhotoUri(uri);
    });
  };

  const saveProfile = () => {
    setUserProfile(editName.trim(), editPhotoUri);
    setProfileModalVisible(false);
  };

  const resetProfile = () => {
    setUserProfile('', '');
    setEditName('');
    setEditPhotoUri('');
    setProfileModalVisible(false);
  };

  const displayName = profile.userName?.trim() || 'Player';
  const displayPhoto = profile.userPhotoUri;

  return (
    <View style={[st.root, {paddingTop: insets.top}]}>
      <View style={st.header}>
        <Text style={st.title}>Account</Text>
        <TouchableOpacity style={st.profileCard} onPress={openProfileEdit} activeOpacity={0.9}>
          <View style={st.avatarWrap}>
            {displayPhoto ? (
              <Image source={{uri: displayPhoto}} style={st.profileImg} resizeMode="cover" />
            ) : (
              <Image source={require('../assets/profile.png')} style={[st.profileImg, {tintColor: '#fff'}]} resizeMode="cover" />
            )}
          </View>
          <View style={st.profileInfo}>
            <Text style={st.profileName}>{displayName}</Text>
            <Text style={st.profileLevel}>Pro Predictor · Level 12</Text>
            <View style={st.pointsBadge}>
              <Text style={st.pointsText}>{totalPoints.toLocaleString()} pts</Text>
            </View>
          </View>
          <Text style={st.editHint}>Tap to edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={st.scroll} contentContainerStyle={st.scrollCt}>
        <Text style={st.sectionTitle}>My Teams</Text>
        {userTeams.map(team => {
          const stats = getRandomStats(team);
          return (
            <TouchableOpacity key={team} style={st.teamCard} activeOpacity={0.8}>
              <View style={st.teamCardHeader}>
                <TeamInitial teamName={team} size={36} />
                <Text style={st.teamCardName}>{team}</Text>
                <TouchableOpacity
                  style={st.teamRemove}
                  onPress={() => removeTeam(team)}
                  hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                  <Text style={st.teamRemoveText}>✕</Text>
                </TouchableOpacity>
              </View>
              <View style={st.teamStatsRow}>
                <Text style={st.teamStat}>W {stats.wins}</Text>
                <Text style={st.teamStat}>L {stats.losses}</Text>
                <Text style={st.teamStat}>⚽ {stats.goals}</Text>
                <Text style={st.teamStat}>{stats.pts} pts</Text>
              </View>
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity
          style={st.addTeamBtn}
          onPress={() => setAddModalVisible(true)}
          activeOpacity={0.8}>
          <Text style={st.addTeamText}>+ Add Team</Text>
        </TouchableOpacity>

        <Text style={st.sectionTitle}>Your Stats</Text>
        <View style={st.statsGrid}>
          {STATS.map((s, i) => (
            <View key={i} style={st.statCard}>
              <View style={st.statIconWrap}>
                <StatIcon index={s.badgeIdx} size={24} />
              </View>
              <Text style={st.statValue}>{s.value != null ? s.value : `${totalPoints.toLocaleString()} pts`}</Text>
              <Text style={st.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <Text style={st.sectionTitle}>More</Text>
        {MENU_ITEMS.map((item, i) => (
          <TouchableOpacity key={i} style={st.menuRow} activeOpacity={0.7} onPress={() => item.route && navigation.navigate(item.route)}>
            <View style={st.menuIconWrap}>
              <StatIcon index={item.badgeIdx} size={22} />
            </View>
            <View style={st.menuContent}>
              <Text style={st.menuLabel}>{item.label}</Text>
              <Text style={st.menuDesc}>{item.desc}</Text>
            </View>
            <Text style={st.menuArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Modal visible={profileModalVisible} transparent animationType="slide">
        <View style={st.modalOverlay}>
          <View style={st.modalBox}>
            <Text style={st.modalTitle}>Edit Profile</Text>
            <TouchableOpacity style={st.photoPicker} onPress={pickPhoto}>
              {editPhotoUri ? (
                <Image source={{uri: editPhotoUri}} style={st.previewImg} resizeMode="cover" />
              ) : (
                <View style={st.photoPlaceholder}>
                  <Text style={st.photoPlaceholderText}>+ Photo</Text>
                </View>
              )}
            </TouchableOpacity>
            <TextInput
              style={st.modalInput}
              placeholder="Your name"
              placeholderTextColor="#666"
              value={editName}
              onChangeText={setEditName}
              autoCapitalize="words"
            />
            <TouchableOpacity style={st.resetBtn} onPress={resetProfile}>
              <Text style={st.resetBtnText}>Reset profile</Text>
            </TouchableOpacity>
            <View style={st.modalActions}>
              <TouchableOpacity style={st.modalCancel} onPress={() => setProfileModalVisible(false)}>
                <Text style={st.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={st.modalAdd} onPress={saveProfile}>
                <Text style={st.modalAddText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={addModalVisible} transparent animationType="slide">
        <View style={st.modalOverlay}>
          <View style={st.modalBox}>
            <Text style={st.modalTitle}>Add Team</Text>
            <TextInput
              style={st.modalInput}
              placeholder="Team name"
              placeholderTextColor="#666"
              value={newTeamName}
              onChangeText={setNewTeamName}
              autoCapitalize="words"
            />
            <View style={st.modalActions}>
              <TouchableOpacity style={st.modalCancel} onPress={() => {setAddModalVisible(false); setNewTeamName('');}}>
                <Text style={st.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={st.modalAdd} onPress={handleAddTeam}>
                <Text style={st.modalAddText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={[st.bottomNav, {paddingBottom: insets.bottom || 16}]}>
        {NAV_ITEMS.map((n, i) =>
          n.center ? (
            <TouchableOpacity key={i} style={st.navCenter} onPress={() => onNav(n)}>
              <NavIcon index={2} size={28} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity key={i} style={st.navItem} onPress={() => onNav(n)}>
              <NavIcon index={n.idx} size={28} tintColor={n.label === 'Account' ? '#CC342D' : undefined} />
              <Text style={[st.navLabel, n.label === 'Account' && st.navLabelActive]}>{n.label}</Text>
            </TouchableOpacity>
          ),
        )}
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  root: {flex: 1, backgroundColor: '#141214'},
  header: {paddingHorizontal: 14, paddingBottom: 16},
  title: {fontSize: 22, fontWeight: '800', color: '#F4F3F3', marginBottom: 16},
  profileCard: {flexDirection: 'row', backgroundColor: '#1B1A1B', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#2A2325', alignItems: 'center'},
  avatarWrap: {width: 64, height: 64, marginRight: 14, borderRadius: 32, overflow: 'hidden'},
  profileImg: {width: 64, height: 64},
  editHint: {color: '#B9B6B6', fontSize: 10, marginLeft: 8},
  profileInfo: {flex: 1},
  profileName: {color: '#F4F3F3', fontSize: 18, fontWeight: '700', marginBottom: 2},
  profileLevel: {color: '#B9B6B6', fontSize: 12, marginBottom: 8},
  pointsBadge: {alignSelf: 'flex-start', backgroundColor: 'rgba(53,208,127,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8},
  pointsText: {color: '#35D07F', fontSize: 13, fontWeight: '700'},

  scroll: {flex: 1},
  scrollCt: {paddingHorizontal: 14, paddingBottom: 20},

  sectionTitle: {color: '#B9B6B6', fontSize: 12, fontWeight: '700', letterSpacing: 0.5, marginBottom: 10},
  teamCard: {backgroundColor: '#1B1A1B', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#2A2325'},
  teamCardHeader: {flexDirection: 'row', alignItems: 'center', marginBottom: 10},
  teamCardName: {flex: 1, color: '#F4F3F3', fontSize: 16, fontWeight: '700', marginLeft: 10},
  teamRemove: {width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(204,52,45,0.2)', alignItems: 'center', justifyContent: 'center'},
  teamRemoveText: {color: '#CC342D', fontSize: 14, fontWeight: '700'},
  teamStatsRow: {flexDirection: 'row', gap: 16},
  teamStat: {color: '#B9B6B6', fontSize: 12, fontWeight: '600'},
  addTeamBtn: {backgroundColor: 'rgba(204,52,45,0.2)', borderRadius: 12, padding: 14, marginBottom: 24, borderWidth: 1, borderColor: '#CC342D', borderStyle: 'dashed', alignItems: 'center'},
  addTeamText: {color: '#CC342D', fontSize: 14, fontWeight: '700'},
  modalOverlay: {flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 24},
  modalBox: {backgroundColor: '#1B1A1B', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#2A2325'},
  modalTitle: {color: '#F4F3F3', fontSize: 18, fontWeight: '700', marginBottom: 16},
  photoPicker: {alignSelf: 'center', marginBottom: 16},
  photoPlaceholder: {width: 80, height: 80, borderRadius: 40, backgroundColor: '#2A2325', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#CC342D', borderStyle: 'dashed'},
  photoPlaceholderText: {color: '#CC342D', fontSize: 12, fontWeight: '600'},
  previewImg: {width: 80, height: 80, borderRadius: 40},
  modalInput: {backgroundColor: '#222022', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, color: '#F4F3F3', fontSize: 16, marginBottom: 12, borderWidth: 1, borderColor: '#2A2325'},
  resetBtn: {alignSelf: 'flex-start', paddingVertical: 8, paddingHorizontal: 0, marginBottom: 16},
  resetBtnText: {color: '#CC342D', fontSize: 13, fontWeight: '600'},
  modalActions: {flexDirection: 'row', gap: 12, justifyContent: 'flex-end'},
  modalCancel: {paddingHorizontal: 20, paddingVertical: 10},
  modalCancelText: {color: '#B9B6B6', fontSize: 14, fontWeight: '600'},
  modalAdd: {backgroundColor: '#CC342D', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 10},
  modalAddText: {color: '#fff', fontSize: 14, fontWeight: '700'},
  statsGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24},
  statCard: {width: '47%', backgroundColor: '#1B1A1B', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#2A2325'},
  statIconWrap: {marginBottom: 6},
  statValue: {color: '#F4F3F3', fontSize: 14, fontWeight: '800', marginBottom: 2},
  statLabel: {color: '#B9B6B6', fontSize: 10, fontWeight: '600'},

  menuRow: {flexDirection: 'row', alignItems: 'center', backgroundColor: '#1B1A1B', borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#2A2325'},
  menuIconWrap: {marginRight: 12},
  menuContent: {flex: 1},
  menuLabel: {color: '#F4F3F3', fontSize: 14, fontWeight: '600'},
  menuDesc: {color: '#B9B6B6', fontSize: 11, marginTop: 2},
  menuArrow: {color: '#B9B6B6', fontSize: 18, fontWeight: '300'},

  bottomNav: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', backgroundColor: '#1B1A1B', borderTopWidth: 1, borderTopColor: '#2A2325', paddingTop: 8},
  navItem: {alignItems: 'center', gap: 4, minWidth: 52},
  navCenter: {width: 56, height: 56, borderRadius: 28, backgroundColor: '#AF1E20', alignItems: 'center', justifyContent: 'center', marginTop: -22, borderWidth: 3, borderColor: '#141214'},
  navLabel: {color: '#B9B6B6', fontSize: 10, fontWeight: '500'},
  navLabelActive: {color: '#CC342D'},
});
