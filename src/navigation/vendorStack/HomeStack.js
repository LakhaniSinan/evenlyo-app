import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import Dashboard from '../../containers/vendor/app/Dashboard';
import Notification from '../../containers/vendor/app/Notification';
import NotificationDetails from '../../containers/client/app/NotificationDetails';
import AnalyticsReport from '../../containers/vendor/app/AnalyticsScreen';

const Stack = createStackNavigator();

const HomeStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        headerShown: false,
        cardStyle: {backgroundColor: '#FFFFFF'},
      }}>
      <Stack.Screen
        name="Dashboard"
        component={Dashboard}
        options={{
          title: 'Dashboard',
        }}
      />
      <Stack.Screen
        name="Notifications"
        component={Notification}
        options={{
          title: 'Notifications',
        }}
      />
      <Stack.Screen
        name="AnalyticsReport"
        component={AnalyticsReport}
        options={{
          title: 'AnalyticsReport',
        }}
      />
    </Stack.Navigator>
  );
};

export default HomeStack;
