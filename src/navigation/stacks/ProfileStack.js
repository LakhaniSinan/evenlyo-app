import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import Profile from '../../containers/client/app/Profile';

const Stack = createStackNavigator();

const ProfileStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="ProfileScreen"
      screenOptions={{
        headerShown: false,
        cardStyle: {backgroundColor: '#FFFFFF'},
      }}>
      <Stack.Screen 
        name="ProfileScreen" 
        component={Profile}
        options={{
          title: 'Profile',
        }}
      />
      {/* Add more Profile-related screens here */}
    </Stack.Navigator>
  );
};

export default ProfileStack;
