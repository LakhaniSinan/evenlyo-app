import AsyncStorage from '@react-native-async-storage/async-storage';
import {combineReducers, configureStore} from '@reduxjs/toolkit';
import {thunk} from 'redux-thunk';
import LoginSlice, {setUserData} from './slice/auth';
import LanguageSlice from './slice/language';
import LocationSlice from './slice/location'; // 👈 add location slice

const rootReducer = combineReducers({
  LoginSlice: LoginSlice,
  LanguageSlice: LanguageSlice,
  LocationSlice: LocationSlice, // 👈 add here 
});

const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      thunk,
      serializableCheck: false,
    }),
});

const getUserData = async () => {
  let dataa = await AsyncStorage.getItem('userData');
  dataa = JSON.parse(dataa);
  store.dispatch(setUserData(dataa));
};

getUserData();

export default store;
