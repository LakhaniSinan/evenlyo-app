// helper.js

import {Platform} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import {check, PERMISSIONS} from 'react-native-permissions';

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

  async getCurrentLocation() {
    console.log('📍 getCurrentLocation called');
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        position => {
          console.log('✅ Location fetched:', position);
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
};
