import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import BillingManagement from '../../containers/vendor/app/Billings';
import HelpAndSupport from '../../containers/vendor/app/HellpAndSupport';
import ProfileManagement from '../../containers/vendor/app/ProfileManagement';
import ProfileScreen from '../../containers/vendor/app/ProfileScreen';
import ResetPassword from '../../containers/vendor/app/ResetPasswordScreen';
import Settings from '../../containers/vendor/app/Settings';
import Notification from '../../containers/vendor/app/Notification';
import NotificationDetails from '../../containers/vendor/app/NotificationDetails';

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
        component={ProfileScreen}
        options={{
          title: 'ProfileScreen',
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
        name="ResetPassword"
        component={ResetPassword}
        options={{
          title: 'ResetPassword',
        }}
      />
      <Stack.Screen
        name="ProfileManagement"
        component={ProfileManagement}
        options={{
          title: 'ProfileManagement',
        }}
      />
      <Stack.Screen
        name="BillingManagement"
        component={BillingManagement}
        options={{
          title: 'BillingManagement',
        }}
      />
      <Stack.Screen
        name="HelpAndSupport"
        component={HelpAndSupport}
        options={{
          title: 'HelpAndSupport',
        }}
      />
      <Stack.Screen
        name="Notification"
        component={Notification}
        options={{
          title: 'Notification',
        }}
      />
      <Stack.Screen
        name="NotificationDetails"
        component={NotificationDetails}
        options={{
          title: 'NotificationDetails',
        }}
      />
    </Stack.Navigator>
  );
};

export default ProfileStack;
