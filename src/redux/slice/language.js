import {createSlice} from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../../services/i18n';

const initialState = {
  currentLanguage: 'nl',
  availableLanguages: [
    {code: 'nl', name: 'Dutch', nativeName: 'Nederlands'},
    {code: 'en', name: 'English', nativeName: 'English'},
  ],
};

const languageSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {
    setLanguage: (state, action) => {
      state.currentLanguage = action.payload;
    },
    initializeLanguage: (state, action) => {
      state.currentLanguage = action.payload;
    },
  },
});

export const {setLanguage, initializeLanguage} = languageSlice.actions;

// Thunk to change language
export const changeLanguage = (languageCode) => async (dispatch) => {
  try {
    // Save to AsyncStorage
    await AsyncStorage.setItem('@app_language', languageCode);

    // Update i18n
    await i18n.changeLanguage(languageCode);

    // Update Redux state
    dispatch(setLanguage(languageCode));
  } catch (error) {
    console.error('Error changing language:', error);
  }
};

// Thunk to initialize language from storage
export const initializeLanguageFromStorage = () => async (dispatch) => {
  try {
    const savedLanguage = await AsyncStorage.getItem('@app_language');
    const language = savedLanguage || 'nl';
    await i18n.changeLanguage(language);
    dispatch(initializeLanguage(language));
  } catch (error) {
    console.error('Error initializing language:', error);
  }
};

export default languageSlice.reducer;
