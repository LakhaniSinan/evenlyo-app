import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {handleURLCallback, StripeProvider} from '@stripe/stripe-react-native';
import React, {useEffect, useRef} from 'react';
import {Linking, Platform, StatusBar} from 'react-native';
import 'react-native-gesture-handler';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {Provider as PaperProvider} from 'react-native-paper';
import NotificationPopup from 'react-native-push-notification-popup';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import {Provider, useDispatch} from 'react-redux';
import LocationInitializer from './src/components/LocationInitializer';
import {STRIPE_PUBLISHABLE_KEYS, STRIPE_URL_SCHEME} from './src/config/server';
import {notifications} from './src/constants/Variable';
import {SocketProvider} from './src/context';
import {helper} from './src/helper';
import useNotifications from './src/hooks/notifications';
import useFirebaseMessaging from './src/hooks/useFirebaseMessaging';
import useSyncFcmToken from './src/hooks/useSyncFcmToken';
import AppNavigator from './src/navigation';
import store from './src/redux';
import {initializeLanguageFromStorage} from './src/redux/slice/language';
import './src/services/i18n';
import {preloadVectorIcons} from './src/utils/preloadVectorIcons';
import useVendorNotifications from './src/hooks/vendorNotification';

const AppContent = () => {
  const dispatch = useDispatch();
  const {fetchNotifications} = useNotifications();
  const {fetchVendorNotifications} = useVendorNotifications();

  const notificationPopupRef = useRef(null);
  useFirebaseMessaging();
  useSyncFcmToken();

  useEffect(() => {
    notifications.popup = notificationPopupRef.current;
    return () => {
      notifications.popup = null;
    };
  }, []);

  useEffect(() => {
    preloadVectorIcons();
  }, []);

  useEffect(() => {
    Linking.getInitialURL().then(url => {
      console.log('INITIAL URL:', url);
      if (url) handleURLCallback(url);
    });

    const subscription = Linking.addEventListener('url', ({url}) => {
      console.log('DEEPLINK RECEIVED:', url);
      handleURLCallback(url);
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    helper.requestNotificationPermission().catch(() => {});
    dispatch(initializeLanguageFromStorage());
    fetchNotifications();
    fetchVendorNotifications();
    // Initialize Google Signin
    try {
      GoogleSignin.configure({
        webClientId:
          '800391339545-djf87tvnfk7asv6rq303nrmet07seacf.apps.googleusercontent.com',
        offlineAccess: true,
      });
      console.log('GoogleSignin configured');
    } catch (e) {
      console.log('GoogleSignin init error', e);
    }
  }, [dispatch, fetchNotifications]);

  return (
    <SafeAreaView style={{flex: 1}} edges={['top', 'right', 'left', 'bottom']}>
      <StatusBar
        barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'}
        translucent={Platform.OS === 'android'}
        backgroundColor="transparent"
      />
      <LocationInitializer />
      <AppNavigator />
      <NotificationPopup ref={notificationPopupRef} />
    </SafeAreaView>
  );
};

const App = () => {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaProvider>
        <Provider store={store}>
          <SocketProvider>
            <PaperProvider>
              <StripeProvider
                publishableKey={STRIPE_PUBLISHABLE_KEYS.TEST}
                urlScheme="com.evenlyo">
                <AppContent />
              </StripeProvider>
            </PaperProvider>
          </SocketProvider>
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
