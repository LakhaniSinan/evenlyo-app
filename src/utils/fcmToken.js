import {helper} from '../helper';

/**
 * Resolves an FCM token for auth APIs (login). Retries on iOS while APNs registers.
 * @returns {Promise<string|null>}
 */
export async function ensureFcmTokenForAuth() {
  await helper.requestNotificationPermission();
  return helper.getFCMTokenWithRetry();
}
