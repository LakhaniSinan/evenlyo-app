import {useEffect} from 'react';
import {helper} from '../helper';
import {displayPushNotification} from '../utils/displayNotification';
import {getMessagingOrNull} from '../utils/firebaseMessagingSafe';

const useFirebaseMessaging = () => {
  useEffect(() => {
    const msg = getMessagingOrNull();
    if (!msg) {
      return undefined;
    }

    msg.getInitialNotification().catch(console.error);

    const unsubscribeOpened = msg.onNotificationOpenedApp(() => {});

    const unsubscribeForeground = msg.onMessage(async remoteMessage => {
      const notification = remoteMessage.notification || {};
      const data = remoteMessage.data || {};
      const title =
        notification.title || data.title || 'Evenlyo';
      const body =
        notification.body || data.body || data.message || 'New notification';

      try {
        await displayPushNotification({title, body, data});
      } catch (error) {
        console.log('displayPushNotification error:', error);
      }
    });

    return () => {
      unsubscribeOpened();
      unsubscribeForeground();
    };
  }, []);
};

export default useFirebaseMessaging;
