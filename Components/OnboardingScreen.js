import React, {useState} from 'react';
import {
  View,
  Text,
  ImageBackground,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const SLIDES = [
  {title: 'Welcome to Spotnerom Play', sub: 'Simulate matches. Build rating. Compete on the leaderboard.'},
  {title: 'Match Simulator', sub: 'Choose your team and opponent. Matches are simulated by attack, defense and form.'},
  {title: 'Rating & Stats', sub: 'Teams earn rating from wins and draws. Track history, goals, W/D/L.'},
  {title: 'Get Started', sub: 'Play: simulate a match. History: past results. Account: manage teams. Settings: Support & preferences. Leaderboard: rank by rating.'},
];

export default function OnboardingScreen({navigation}) {
  const [idx, setIdx] = useState(0);
  const insets = useSafeAreaInsets();
  const isLast = idx === SLIDES.length - 1;

  const next = () => {
    if (isLast) {
      navigation.replace('MainTabs');
    } else {
      setIdx(idx + 1);
    }
  };

  return (
    <ImageBackground
      source={require('../assets/funnel_bg.png')}
      style={s.bg}
      resizeMode="cover">
      <View style={[s.overlay, {paddingTop: insets.top}]}>
        <TouchableOpacity
          style={s.skipBtn}
          onPress={() => navigation.replace('MainTabs')}>
          <Text style={s.skipText}>Skip</Text>
        </TouchableOpacity>

        <View style={s.center}>
          <Image
            source={require('../assets/logo_sportera_play.png')}
            style={s.logo}
            resizeMode="contain"
          />
          <Text style={s.title}>{SLIDES[idx].title}</Text>
          <Text style={s.sub}>{SLIDES[idx].sub}</Text>
        </View>

        <View style={s.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[s.dot, i === idx && s.dotActive]}
            />
          ))}
        </View>

        <TouchableOpacity style={s.cta} onPress={next} activeOpacity={0.8}>
          <Text style={s.ctaText}>{isLast ? 'Get Started' : 'Next'}</Text>
        </TouchableOpacity>

        <View style={{height: insets.bottom + 20}} />
      </View>
    </ImageBackground>
  );
}

const s = StyleSheet.create({
  bg: {flex: 1},
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(20,18,20,0.45)',
  },
  skipBtn: {alignSelf: 'flex-end', padding: 16},
  skipText: {color: '#B9B6B6', fontSize: 14, fontWeight: '500'},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32},
  logo: {width: 280, height: 130, marginBottom: 40},
  title: {
    color: '#F4F3F3',
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
  },
  sub: {
    color: 'rgba(244,243,243,0.55)',
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 26,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 28,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  dotActive: {
    backgroundColor: '#CC342D',
    width: 36,
    borderRadius: 6,
  },
  cta: {
    marginHorizontal: 32,
    backgroundColor: '#AF1E20',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#AF1E20',
    shadowOpacity: 0.45,
    shadowRadius: 24,
    shadowOffset: {width: 0, height: 4},
    elevation: 8,
  },
  ctaText: {color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.5},
});
