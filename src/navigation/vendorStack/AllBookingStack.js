import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import AllBookingScreen from '../../containers/vendor/app/AllBookingScreen';
import BookingDetails from '../../containers/vendor/app/BookingDetails';
import BookingHistory from '../../containers/vendor/app/BookingHistory';
import Messages from '../../containers/vendor/app/Messages';
import Notification from '../../containers/vendor/app/Notification';
import NotificationDetails from '../../containers/vendor/app/NotificationDetails';
import TrackingBookingDetails from '../../containers/vendor/app/TrackBooking';

const Stack = createStackNavigator();

const AllBookingStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="AllBookingScreen"
      screenOptions={{
        headerShown: false,
        cardStyle: {backgroundColor: '#FFFFFF'},
      }}>
      <Stack.Screen
        name="AllBookingScreen"
        component={AllBookingScreen}
        options={{
          title: 'AllBookingScreen',
        }}
      />
      <Stack.Screen
        name="BookingHistory"
        component={BookingHistory}
        options={{
          title: 'BookingHistory',
        }}
      />
      <Stack.Screen
        name="BookingDetails"
        component={BookingDetails}
        options={{
          title: 'BookingDetails',
        }}
      />
      <Stack.Screen
        name="TrackingBookingDetails"
        component={TrackingBookingDetails}
        options={{
          title: 'TrackingBookingDetails',
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
        name="Messages"
        component={Messages}
        options={{
          title: 'Messages',
        }}
      />
    </Stack.Navigator>
  );
};

export default AllBookingStack;
