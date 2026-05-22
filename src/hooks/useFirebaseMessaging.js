import {useEffect} from 'react';
import {helper} from '../helper';
import {getMessagingOrNull} from '../utils/firebaseMessagingSafe';

const useFirebaseMessaging = () => {
  useEffect(() => {
    const msg = getMessagingOrNull();
    if (!msg) {
      return undefined;
    }

    msg.getInitialNotification().catch(console.error);

    const unsubscribeOpened = msg.onNotificationOpenedApp(() => {});

    const unsubscribeForeground = msg.onMessage(remoteMessage => {
      const {title, body} = remoteMessage.notification || {};
      helper.notificationCall(title, body, () => {});
    });

    return () => {
      unsubscribeOpened();
      unsubscribeForeground();
    };
  }, []);
};

export default useFirebaseMessaging;
