import React, {useEffect} from 'react';
import {SafeAreaView, StatusBar} from 'react-native';
import {Provider as PaperProvider} from 'react-native-paper';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Provider, useDispatch} from 'react-redux';
import AppNavigator from './src/navigation';
import store from './src/redux';
import {initializeLanguageFromStorage} from './src/redux/slice/language';
import './src/services/i18n'; // Initialize i18n

const AppContent = () => {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  useEffect(() => {
    // Initialize language from storage when app starts
    dispatch(initializeLanguageFromStorage());
  }, [dispatch]);
  return (
    <SafeAreaView
      style={{flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom}}>
      <StatusBar barStyle="dark-content" translucent={true} />
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
