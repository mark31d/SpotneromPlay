import React, {useState, useEffect} from 'react';
import {View, Text, TouchableOpacity, ScrollView, Switch, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ConfirmModal from './ConfirmModal';

const STORAGE_SETTINGS = '@sportera_settings';

export default function SettingsScreen({navigation}) {
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState(true);
  const [clearModal, setClearModal] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_SETTINGS).then(raw => {
      if (raw) try {
        const s = JSON.parse(raw);
        if (s.notifications !== undefined) setNotifications(s.notifications);
      } catch (_) {}
    });
  }, []);

  const toggleNotifications = v => {
    setNotifications(v);
    AsyncStorage.setItem(STORAGE_SETTINGS, JSON.stringify({notifications: v}));
    if (v) {
      setClearModal({title: 'Notifications', message: 'You will receive alerts for live matches and bet results. Manage permissions in device Settings.'});
    }
  };

  const handleClearCache = () => {
    setClearModal({
      title: 'Clear cache',
      message: 'This will clear all app data (teams, bets, profile, settings). Continue?',
      buttonText: 'Clear',
      onConfirm: () => {
        AsyncStorage.clear().then(() => {
          setClearModal({title: 'Cache cleared', message: 'All app data has been cleared. Restart the app to apply.'});
        });
      },
    });
  };

  return (
    <View style={[st.root, {paddingTop: insets.top}]}>
      <View style={st.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={st.backBtn}>
          <Text style={st.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={st.title}>Settings</Text>
      </View>
      <ScrollView style={st.scroll} contentContainerStyle={st.scrollCt}>
        <Text style={st.subtitle}>App preferences</Text>
        <View style={st.section}>
          <Text style={st.sectionTitle}>General</Text>
          <View style={st.row}>
            <View style={st.rowLeft}>
              <Text style={st.rowLabel}>Notifications</Text>
              <Text style={st.rowHint}>Match alerts, bet results</Text>
            </View>
            <Switch value={notifications} onValueChange={toggleNotifications} trackColor={{false: '#2A2325', true: '#CC342D'}} thumbColor="#fff" />
          </View>
        </View>
        <View style={st.section}>
          <Text style={st.sectionTitle}>Data</Text>
          <TouchableOpacity style={st.row} onPress={handleClearCache} activeOpacity={0.8}>
            <Text style={st.rowLabel}>Clear cache</Text>
            <Text style={st.rowArrow}>›</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {clearModal && (
        <ConfirmModal
          visible={!!clearModal}
          title={clearModal.title}
          message={clearModal.message}
          buttonText={clearModal.buttonText || 'OK'}
          onClose={() => setClearModal(null)}
          onConfirm={clearModal.onConfirm}
        />
      )}
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
  subtitle: {color: '#B9B6B6', fontSize: 13, marginBottom: 16},
  section: {marginBottom: 24},
  sectionTitle: {color: '#B9B6B6', fontSize: 11, fontWeight: '700', letterSpacing: 0.5, marginBottom: 10},
  row: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#1B1A1B', borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#2A2325'},
  rowLeft: {flex: 1},
  rowLabel: {color: '#F4F3F3', fontSize: 15, fontWeight: '600'},
  rowHint: {color: '#B9B6B6', fontSize: 11, marginTop: 2},
  rowArrow: {color: '#B9B6B6', fontSize: 18},
});
