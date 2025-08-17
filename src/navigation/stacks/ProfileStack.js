import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import Profile from '../../containers/client/app/Profile';
import PersonalInfo from '../../containers/client/app/personalInfo';

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
      {/* Add more Profile-related screens here */}
    </Stack.Navigator>
  );
};

export default ProfileStack;
