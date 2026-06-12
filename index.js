/**
 * @format
 */

import '@react-native-firebase/app';
import 'react-native-gesture-handler';
import notifee, {EventType} from '@notifee/react-native';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import {displayPushNotification} from './src/utils/displayNotification';
import {getMessagingOrNull} from './src/utils/firebaseMessagingSafe';
import {navigateFromNotificationData} from './src/utils/notificationNavigation';
import {preloadVectorIcons} from './src/utils/preloadVectorIcons';

notifee.onBackgroundEvent(async ({type, detail}) => {
  if (type === EventType.PRESS) {
    navigateFromNotificationData(detail?.notification?.data);
  }
});

const messaging = getMessagingOrNull();
if (messaging) {
  messaging.setBackgroundMessageHandler(async remoteMessage => {
    const data = remoteMessage.data || {};
    const notification = remoteMessage.notification || {};
    const title = notification.title || data.title || 'Evenlyo';
    const body =
      notification.body || data.body || data.message || data.bodyText;

    if (body) {
      await displayPushNotification({title, body, data});
    }
  });
}

preloadVectorIcons().finally(() => {
  AppRegistry.registerComponent(appName, () => App);
});
