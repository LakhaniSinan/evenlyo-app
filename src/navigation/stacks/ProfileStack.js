import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import PersonalInfo from '../../containers/client/app/personalInfo';
import Profile from '../../containers/client/app/Profile';
import Settings from '../../containers/client/app/Settings';
import HelpAndSupport from '../../containers/client/app/HellpAndSupport';

const Stack = createStackNavigator();

const ProfileStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="ProfileScreen"
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen
        name="ProfileScreen"
        component={Profile}
        options={{
          title: 'Profile',
        }}
      />
      <Stack.Screen
        name="personalInfo"
        component={PersonalInfo}
        options={{
          title: 'Profile',
        }}
      />
      <Stack.Screen
        name="Settings"
        component={Settings}
        options={{
          title: 'Settings',
        }}
      />
      <Stack.Screen
        name="HelpAndSupport"
        component={HelpAndSupport}
        options={{
          title: 'Help & Support',
        }}
      />
    </Stack.Navigator>
  );
};

export default ProfileStack;
