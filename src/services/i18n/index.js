import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

import translations from '../../locales';

const LANGUAGE_DETECTOR = {
  type: 'languageDetector',
  async: true,
  detect: async callback => {
    const savedLanguage = await AsyncStorage.getItem('@app_language');
    if (savedLanguage) {
      return callback(savedLanguage);
    }

    // Default to Dutch when no saved preference
    return callback('nl');
  },
  init: () => {},
  cacheUserLanguage: async language => {
    await AsyncStorage.setItem('@app_language', language);
  },
};

i18n
  .use(LANGUAGE_DETECTOR)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: translations.en,
      },
      nl: {
        translation: translations.nl,
      },
    },
    fallbackLng: 'nl',
    debug: __DEV__,

    interpolation: {
      escapeValue: false,
    },

    react: {
      useSuspense: false,
    },
  });

export default i18n;
