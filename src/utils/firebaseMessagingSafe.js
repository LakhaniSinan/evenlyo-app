import {getApps} from '@react-native-firebase/app';
import messaging from '@react-native-firebase/messaging';

/**
 * Default Firebase app exists only after native config (GoogleService-Info.plist on iOS,
 * google-services.json on Android). Without it, messaging() throws.
 */
export function isFirebaseMessagingAvailable() {
  try {
    return getApps().length > 0;
  } catch {
    return false;
  }
}

/** @returns {ReturnType<typeof messaging> | null} */
export function getMessagingOrNull() {
  if (!isFirebaseMessagingAvailable()) {
    return null;
  }
  try {
    return messaging();
  } catch {
    return null;
  }
}
