import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import {getLocales} from 'react-native-localize';
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
    
    // If no saved language, use device language
    const deviceLanguages = getLocales();
    const deviceLanguage = deviceLanguages[0]?.languageCode || 'en';
    
    // Check if we support the device language
    const supportedLanguage = translations[deviceLanguage] ? deviceLanguage : 'en';
    return callback(supportedLanguage);
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
    fallbackLng: 'en',
    debug: __DEV__,
    
    interpolation: {
      escapeValue: false,
    },
    
    react: {
      useSuspense: false,
    },
  });

export default i18n;
