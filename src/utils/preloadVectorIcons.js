import {Platform} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';

/**
 * Registers icon fonts with Core Text before the first React render (iOS).
 * Android ships fonts via assets / fonts.gradle; this is a no-op there.
 * UIAppFonts + linked TTFs (react-native.config.js) provide a fallback when bundled.
 */
export function preloadVectorIcons() {
  if (Platform.OS !== 'ios') {
    return Promise.resolve();
  }

  return Promise.all([
    Ionicons.loadFont(),
    MaterialIcons.loadFont(),
    MaterialCommunityIcons.loadFont(),
    AntDesign.loadFont(),
    EvilIcons.loadFont(),
    SimpleLineIcons.loadFont(),
  ]).catch(err => {
    console.warn('Vector icon preload:', err?.message || err);
  });
}
