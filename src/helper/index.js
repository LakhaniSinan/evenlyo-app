// helper.js

import messaging from '@react-native-firebase/messaging';
import axios from 'axios';
import {PermissionsAndroid, Platform} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import {check, PERMISSIONS} from 'react-native-permissions';
import {ICONS} from '../assets';
import {notifications} from '../constants/Variable';

// ✅ Your Cloudinary Config
const CLOUD_NAME = 'dv0imczul';
const UPLOAD_PRESET = 'Evenlyo';

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
        const authStatus = await messaging().requestPermission();
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

  async getFCMToken() {
    try {
      // iOS ke liye required
      await messaging().registerDeviceForRemoteMessages();

      const fcmToken = await messaging().getToken();

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

  async notificationCall(titleee, bodyyy, handlePress) {
    return notifications?.popup?.show({
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
  },
};
