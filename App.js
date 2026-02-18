import React, {createContext, useState, useEffect} from 'react';
import {StatusBar, View, Image} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Loader from './Components/Loader';
import OnboardingScreen from './Components/OnboardingScreen';
import MainMenuScreen from './Components/MainMenuScreen';
import PlayScreen from './Components/PlayScreen';
import MatchHistoryScreen from './Components/MatchHistoryScreen';
import AccountScreen from './Components/AccountScreen';
import AchievementsScreen from './Components/AchievementsScreen';
import LeaderboardScreen from './Components/LeaderboardScreen';
import TeamStatsScreen from './Components/TeamStatsScreen';
import TeamTrainingScreen from './Components/TeamTrainingScreen';
import SettingsScreen from './Components/SettingsScreen';
import HelpScreen from './Components/HelpScreen';
import MatchDetailScreen from './Components/MatchDetailScreen';

const NAV_ICONS = require('./assets/nav_icons.png');
const STATS_ICON = require('./assets/stats.png');

export const UserTeamsContext = createContext();
export const ProfileContext = createContext();

const STORAGE_TEAMS = '@sportera_user_teams';
const STORAGE_TEAM_STATS = '@sportera_team_stats';
const STORAGE_TEAM_TRAINING = '@sportera_team_training';
const STORAGE_TRAINING_COOLDOWN = '@sportera_training_cooldown';
const STORAGE_PROFILE = '@sportera_profile';
const TRAINING_COOLDOWN_MS = 60 * 1000;
const STORAGE_MATCH_HISTORY = '@sportera_match_history';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabIcon({focused, index}) {
  const size = 28;
  return (
    <View style={{width: size, height: size, overflow: 'hidden'}}>
      <Image
        source={NAV_ICONS}
        style={[
          {position: 'absolute', width: 5 * size, height: size, left: -index * size, top: 0},
          focused && {tintColor: '#CC342D'},
        ]}
        resizeMode="stretch"
      />
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {backgroundColor: '#1B1A1B', borderTopColor: '#2A2325'},
        tabBarActiveTintColor: '#CC342D',
        tabBarInactiveTintColor: '#B9B6B6',
        tabBarLabelStyle: {fontSize: 10, fontWeight: '500'},
      }}>
      <Tab.Screen name="MainMenu" component={MainMenuScreen} options={{title: 'Home', tabBarIcon: ({focused}) => <TabIcon focused={focused} index={0} />}} />
      <Tab.Screen name="Play" component={PlayScreen} options={{title: 'Play', tabBarIcon: ({focused}) => <TabIcon focused={focused} index={1} />}} />
      <Tab.Screen name="TeamStats" component={TeamStatsScreen} options={{title: 'Stats', tabBarIcon: ({focused, color}) => <Image source={STATS_ICON} style={{width: 28, height: 28, tintColor: color}} resizeMode="contain" />}} />
      <Tab.Screen name="MatchHistory" component={MatchHistoryScreen} options={{title: 'History', tabBarIcon: ({focused}) => <TabIcon focused={focused} index={3} />}} />
      <Tab.Screen name="Account" component={AccountScreen} options={{title: 'Account', tabBarIcon: ({focused}) => <TabIcon focused={focused} index={4} />}} />
    </Tab.Navigator>
  );
}

const navTheme = {
  dark: true,
  colors: {
    primary: '#CC342D',
    background: '#141214',
    card: '#1B1A1B',
    text: '#F4F3F3',
    border: 'transparent',
    notification: '#CC342D',
  },
  fonts: {
    regular: {fontFamily: 'System', fontWeight: '400'},
    medium: {fontFamily: 'System', fontWeight: '500'},
    bold: {fontFamily: 'System', fontWeight: '700'},
    heavy: {fontFamily: 'System', fontWeight: '900'},
  },
};

function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h) + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function getBaseTeamStats(teamName) {
  const h = hash(teamName);
  return {
    wins: 0,
    losses: 0,
    draws: 0,
    goalsScored: 0,
    goalsConceded: 0,
    attack: Math.min(5, Math.floor(h % 4)),
    defense: Math.min(5, Math.floor((h >> 2) % 4)),
    form: Math.min(5, Math.floor((h >> 4) % 4)),
    strength: 50,
    leadership: 1,
  };
}

