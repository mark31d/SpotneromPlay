import React, {useState, useEffect} from 'react';
import {View, Text, TouchableOpacity, ScrollView, Switch, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ChevronRightIcon} from './DrawnBadge';

const STORAGE_SETTINGS = '@sportera_settings';

export default function SettingsScreen({navigation}) {
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState(true);
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
              <Text style={st.rowHint}>Match alerts, simulation results</Text>
            </View>
            <Switch value={notifications} onValueChange={toggleNotifications} trackColor={{false: '#2A2325', true: '#CC342D'}} thumbColor="#fff" />
          </View>
        </View>
        <View style={st.section}>
          <Text style={st.sectionTitle}>Support</Text>
          <TouchableOpacity style={st.row} onPress={() => navigation.navigate('Help')} activeOpacity={0.8}>
            <View style={st.rowLeft}>
              <Text style={st.rowLabel}>Support</Text>
              <Text style={st.rowHint}>FAQ & how-to</Text>
            </View>
            <ChevronRightIcon size={18} />
          </TouchableOpacity>
        </View>
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
  subtitle: {color: '#B9B6B6', fontSize: 13, marginBottom: 16},
  section: {marginBottom: 24},
  sectionTitle: {color: '#B9B6B6', fontSize: 11, fontWeight: '700', letterSpacing: 0.5, marginBottom: 10},
  row: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#1B1A1B', borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#2A2325'},
  rowLeft: {flex: 1},
  rowLabel: {color: '#F4F3F3', fontSize: 15, fontWeight: '600'},
  rowHint: {color: '#B9B6B6', fontSize: 11, marginTop: 2},
});
