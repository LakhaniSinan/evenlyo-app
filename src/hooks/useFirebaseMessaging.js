import notifee, {EventType} from '@notifee/react-native';
import {useEffect} from 'react';
import {displayPushNotification} from '../utils/displayNotification';
import {getMessagingOrNull} from '../utils/firebaseMessagingSafe';
import {navigateFromNotificationData} from '../utils/notificationNavigation';
import useNotifications from './notifications';
import useVendorNotifications from './vendorNotification';

const handleOpenedNotification = remoteMessage => {
  const data = remoteMessage?.data || {};
  navigateFromNotificationData(data);
};

const useFirebaseMessaging = () => {
  const {fetchNotifications} = useNotifications();
  const {fetchVendorNotifications} = useVendorNotifications();
  useEffect(() => {
    const msg = getMessagingOrNull();
    if (!msg) {
      return undefined;
    }

    msg
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          handleOpenedNotification(remoteMessage);
          fetchNotifications();
          fetchVendorNotifications();
        }
      })
      .catch(console.error);

    notifee
      .getInitialNotification()
      .then(initialNotification => {
        if (initialNotification?.notification?.data) {
          navigateFromNotificationData(initialNotification.notification.data);
        }
      })
      .catch(console.error);

    const unsubscribeOpened = msg.onNotificationOpenedApp(remoteMessage => {
      handleOpenedNotification(remoteMessage);
      fetchNotifications();
      fetchVendorNotifications();
    });

    const unsubscribeForeground = msg.onMessage(async remoteMessage => {
      const notification = remoteMessage.notification || {};
      const data = remoteMessage.data || {};
      const title = notification.title || data.title || 'Evenlyo';
      const body =
        notification.body || data.body || data.message || 'New notification';

      try {
        await displayPushNotification({title, body, data});
        await fetchNotifications();
        await fetchVendorNotifications();
      } catch (error) {
        console.log('displayPushNotification error:', error);
      }
    });

    const unsubscribeNotifeeForeground = notifee.onForegroundEvent(
      ({type, detail}) => {
        if (type === EventType.PRESS) {
          navigateFromNotificationData(detail?.notification?.data);
        }
      },
    );

    return () => {
      unsubscribeOpened();
      unsubscribeForeground();
      unsubscribeNotifeeForeground();
    };
  }, []);
};

export default useFirebaseMessaging;