function getRating(stats) {
  return (stats.wins || 0) * 3 + (stats.draws || 0);
}

function getStrength(stats, training = {}) {
  const base = (stats.attack ?? 0) * 6 + (stats.defense ?? 0) * 6 + (stats.form ?? 0) * 6;
  const train = (training.legs ?? 0) + (training.core ?? 0) + (training.cardio ?? 0) + (training.power ?? 0);
  return Math.min(100, Math.max(10, base + train * 2));
}

function getLeadership(stats) {
  const wins = stats.wins ?? 0;
  const form = stats.form ?? 0;
  return Math.min(10, Math.max(1, 1 + Math.floor(wins / 3) + form));
}

export default function App() {
  const [booting, setBooting] = useState(true);
  const [userTeams, setUserTeams] = useState([]);
  const [teamStats, setTeamStats] = useState({});
  const [teamTraining, setTeamTraining] = useState({});
  const [matchHistory, setMatchHistory] = useState([]);
  const [profile, setProfile] = useState({userName: '', userPhotoUri: ''});

  useEffect(() => {
    const t = setTimeout(() => setBooting(false), 4000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_TEAMS).then(raw => {
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          setUserTeams(Array.isArray(parsed) ? parsed : []);
        } catch (_) {}
      }
    });
  }, []);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_TEAM_STATS).then(raw => {
      if (raw) {
        try {
          setTeamStats(JSON.parse(raw));
        } catch (_) {}
      }
    });
  }, []);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_TEAM_TRAINING).then(raw => {
      if (raw) {
        try {
          setTeamTraining(JSON.parse(raw));
        } catch (_) {}
      }
    });
  }, []);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_MATCH_HISTORY).then(raw => {
      if (raw) {
        try {
          setMatchHistory(JSON.parse(raw));
        } catch (_) {}
      }
    });
  }, []);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_PROFILE).then(raw => {
      if (raw) {
        try {
          setProfile(JSON.parse(raw));
        } catch (_) {}
      }
    });
  }, []);

  useEffect(() => {
    if (userTeams.length === 0) return;
    setTeamStats(prev => {
      let changed = false;
      const next = {...prev};
      userTeams.forEach(name => {
        if (!next[name]) {
          next[name] = getBaseTeamStats(name);
          changed = true;
        }
      });
      if (changed) AsyncStorage.setItem(STORAGE_TEAM_STATS, JSON.stringify(next));
      return changed ? next : prev;
    });
    setTeamTraining(prev => {
      let changed = false;
      const next = {...prev};
      userTeams.forEach(name => {
        if (!next[name]) {
          next[name] = {legs: 0, core: 0, cardio: 0, power: 0};
          changed = true;
        }
      });
      if (changed) AsyncStorage.setItem(STORAGE_TEAM_TRAINING, JSON.stringify(next));
      return changed ? next : prev;
    });
  }, [userTeams]);

  const setUserProfile = (name, photoUri) => {
    const next = {userName: name || '', userPhotoUri: photoUri || ''};
    setProfile(next);
    AsyncStorage.setItem(STORAGE_PROFILE, JSON.stringify(next));
  };

  const addTeam = name => {
    const trimmed = (name || '').trim();
    if (!trimmed) return;
    setUserTeams(prev => {
      if (prev.some(t => t.toLowerCase() === trimmed.toLowerCase())) return prev;
      const next = [...prev, trimmed];
      AsyncStorage.setItem(STORAGE_TEAMS, JSON.stringify(next));
      return next;
    });
    setTeamStats(prev => {
      const next = {...prev, [trimmed]: getBaseTeamStats(trimmed)};
      AsyncStorage.setItem(STORAGE_TEAM_STATS, JSON.stringify(next));
      return next;
    });
    setTeamTraining(prev => {
      const next = {...prev, [trimmed]: {legs: 0, core: 0, cardio: 0, power: 0}};
      AsyncStorage.setItem(STORAGE_TEAM_TRAINING, JSON.stringify(next));
      return next;
    });
  };

  const updateTeamTraining = (teamName, key, delta) => {
    setTeamTraining(prev => {
      const cur = prev[teamName] || {legs: 0, core: 0, cardio: 0, power: 0};
      const next = {...prev, [teamName]: {...cur, [key]: Math.min(20, Math.max(0, (cur[key] ?? 0) + delta))}};
      AsyncStorage.setItem(STORAGE_TEAM_TRAINING, JSON.stringify(next));
      return next;
    });
  };

  const [trainingCooldowns, setTrainingCooldowns] = useState({});
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_TRAINING_COOLDOWN).then(raw => {
      if (raw) try { setTrainingCooldowns(JSON.parse(raw)); } catch (_) {}
    });
  }, []);
  const setTrainingCooldown = (teamName) => {
    const until = Date.now() + TRAINING_COOLDOWN_MS;
    setTrainingCooldowns(prev => {
      const next = {...prev, [teamName]: until};
      AsyncStorage.setItem(STORAGE_TRAINING_COOLDOWN, JSON.stringify(next));
      return next;
    });
  };

  const removeTeam = name => {
    setUserTeams(prev => {
      const next = prev.filter(t => t !== name);
      AsyncStorage.setItem(STORAGE_TEAMS, JSON.stringify(next));
      return next;
    });
    setTeamStats(prev => {
      const next = {...prev};
      delete next[name];
      AsyncStorage.setItem(STORAGE_TEAM_STATS, JSON.stringify(next));
      return next;
    });
    setTeamTraining(prev => {
      const next = {...prev};
      delete next[name];
      AsyncStorage.setItem(STORAGE_TEAM_TRAINING, JSON.stringify(next));
      return next;
    });
    setTrainingCooldowns(prev => {
      const next = {...prev};
      delete next[name];
      AsyncStorage.setItem(STORAGE_TRAINING_COOLDOWN, JSON.stringify(next));
      return next;
    });
  };

  const recordMatch = (homeTeam, awayName, homeScore, awayScore, result, matchStats) => {
    const entry = {
      id: Date.now().toString(),
      homeTeam,
      awayName,
      homeScore,
      awayScore,
      result,
      date: new Date().toISOString(),
      matchStats: matchStats || null,
    };
    setMatchHistory(prev => {
      const next = [entry, ...prev];
      AsyncStorage.setItem(STORAGE_MATCH_HISTORY, JSON.stringify(next));
      return next;
    });

    setTeamStats(prev => {
      const s = prev[homeTeam] || getBaseTeamStats(homeTeam);
      const next = {...prev, [homeTeam]: {
        ...s,
        wins: (s.wins || 0) + (result === 'win' ? 1 : 0),
        losses: (s.losses || 0) + (result === 'loss' ? 1 : 0),
        draws: (s.draws || 0) + (result === 'draw' ? 1 : 0),
        goalsScored: (s.goalsScored || 0) + homeScore,
        goalsConceded: (s.goalsConceded || 0) + awayScore,
      }};
      AsyncStorage.setItem(STORAGE_TEAM_STATS, JSON.stringify(next));
      return next;
    });
  };

  const resetAllData = () => {
    AsyncStorage.clear();
    setUserTeams([]);
    setTeamStats({});
    setTeamTraining({});
    setMatchHistory([]);
    setProfile({userName: '', userPhotoUri: ''});
  };

  if (booting) {
    return (
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor="#141214" />
        <Loader />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <ProfileContext.Provider value={{profile, setUserProfile}}>
      <UserTeamsContext.Provider value={{
        userTeams,
        teamStats,
        teamTraining,
        matchHistory,
        addTeam,
        removeTeam,
        getBaseTeamStats,
        getRating,
        getStrength,
        getLeadership,
        recordMatch,
        resetAllData,
        updateTeamTraining,
        trainingCooldowns,
        setTrainingCooldown,
        trainingCooldownMs: TRAINING_COOLDOWN_MS,
      }}>
        <StatusBar barStyle="light-content" backgroundColor="#141214" />
        <NavigationContainer theme={navTheme}>
          <Stack.Navigator
            initialRouteName="Onboarding"
            screenOptions={{headerShown: false, animation: 'fade'}}>
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="Achievements" component={AchievementsScreen} />
            <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
            <Stack.Screen name="TeamTraining" component={TeamTrainingScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="Help" component={HelpScreen} />
            <Stack.Screen name="MatchDetail" component={MatchDetailScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </UserTeamsContext.Provider>
      </ProfileContext.Provider>
    </SafeAreaProvider>
  );
}
