import React, {useEffect} from 'react';
import {Platform, SafeAreaView, StatusBar} from 'react-native';
import {Provider as PaperProvider} from 'react-native-paper';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Provider, useDispatch} from 'react-redux';
import LocationInitializer from './src/components/LocationInitializer';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import useNotifications from './src/hooks/notifications';
import AppNavigator from './src/navigation';
import store from './src/redux';
import {initializeLanguageFromStorage} from './src/redux/slice/language';
import './src/services/i18n';

const AppContent = () => {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const {fetchNotifications} = useNotifications();

  useEffect(() => {
    dispatch(initializeLanguageFromStorage());
    fetchNotifications();
    // Initialize Google Signin
    try {
      GoogleSignin.configure({
        webClientId: '800391339545-djf87tvnfk7asv6rq303nrmet07seacf.apps.googleusercontent.com',
        offlineAccess: true,
      });
      console.log('GoogleSignin configured');
    } catch (e) {
      console.log('GoogleSignin init error', e);
    }
  }, [dispatch, fetchNotifications]);

  return (
    <SafeAreaView
      style={{flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom}}>
      <StatusBar
        barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'}
        translucent
        backgroundColor="transparent"
      />
      <LocationInitializer />
      <AppNavigator />
    </SafeAreaView>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <PaperProvider>
        <AppContent />
      </PaperProvider>
    </Provider>
  );
};

export default App;
