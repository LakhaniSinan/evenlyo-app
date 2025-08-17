import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import CustomTabBar from '../../components/customTabBar';
import HomeStack from './HomeStack';
import CalendarStack from './CalendarStack';
import MessagesStack from './CartStack';
import ProfileStack from './ProfileStack';

const Tab = createBottomTabNavigator();

const BottomTabStack = () => {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="Home">
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarStack}
        options={{ tabBarLabel: 'Calendar' }}
      />
      <Tab.Screen
        name="Messages"
        component={MessagesStack}
        options={{ tabBarLabel: 'Messages' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabStack;
