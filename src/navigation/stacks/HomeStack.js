import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import Home from '../../containers/client/app/Home';

const Stack = createStackNavigator();

const HomeStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="HomeScreen"
      screenOptions={{
        headerShown: false,
        cardStyle: {backgroundColor: '#FFFFFF'},
      }}>
      <Stack.Screen
        name="HomeScreen"
        component={Home}
        options={{
          title: 'Home',
        }}
      />
    </Stack.Navigator>
  );
};

export default HomeStack;
