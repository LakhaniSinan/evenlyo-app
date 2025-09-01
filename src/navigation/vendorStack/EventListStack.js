import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import EventDetails from '../../containers/vendor/app/EventDetails';
import EventListingScreen from '../../containers/vendor/app/EventListingScreen';
import Messages from '../../containers/vendor/app/Messages';
import Notification from '../../containers/vendor/app/Notification';
import NotificationDetails from '../../containers/vendor/app/NotificationDetails';
import ChatDetails from '../../containers/vendor/app/ChatDetails';
import AnalyticsReport from '../../containers/vendor/app/AnalyticsScreen';

const Stack = createStackNavigator();

const EventListStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="EventListingScreen"
      screenOptions={{
        headerShown: false,
        cardStyle: {backgroundColor: '#FFFFFF'},
      }}>
      <Stack.Screen
        name="EventListingScreen"
        component={EventListingScreen}
        options={{
          title: 'EventListingScreen',
        }}
      />
      <Stack.Screen
        name="EventDetails"
        component={EventDetails}
        options={{
          title: 'EventDetails',
        }}
      />
      <Stack.Screen
        name="Messages"
        component={Messages}
        options={{
          title: 'Messages',
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
        name="NotificationDetails"
        component={NotificationDetails}
        options={{
          title: 'NotificationDetails',
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

export default EventListStack;
