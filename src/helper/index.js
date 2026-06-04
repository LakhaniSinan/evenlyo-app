// helper.js

import messaging from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';
import axios from 'axios';
import {InteractionManager, PermissionsAndroid, Platform} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import {check, PERMISSIONS} from 'react-native-permissions';
import {ICONS} from '../assets';
import {notifications} from '../constants/Variable';
import {getMessagingOrNull} from '../utils/firebaseMessagingSafe';

// ✅ Your Cloudinary Config
const CLOUD_NAME = 'dv0imczul';
const UPLOAD_PRESET = 'Evenlyo';

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

export const helper = {
  async checkLocation() {
    if (Platform.OS == 'android') {
      return check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION).then(
        async status => {
          if (status == 'granted') {
            return 'granted';
          } else if (status == 'denied') {
            return 'denied';
          } else if (status == 'blocked') {
            return 'blocked';
          }
        },
      );
    } else {
      return await Geolocation.requestAuthorization('whenInUse')
        .then(async status => {
          if (status == 'granted') {
            return 'granted';
          } else if (status == 'denied') {
            return 'denied';
          } else if (status == 'blocked') {
            return 'blocked';
          }
        })
        .catch(err => {
          console.log(err, 'err');
        });
    }
  },

  async requestNotificationPermission() {
    try {
      // 🍎 iOS
      if (Platform.OS === 'ios') {
        const msg = getMessagingOrNull();
        if (!msg) {
          return 'denied';
        }

        await notifee.requestPermission();

        const authStatus = await msg.requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        return enabled ? 'granted' : 'denied';
      }

      // 🤖 Android (13+)
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );

        return granted === PermissionsAndroid.RESULTS.GRANTED
          ? 'granted'
          : granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN
          ? 'blocked'
          : 'denied';
      }

      // 🤖 Android < 13 (auto granted)
      return 'granted';
    } catch (error) {
      console.log('❌ Notification permission error:', error);
      return 'denied';
    }
  },

  async getFCMTokenWithRetry(maxAttempts = 6, delayMs = 800) {
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      const token = await this.getFCMToken();
      if (token) {
        return token;
      }
      if (Platform.OS !== 'ios' || attempt === maxAttempts) {
        break;
      }
      await sleep(delayMs);
    }
    return null;
  },

  async getFCMToken() {
    try {
      const msg = getMessagingOrNull();
      if (!msg) {
        if (Platform.OS === 'ios') {
          console.log(
            '❌ Firebase not configured on iOS. Add GoogleService-Info.plist from Firebase Console (bundle: com.evenlyoapp).',
          );
        }
        return null;
      }

      await msg.registerDeviceForRemoteMessages();

      if (Platform.OS === 'ios') {
        let apnsToken = await msg.getAPNSToken();
        let apnsAttempts = 0;
        while (!apnsToken && apnsAttempts < 12) {
          await sleep(500);
          apnsToken = await msg.getAPNSToken();
          apnsAttempts += 1;
        }
      }

      const fcmToken = await msg.getToken();

      console.log('🔥 FCM TOKEN:', fcmToken);
      return fcmToken;
    } catch (error) {
      console.log('❌ FCM token error:', error);
      return null;
    }
  },

  async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        position => {
          resolve(position);
        },
        error => {
          console.log('❌ Location error:', error);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        },
      );
    });
  },

  async getLocationAddress(lat, lng, googleKeyyyy) {
    return new Promise((resolve, reject) => {
      axios
        .get(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${googleKeyyyy}`,
        )
        .then(response => {
          const data = response.data;
          if (data.status === 'OK' && data.results.length > 0) {
            const location = data.results[0].formatted_address;
            resolve(location);
          } else {
            reject('Geocoding request failed.');
          }
        })
        .catch(error => {
          reject('Geocoding request failed.');
        });
    });
  },
  async uploadMediaToCloudinary(file) {
    if (!file || !file.uri || !file.type) {
      console.warn('Invalid file object');
      return null;
    }

    const isVideo = file.type.startsWith('video/');
    const resourceType = isVideo ? 'video' : 'image';

    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      type: file.type,
      name: file.fileName || `upload.${file.type.split('/')[1]}`,
    });
    formData.append('upload_preset', UPLOAD_PRESET);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`,
        {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Upload failed');
      }

      return data;
    } catch (error) {
      console.error('Cloudinary Upload Error:', error);
      return null;
    }
  },

  notificationCall(titleee, bodyyy, handlePress) {
    const popup = notifications?.popup;
    if (!popup?.show) {
      return;
    }

    // Defer: react-native-push-notification-popup triggers state updates during
    // useInsertionEffect on React 19 — causes "must not schedule updates" warning.
    InteractionManager.runAfterInteractions(() => {
      setTimeout(() => {
        popup.show({
          onPress: () => {
            if (handlePress) handlePress();
          },
          appIconSource: ICONS.logoIcon,
          appTitle: 'Evenlyo',
          timeText: 'Now',
          title: titleee,
          body: bodyyy,
          slideOutTime: 5000,
        });
      }, 0);
    });
  },
};
