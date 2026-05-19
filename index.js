/**
 * @format
 */

import 'react-native-gesture-handler';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import {getMessagingOrNull} from './src/utils/firebaseMessagingSafe';
import {preloadVectorIcons} from './src/utils/preloadVectorIcons';

const messaging = getMessagingOrNull();
if (messaging) {
  messaging.setBackgroundMessageHandler(async remoteMessage => {
    console.log('Message handled in the background!', remoteMessage);
  });
}

preloadVectorIcons().finally(() => {
  AppRegistry.registerComponent(appName, () => App);
});
