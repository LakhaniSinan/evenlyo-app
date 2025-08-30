import React, {useEffect} from 'react';
import {SafeAreaView, StatusBar} from 'react-native';
import {Provider, useDispatch} from 'react-redux';
import {Provider as PaperProvider} from 'react-native-paper';
import store from './src/redux';
import AppNavigator from './src/navigation';
import './src/services/i18n'; // Initialize i18n
import {initializeLanguageFromStorage} from './src/redux/slice/language';

const AppContent = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    // Initialize language from storage when app starts
    dispatch(initializeLanguageFromStorage());
  }, [dispatch]);
  return (
    <SafeAreaView style={{flex: 1}}>
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
