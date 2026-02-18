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
import ConfirmModal from './ConfirmModal';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {launchImageLibrary} from 'react-native-image-picker';
import {UserTeamsContext, ProfileContext} from '../App';
import TeamInitial from './TeamInitial';
import {StatIcon, CloseIcon, ChevronRightIcon, GoalIcon} from './DrawnBadge';

const MENU_ITEMS = [
  {label: 'Achievements', desc: 'Badges & milestones', badgeIdx: 4, route: 'Achievements'},
  {label: 'Leaderboard', desc: 'Teams by rating', badgeIdx: 1, route: 'Leaderboard'},
  {label: 'Team Training', desc: 'Train muscle groups', badgeIdx: 2, route: 'TeamTraining'},
  {label: 'Settings', desc: 'App preferences', badgeIdx: 2, route: 'Settings'},
  {label: 'Support', desc: 'FAQ & how-to', badgeIdx: 3, route: 'Help'},
];

export default function AccountScreen({navigation}) {
  const insets = useSafeAreaInsets();
  const {userTeams, teamStats, teamTraining, matchHistory, addTeam, removeTeam, getBaseTeamStats, getRating, getStrength, getLeadership, resetAllData} = useContext(UserTeamsContext);
  const {profile, setUserProfile} = useContext(ProfileContext);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [resetModalVisible, setResetModalVisible] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [editName, setEditName] = useState('');
  const [editPhotoUri, setEditPhotoUri] = useState('');

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

  const totalWins = matchHistory.filter(m => m.result === 'win').length;
  const totalMatches = matchHistory.length;

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
            <Text style={st.profileLevel}>Match Simulator</Text>
            <View style={st.pointsBadge}>
              <Text style={st.pointsText}>{totalWins} wins · {totalMatches} matches</Text>
            </View>
          </View>
          <Text style={st.editHint}>Tap to edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={st.scroll} contentContainerStyle={st.scrollCt}>
        <Text style={st.sectionTitle}>My Teams</Text>
        {userTeams.map(team => {
          const base = getBaseTeamStats(team);
          const stats = {...base, ...(teamStats[team] || {})};
          const rating = getRating(stats);
          const strength = getStrength ? getStrength(stats, teamTraining[team] || {}) : (stats.strength ?? 50);
          const leadership = getLeadership ? getLeadership(stats) : (stats.leadership ?? 1);
          return (
            <TouchableOpacity key={team} style={st.teamCard} activeOpacity={0.8} onPress={() => navigation.navigate('Play')}>
              <View style={st.teamCardHeader}>
                <TeamInitial teamName={team} size={36} />
                <Text style={st.teamCardName}>{team}</Text>
                <TouchableOpacity
                  style={st.teamRemove}
                  onPress={() => removeTeam(team)}
                  hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                  <CloseIcon size={16} />
                </TouchableOpacity>
              </View>
              <View style={st.teamStatsRow}>
                <Text style={st.teamStat}>W {stats.wins ?? 0}</Text>
                <Text style={st.teamStat}>D {stats.draws ?? 0}</Text>
                <Text style={st.teamStat}>L {stats.losses ?? 0}</Text>
                <View style={st.teamStatRow}>
                  <GoalIcon size={12} />
                  <Text style={st.teamStat}>{stats.goalsScored ?? 0}</Text>
                </View>
                <Text style={st.teamStat}>{rating} pts</Text>
              </View>
              <Text style={st.teamStatHint}>A:{stats.attack ?? 0} D:{stats.defense ?? 0} F:{stats.form ?? 0} · P:{strength} L:{leadership}</Text>
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity
          style={st.addTeamBtn}
          onPress={() => setAddModalVisible(true)}
          activeOpacity={0.8}>
          <Text style={st.addTeamText}>+ Add Team</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={st.resetDataBtn}
          onPress={() => setResetModalVisible(true)}
          activeOpacity={0.8}>
          <Text style={st.resetDataText}>Reset data</Text>
          <Text style={st.resetDataHint}>Clear all teams, matches, stats & profile</Text>
        </TouchableOpacity>

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
            <ChevronRightIcon size={18} />
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

      <ConfirmModal
        visible={resetModalVisible}
        title="Reset data"
        message="This will clear all app data (teams, match history, stats, profile, settings). Continue?"
        buttonText="Reset"
        onClose={() => setResetModalVisible(false)}
        onConfirm={() => {
          resetAllData();
          setResetModalVisible(false);
        }}
      />
      <View style={{height: insets.bottom || 16}} />
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
  teamStatsRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 12, alignItems: 'center'},
  teamStatRow: {flexDirection: 'row', alignItems: 'center', gap: 4},
  teamStat: {color: '#B9B6B6', fontSize: 12, fontWeight: '600'},
  teamStatHint: {color: '#666', fontSize: 10, marginTop: 4},
  addTeamBtn: {backgroundColor: 'rgba(204,52,45,0.2)', borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#CC342D', borderStyle: 'dashed', alignItems: 'center'},
  addTeamText: {color: '#CC342D', fontSize: 14, fontWeight: '700'},
  resetDataBtn: {backgroundColor: 'rgba(204,52,45,0.15)', borderRadius: 14, padding: 20, marginBottom: 24, borderWidth: 2, borderColor: '#CC342D', alignItems: 'center'},
  resetDataText: {color: '#CC342D', fontSize: 18, fontWeight: '800'},
  resetDataHint: {color: '#B9B6B6', fontSize: 12, marginTop: 6},
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

  menuRow: {flexDirection: 'row', alignItems: 'center', backgroundColor: '#1B1A1B', borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#2A2325'},
  menuIconWrap: {marginRight: 12},
  menuContent: {flex: 1},
  menuLabel: {color: '#F4F3F3', fontSize: 14, fontWeight: '600'},
  menuDesc: {color: '#B9B6B6', fontSize: 11, marginTop: 2},
});
