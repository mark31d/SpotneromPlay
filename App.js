import React, {useState, useEffect, createContext, useMemo} from 'react';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Loader from './Components/Loader';
import OnboardingScreen from './Components/OnboardingScreen';
import MainMenuScreen from './Components/MainMenuScreen';
import LiveMatchesScreen from './Components/LiveMatchesScreen';
import MatchDetailsScreen from './Components/MatchDetailsScreen';
import OddsMarketsScreen from './Components/OddsMarketsScreen';
import BetslipScreen from './Components/BetslipScreen';
import MyBetsScreen from './Components/MyBetsScreen';
import AccountScreen from './Components/AccountScreen';
import AchievementsScreen from './Components/AchievementsScreen';
import LeaderboardScreen from './Components/LeaderboardScreen';
import SettingsScreen from './Components/SettingsScreen';
import HelpScreen from './Components/HelpScreen';

import {generateMatches} from './data/matches';
import {settleSelection} from './data/betSettlement';

export const BetslipContext = createContext();
export const UserTeamsContext = createContext();
export const MatchesContext = createContext();
export const BetsContext = createContext();
export const ProfileContext = createContext();

const STORAGE_TEAMS = '@sportera_user_teams';
const STORAGE_PROFILE = '@sportera_profile';
const STORAGE_BETS = '@sportera_bet_history';
const BASE_POINTS = 1000;

const Stack = createNativeStackNavigator();

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

export default function App() {
  const [booting, setBooting] = useState(true);
  const [selections, setSelections] = useState([]);
  const [stake, setStake] = useState(0);
  const [userTeams, setUserTeams] = useState([]);
  const [matches, setMatches] = useState(() => generateMatches(8));
  const [betHistory, setBetHistory] = useState([]);
  const [profile, setProfile] = useState({userName: '', userPhotoUri: ''});

  useEffect(() => {
    const t = setTimeout(() => setBooting(false), 4000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_TEAMS).then(raw => {
      if (raw) {
        try {
          setUserTeams(JSON.parse(raw));
        } catch (_) {}
      }
    });
  }, []);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_BETS).then(raw => {
      if (raw) {
        try {
          setBetHistory(JSON.parse(raw));
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

  const setUserProfile = (name, photoUri) => {
    const next = {userName: name || '', userPhotoUri: photoUri || ''};
    setProfile(next);
    AsyncStorage.setItem(STORAGE_PROFILE, JSON.stringify(next));
  };

  const refreshMatches = () => setMatches(generateMatches(8));

  const addBet = (selectionsList, stakeAmount, totalOddsValue) => {
    const allSettled = selectionsList.map(s => {
      const {won} = settleSelection(s.market, s.pickLabel, s.matchId);
      return {selection: s, won};
    });
    const allWon = allSettled.every(x => x.won);
    const returnPts = allWon ? Math.round(stakeAmount * totalOddsValue) : 0;
    const entry = {
      id: Date.now().toString(),
      match: selectionsList[0]?.matchLabel || 'Accumulator',
      pick: selectionsList.map(s => s.pickLabel).join(' + '),
      odd: totalOddsValue,
      stake: stakeAmount,
      status: allWon ? 'won' : 'lost',
      pts: allWon ? returnPts - stakeAmount : -stakeAmount,
    };
    setBetHistory(prev => {
      const next = [entry, ...prev];
      AsyncStorage.setItem(STORAGE_BETS, JSON.stringify(next));
      return next;
    });
  };

  const totalPoints = useMemo(() => {
    return betHistory.reduce((acc, b) => {
      if (b.stake != null) {
        return acc + (b.pts ?? 0);
      }
      if (b.status === 'won') return acc + (b.pts || 0);
      return acc;
    }, BASE_POINTS);
  }, [betHistory]);

  const addTeam = name => {
    const trimmed = (name || '').trim();
    if (!trimmed) return;
    setUserTeams(prev => {
      if (prev.some(t => t.toLowerCase() === trimmed.toLowerCase())) return prev;
      const next = [...prev, trimmed];
      AsyncStorage.setItem(STORAGE_TEAMS, JSON.stringify(next));
      return next;
    });
  };

  const removeTeam = name => {
    setUserTeams(prev => {
      const next = prev.filter(t => t !== name);
      AsyncStorage.setItem(STORAGE_TEAMS, JSON.stringify(next));
      return next;
    });
  };

  const addSelection = (matchId, market, pickLabel, oddValue, matchLabel) => {
    setSelections(prev => {
      const idx = prev.findIndex(
        s => s.matchId === matchId && s.market === market,
      );
      if (idx >= 0) {
        if (prev[idx].pickLabel === pickLabel) {
          return prev.filter((_, i) => i !== idx);
        }
        const updated = [...prev];
        updated[idx] = {...updated[idx], pickLabel, oddValue};
        return updated;
      }
      return [
        ...prev,
        {
          id: Date.now().toString(),
          matchId,
          market,
          pickLabel,
          oddValue,
          matchLabel,
        },
      ];
    });
  };

  const removeSelection = id =>
    setSelections(prev => prev.filter(s => s.id !== id));

  const clearSelections = () => {
    setSelections([]);
    setStake(0);
  };

  const totalOdds =
    selections.length > 0
      ? +selections.reduce((a, s) => a * s.oddValue, 1).toFixed(2)
      : 0;
  const potentialReturn = +(stake * totalOdds).toFixed(2);

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
      <MatchesContext.Provider value={{matches, refreshMatches}}>
      <BetsContext.Provider value={{betHistory, addBet, totalPoints}}>
      <UserTeamsContext.Provider value={{userTeams, addTeam, removeTeam}}>
      <BetslipContext.Provider
        value={{
          selections,
          stake,
          setStake,
          addSelection,
          removeSelection,
          clearSelections,
          totalOdds,
          potentialReturn,
        }}>
        <StatusBar barStyle="light-content" backgroundColor="#141214" />
        <NavigationContainer theme={navTheme}>
          <Stack.Navigator
            initialRouteName="Onboarding"
            screenOptions={{headerShown: false, animation: 'fade'}}>
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="MainMenu" component={MainMenuScreen} />
            <Stack.Screen name="LiveMatches" component={LiveMatchesScreen} />
            <Stack.Screen name="MatchDetails" component={MatchDetailsScreen} />
            <Stack.Screen name="OddsMarkets" component={OddsMarketsScreen} />
            <Stack.Screen name="Betslip" component={BetslipScreen} />
            <Stack.Screen name="MyBets" component={MyBetsScreen} />
            <Stack.Screen name="Account" component={AccountScreen} />
            <Stack.Screen name="Achievements" component={AchievementsScreen} />
            <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="Help" component={HelpScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </BetslipContext.Provider>
      </UserTeamsContext.Provider>
      </BetsContext.Provider>
      </MatchesContext.Provider>
      </ProfileContext.Provider>
    </SafeAreaProvider>
  );
}
