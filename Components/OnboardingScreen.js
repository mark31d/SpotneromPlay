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
  {title: 'Welcome to Spotnerom Play', sub: 'Live scores. Fast picks. Clean odds.'},
  {title: 'Real-Time Markets', sub: 'Browse odds, pick winners, build your betslip.'},
  {title: 'Track Everything', sub: 'Stats, lineups, head-to-head — all in one place.'},
  {title: 'Easy Navigation', sub: 'Home: main menu. Sports: odds & markets. Betslip: place bets. My Bets: history. Account: teams & stats.'},
];

export default function OnboardingScreen({navigation}) {
  const [idx, setIdx] = useState(0);
  const insets = useSafeAreaInsets();
  const isLast = idx === SLIDES.length - 1;

  const next = () => {
    if (isLast) {
      navigation.replace('MainMenu');
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
          onPress={() => navigation.replace('MainMenu')}>
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
