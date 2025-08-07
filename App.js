import React from 'react';
import { StatusBar } from 'react-native';
import { Provider } from 'react-redux';
import store from './src/store';
import AppNavigator from './src/navigation';
import AuthStack from './src/navigation/stacks/AuthStack';
import AppStack from './src/navigation/stacks/AppStack';

const App = () => {

  return (
    <Provider store={store}>
      <StatusBar barStyle="dark-content" translucent={false} />
      <AppNavigator />
    </Provider>
  );
};

export default App;
