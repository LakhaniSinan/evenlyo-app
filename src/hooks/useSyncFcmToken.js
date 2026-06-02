import AsyncStorage from '@react-native-async-storage/async-storage';
import {useEffect, useRef} from 'react';
import {AppState} from 'react-native';
import {useSelector} from 'react-redux';
import {updateFcmToken} from '../services/Auth';
import {ensureFcmTokenForAuth} from '../utils/fcmToken';
import {getMessagingOrNull} from '../utils/firebaseMessagingSafe';

const resolveUserId = user => user?.id ?? user?._id ?? null;

/**
 * Keeps appFcm on the server in sync after login (permission granted late, token refresh, etc.)
 */
const useSyncFcmToken = () => {
  const user = useSelector(state => state.LoginSlice?.user);
  const userId = resolveUserId(user);
  const lastSyncedTokenRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const msg = getMessagingOrNull();

    const syncToken = async tokenOverride => {
      const storedToken = await AsyncStorage.getItem('token');
      if (!storedToken || cancelled) {
        return;
      }

      const token = tokenOverride || (await ensureFcmTokenForAuth());
      if (!token || cancelled) {
        return;
      }

      if (lastSyncedTokenRef.current === token) {
        return;
      }

      try {
        const res = await updateFcmToken({appFcm: token});
        if (res?.status !== 200) {
          console.log('FCM sync API failed:', res?.status, res?.data);
        } else {
          lastSyncedTokenRef.current = token;
          console.log('FCM token synced to server');
        }
      } catch (error) {
        console.log('FCM sync failed:', error?.message || error);
      }
    };

    syncToken();

    const onAppStateChange = nextState => {
      if (nextState === 'active') {
        syncToken();
      }
    };

    const appStateSub = AppState.addEventListener('change', onAppStateChange);

    if (!msg?.onTokenRefresh) {
      return () => {
        cancelled = true;
        appStateSub.remove();
      };
    }

    const unsubscribe = msg.onTokenRefresh(newToken => {
      lastSyncedTokenRef.current = null;
      syncToken(newToken);
    });

    return () => {
      cancelled = true;
      appStateSub.remove();
      unsubscribe();
    };
  }, [userId]);
};

export default useSyncFcmToken;
