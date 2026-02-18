import React, {useState, useContext, useEffect, useMemo} from 'react';
import {View, Text, TouchableOpacity, ScrollView, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {UserTeamsContext} from '../App';
import TeamInitial from './TeamInitial';
import {getOpponents} from '../data/simulateMatch';

const SPORTS = [
  {id: 'football', name: 'Football', groups: ['legs', 'core', 'cardio', 'power']},
  {id: 'basketball', name: 'Basketball', groups: ['legs', 'core', 'power']},
  {id: 'hockey', name: 'Hockey', groups: ['legs', 'core', 'cardio', 'power']},
];

const TRAINING_LABELS = {
  legs: {label: 'Legs', desc: 'Sprints, squats', color: '#35D07F'},
  core: {label: 'Core', desc: 'Planks, abs', color: '#4A90E2'},
  cardio: {label: 'Cardio', desc: 'Running, endurance', color: '#F5C542'},
  power: {label: 'Power', desc: 'Explosiveness', color: '#CC342D'},
};

export default function TeamTrainingScreen({navigation}) {
  const insets = useSafeAreaInsets();
  const {userTeams, teamStats, teamTraining, getBaseTeamStats, getStrength, updateTeamTraining, trainingCooldowns = {}, setTrainingCooldown} = useContext(UserTeamsContext);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [sport, setSport] = useState(SPORTS[0]);
  const [cooldownSec, setCooldownSec] = useState(0);

  const opponents = useMemo(() => getOpponents(16, userTeams), [userTeams]);
  const allTeams = useMemo(() => [...userTeams, ...opponents.map(o => o.name)], [userTeams, opponents]);

  const team = selectedTeam || allTeams[0];
  const training = team ? (teamTraining[team] || {legs: 0, core: 0, cardio: 0, power: 0}) : {};
  const isUserTeam = userTeams.includes(team);
  const stats = team ? (isUserTeam ? (teamStats[team] || getBaseTeamStats(team)) : opponents.find(o => o.name === team)) : null;
  const strength = team && stats ? getStrength(stats, training) : 0;

  const cooldownUntil = team ? (trainingCooldowns[team] || 0) : 0;
  const isOnCooldown = cooldownUntil > Date.now();

  useEffect(() => {
    if (!isOnCooldown) {
      setCooldownSec(0);
      return;
    }
    const tick = () => {
      const left = Math.ceil((cooldownUntil - Date.now()) / 1000);
      setCooldownSec(Math.max(0, left));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [cooldownUntil, isOnCooldown]);

  const handleTrain = (key) => {
    if (!team || isOnCooldown) return;
    const gain = 1 + Math.floor(Math.random() * 3);
    updateTeamTraining(team, key, gain);
    setTrainingCooldown(team);
  };

  return (
    <View style={[st.root, {paddingTop: insets.top}]}>
      <View style={st.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={st.backBtn}>
          <Text style={st.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={st.title}>Team Training</Text>
      </View>

      <ScrollView style={st.scroll} contentContainerStyle={st.scrollCt}>
        <Text style={st.sectionLabel}>My teams</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={st.teamRow}>
          {userTeams.map(t => (
            <TouchableOpacity
              key={t}
              style={[st.teamChip, team === t && st.teamChipSel]}
              onPress={() => setSelectedTeam(t)}
              activeOpacity={0.8}>
              <TeamInitial teamName={t} size={32} />
              <Text style={[st.teamChipText, team === t && st.teamChipTextSel]} numberOfLines={1}>{t}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={st.sectionLabel}>Opponents</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={st.teamRow}>
          {opponents.map(o => (
            <TouchableOpacity
              key={o.name}
              style={[st.teamChip, team === o.name && st.teamChipSel, st.teamChipOpponent]}
              onPress={() => setSelectedTeam(o.name)}
              activeOpacity={0.8}>
              <TeamInitial teamName={o.name} size={32} />
              <Text style={[st.teamChipText, team === o.name && st.teamChipTextSel]} numberOfLines={1}>{o.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {allTeams.length === 0 ? (
          <View style={st.empty}>
            <Text style={st.emptyText}>Add teams in Account</Text>
            <TouchableOpacity style={st.ctaBtn} onPress={() => navigation.navigate('Account')}>
              <Text style={st.ctaText}>Add Team</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={st.sectionLabel}>Sport</Text>
            <View style={st.sportRow}>
              {SPORTS.map(s => (
                <TouchableOpacity
                  key={s.id}
                  style={[st.sportBtn, sport.id === s.id && st.sportBtnSel]}
                  onPress={() => setSport(s)}
                  activeOpacity={0.8}>
                  <Text style={[st.sportBtnText, sport.id === s.id && st.sportBtnTextSel]}>{s.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={st.strengthCard}>
              <Text style={st.strengthLabel}>Team strength</Text>
              <Text style={st.strengthVal}>{strength}</Text>
              <View style={st.strengthBar}>
                <View style={[st.strengthFill, {width: `${strength}%`}]} />
              </View>
              {isOnCooldown && (
                <Text style={st.cooldownText}>Next training in {cooldownSec}s</Text>
              )}
            </View>

            <Text style={st.sectionLabel}>Training blocks ({sport.name}) · +1–3 random, 1 min cooldown</Text>
            <View style={st.grid}>
              {sport.groups.map((key, i) => {
                const cfg = TRAINING_LABELS[key];
                const val = training[key] ?? 0;
                return (
                  <TouchableOpacity
                    key={key}
                    style={[st.block, i % 2 === 0 ? st.blockLeft : st.blockRight, isOnCooldown && st.blockDisabled]}
                    onPress={() => handleTrain(key)}
                    disabled={isOnCooldown}
                    activeOpacity={0.8}>
                    <View style={[st.blockIcon, {backgroundColor: cfg.color + '30'}]}>
                      <Text style={[st.blockIconText, {color: cfg.color}]}>{cfg.label[0]}</Text>
                    </View>
                    <Text style={st.blockLabel}>{cfg.label}</Text>
                    <Text style={st.blockDesc}>{cfg.desc}</Text>
                    <Text style={st.blockVal}>{val}/20</Text>
                    <View style={st.blockBar}>
                      <View style={[st.blockBarFill, {width: `${(val / 20) * 100}%`, backgroundColor: cfg.color}]} />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={st.hint}>Tap a block to train (+1–3 random). 1 min cooldown between sessions.</Text>
          </>
        )}
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
  sectionLabel: {color: '#B9B6B6', fontSize: 12, fontWeight: '700', marginBottom: 10, marginTop: 8},
  teamRow: {marginBottom: 20},
  teamChip: {width: 90, alignItems: 'center', backgroundColor: '#1B1A1B', borderRadius: 12, padding: 12, marginRight: 10, borderWidth: 1, borderColor: '#2A2325'},
  teamChipSel: {borderColor: '#CC342D', backgroundColor: 'rgba(204,52,45,0.2)'},
  teamChipText: {color: '#F4F3F3', fontSize: 11, fontWeight: '600', marginTop: 6},
  teamChipTextSel: {color: '#CC342D'},
  teamChipOpponent: {borderColor: '#4A5568'},
  empty: {alignItems: 'center', paddingTop: 40},
  emptyText: {color: '#B9B6B6', fontSize: 14, marginBottom: 20},
  ctaBtn: {backgroundColor: '#CC342D', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12},
  ctaText: {color: '#fff', fontSize: 14, fontWeight: '700'},
  sportRow: {flexDirection: 'row', gap: 10, marginBottom: 20},
  sportBtn: {flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', backgroundColor: '#1B1A1B', borderWidth: 1, borderColor: '#2A2325'},
  sportBtnSel: {borderColor: '#CC342D', backgroundColor: 'rgba(204,52,45,0.2)'},
  sportBtnText: {color: '#B9B6B6', fontSize: 13, fontWeight: '600'},
  sportBtnTextSel: {color: '#CC342D'},
  strengthCard: {backgroundColor: '#1B1A1B', borderRadius: 16, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: '#2A2325'},
  strengthLabel: {color: '#B9B6B6', fontSize: 12, fontWeight: '600', marginBottom: 4},
  strengthVal: {color: '#35D07F', fontSize: 28, fontWeight: '800'},
  strengthBar: {height: 8, backgroundColor: '#2A2325', borderRadius: 4, marginTop: 12, overflow: 'hidden'},
  strengthFill: {height: '100%', backgroundColor: '#35D07F', borderRadius: 4},
  cooldownText: {color: '#F5C542', fontSize: 12, fontWeight: '600', marginTop: 10},
  grid: {flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6},
  blockDisabled: {opacity: 0.5},
  block: {width: '50%', padding: 6, marginBottom: 12},
  blockLeft: {paddingRight: 3},
  blockRight: {paddingLeft: 3},
  blockIcon: {width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 8},
  blockIconText: {fontSize: 18, fontWeight: '800'},
  blockLabel: {color: '#F4F3F3', fontSize: 14, fontWeight: '700', marginBottom: 2},
  blockDesc: {color: '#B9B6B6', fontSize: 10, marginBottom: 8},
  blockVal: {color: '#35D07F', fontSize: 12, fontWeight: '700', marginBottom: 4},
  blockBar: {height: 4, backgroundColor: '#2A2325', borderRadius: 2, overflow: 'hidden'},
  blockBarFill: {height: '100%', borderRadius: 2},
  hint: {color: '#666', fontSize: 11, marginTop: 16, lineHeight: 16},
});
