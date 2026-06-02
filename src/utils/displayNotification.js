import {Platform} from 'react-native';
import notifee, {AndroidImportance} from '@notifee/react-native';

const CHANNEL_ID = 'evenlyo_general';

let channelReady = false;

async function ensureChannel() {
  if (channelReady || Platform.OS !== 'android') {
    return CHANNEL_ID;
  }
  await notifee.createChannel({
    id: CHANNEL_ID,
    name: 'General Notifications',
    importance: AndroidImportance.HIGH,
    sound: 'default',
    vibration: true,
  });
  channelReady = true;
  return CHANNEL_ID;
}

/**
 * Shows a system notification (tray). Required when app is in foreground on Android.
 */
export async function displayPushNotification({title, body, data = {}}) {
  const safeTitle = title || 'Evenlyo';
  const safeBody = body || 'New notification';

  if (Platform.OS === 'android') {
    const channelId = await ensureChannel();
    await notifee.displayNotification({
      title: safeTitle,
      body: safeBody,
      data,
      android: {
        channelId,
        smallIcon: 'ic_notification',
        pressAction: {id: 'default'},
        importance: AndroidImportance.HIGH,
      },
    });
    return;
  }

  await notifee.displayNotification({
    title: safeTitle,
    body: safeBody,
    data,
  });
}
