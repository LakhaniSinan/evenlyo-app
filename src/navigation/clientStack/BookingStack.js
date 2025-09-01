import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import Bookings from '../../containers/client/app/Booking';
import BookingDetails from '../../containers/client/app/BookingDetails';
import Messages from '../../containers/client/app/Messages';
import TrackDirections from '../../containers/client/app/TrackDirections';
import Notification from '../../containers/client/app/Notification';
import NotificationDetails from '../../containers/client/app/NotificationDetails';

const Stack = createStackNavigator();

const CalendarStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="CalendarScreen"
      screenOptions={{
        headerShown: false,
        cardStyle: {backgroundColor: '#FFFFFF'},
      }}>
      <Stack.Screen
        name="CalendarScreen"
        component={Bookings}
        options={{
          title: 'Calendar',
        }}
      />
      <Stack.Screen
        name="TrackDirections"
        component={TrackDirections}
        options={{
          title: 'Calendar',
        }}
      />
      <Stack.Screen
        name="BookingDetails"
        component={BookingDetails}
        options={{
          title: 'Calendar',
        }}
      />
      <Stack.Screen
        name="MessagesScreen"
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
    </Stack.Navigator>
  );
};

export default CalendarStack;
