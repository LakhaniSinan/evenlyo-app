import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import NotificationDetails from '../../containers/client/app/NotificationDetails';
import AnalyticsReport from '../../containers/vendor/app/AnalyticsScreen';
import Notification from '../../containers/vendor/app/Notification';

const Stack = createStackNavigator();

const AnalyticsStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="AnalyticsReport"
      screenOptions={{
        headerShown: false,
        cardStyle: {backgroundColor: '#FFFFFF'},
      }}>
      <Stack.Screen
        name="AnalyticsReport"
        component={AnalyticsReport}
        options={{
          title: 'AnalyticsReport',
        }}
      />
      <Stack.Screen
        name="NotificationDetails"
        component={NotificationDetails}
        options={{
          title: 'NotificationDetails',
        }}
      />
      <Stack.Screen
        name="Notifications"
        component={Notification}
        options={{
          title: 'Notifications',
        }}
      />
    </Stack.Navigator>
  );
};

export default AnalyticsStack;
