/**
 * @format
 */

import '@react-native-firebase/app';
import 'react-native-gesture-handler';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import {displayPushNotification} from './src/utils/displayNotification';
import {getMessagingOrNull} from './src/utils/firebaseMessagingSafe';
import {preloadVectorIcons} from './src/utils/preloadVectorIcons';

const messaging = getMessagingOrNull();
if (messaging) {
  messaging.setBackgroundMessageHandler(async remoteMessage => {
    // Data-only messages need a local notification; notification payload is shown by the OS.
    if (remoteMessage.notification) {
      return;
    }
    const data = remoteMessage.data || {};
    const title = data.title || 'Evenlyo';
    const body = data.body || data.message;
    if (body) {
      await displayPushNotification({title, body, data});
    }
  });
}

preloadVectorIcons().finally(() => {
  AppRegistry.registerComponent(appName, () => App);
});
