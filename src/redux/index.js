import AsyncStorage from '@react-native-async-storage/async-storage';
import {combineReducers, configureStore} from '@reduxjs/toolkit';
import {thunk} from 'redux-thunk';
import LoginSlice, {setUserData} from './slice/auth';
import CartSlice, {setCartData} from './slice/cart';
import LanguageSlice from './slice/language';
import LocationSlice from './slice/location';

const rootReducer = combineReducers({
  LoginSlice: LoginSlice,
  LanguageSlice: LanguageSlice,
  LocationSlice: LocationSlice,
  CartSlice: CartSlice,
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
const getUserCartData = async () => {
  let data = await AsyncStorage.getItem('cartData');
  if (data != null) {
    data = JSON.parse(data) || [];
    store.dispatch(setCartData(data));
  }
};

getUserCartData();
getUserData();

export default store;
