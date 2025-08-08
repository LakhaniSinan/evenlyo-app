import React, {useEffect} from 'react';
import { StatusBar } from 'react-native';
import { Provider, useDispatch } from 'react-redux';
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
    <>
      <StatusBar barStyle="dark-content" translucent={false} />
      <AppNavigator />
    </>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
};

export default App;
