import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

import AuthStack from './stacks/AuthStack';

const Stack = createStackNavigator();

const AppNavigator = () => {
  // This would come from your Redux store

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name="Auth" component={AuthStack} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
