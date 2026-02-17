import React from 'react';
import {View, ImageBackground, Image, StyleSheet} from 'react-native';
import WebView from 'react-native-webview';

const SPINNER_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      width: 100%;
      height: 100%;
      background: transparent;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .spinner-wrap {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
    }
    .spinner {
      position: relative;
      width: 1px;
      height: 130px;
      margin-left: -250px;
      margin-top: -250px;
    }
    .spinner span {
      position: absolute;
      top: 50%;
      width: 72px;
      height: 14px;
      background: #CC342D;
      animation: dominos 1s ease infinite;
      box-shadow: 2px 2px 5px 0px rgba(0,0,0,0.3);
    }
    .spinner span:nth-child(1) { left: 168px; animation-delay: 0.125s; }
    .spinner span:nth-child(2) { left: 147px; animation-delay: 0.3s; }
    .spinner span:nth-child(3) { left: 126px; animation-delay: 0.425s; }
    .spinner span:nth-child(4) { left: 105px; animation-delay: 0.54s; }
    .spinner span:nth-child(5) { left: 84px; animation-delay: 0.665s; }
    .spinner span:nth-child(6) { left: 63px; animation-delay: 0.79s; }
    .spinner span:nth-child(7) { left: 42px; animation-delay: 0.915s; }
    .spinner span:nth-child(8) { left: 21px; }
    @keyframes dominos {
      50% { opacity: 0.7; }
      75% { transform: rotate(90deg); }
      80% { opacity: 1; }
    }
  </style>
</head>
<body>
  <div class="spinner-wrap">
  <div class="spinner">
    <span></span>
    <span></span>
    <span></span>
    <span></span>
    <span></span>
    <span></span>
    <span></span>
    <span></span>
  </div>
  </div>
</body>
</html>
`;

export default function Loader() {
  return (
    <ImageBackground
      source={require('../assets/funnel_bg.png')}
      style={s.bg}
      resizeMode="cover">
      <View style={s.overlay}>
        <Image
          source={require('../assets/logo_sportera_play.png')}
          style={s.logo}
          resizeMode="contain"
        />
        <WebView
          source={{html: SPINNER_HTML}}
          style={s.webview}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          originWhitelist={['*']}
        />
      </View>
    </ImageBackground>
  );
}

const s = StyleSheet.create({
  bg: {flex: 1},
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(20,18,20,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 120,
  },
  logo: {
    width: 340,
    height: 150,
    marginBottom: 24,
    alignSelf: 'center',
  },
  webview: {
    width: 320,
    height: 200,
    backgroundColor: 'transparent',
  },
});
