import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';

import {useSelector} from 'react-redux';
import AppStack from './stacks/AppStack';
import AuthStack from './stacks/AuthStack';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const {user} = useSelector(state => state.LoginSlice);
  return (
    <NavigationContainer>
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default AppNavigator;
