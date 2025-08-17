import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import Home from '../../containers/client/app/Home';
import HomeTestScreen from '../../containers/client/app/HomeTestScreen';
import LanguageDemo from '../../containers/client/app/LanguageDemo';
import ReviewsDemo from '../../containers/client/app/ReviewsDemo';
import Notification from '../../containers/client/app/Notification';

const Stack = createStackNavigator();

const HomeStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="HomeScreen"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#FFFFFF' },
      }}>
      <Stack.Screen
        name="HomeScreen"
        component={Home}
        options={{
          title: 'Home',
        }}
      />
      <Stack.Screen
        name="Notification"
        component={Notification}
        options={{
          title: 'Home',
        }}
      />
      <Stack.Screen
        name="LanguageDemo"
        component={LanguageDemo}
        options={{
          title: 'Language Demo',
        }}
      />
      <Stack.Screen
        name="ReviewsDemo"
        component={ReviewsDemo}
        options={{
          title: 'Reviews Demo',
        }}
      />
      <Stack.Screen
        name="HomeTestScreen"
        component={HomeTestScreen}
        options={{
          title: 'Home Test Screen',
        }}
      />
    </Stack.Navigator>
  );
};

export default HomeStack;
