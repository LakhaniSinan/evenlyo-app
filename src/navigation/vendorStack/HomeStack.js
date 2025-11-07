import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import AllRecentBookings from '../../containers/vendor/app/AllRecentBookings';
import AllRecentClients from '../../containers/vendor/app/AllRecentClients';
import AnalyticsReport from '../../containers/vendor/app/AnalyticsScreen';
import Dashboard from '../../containers/vendor/app/Dashboard';
import Messages from '../../containers/vendor/app/Messages';
import Notification from '../../containers/vendor/app/Notification';
import NotificationDetails from '../../containers/vendor/app/NotificationDetails';
import BookingDetails from '../../containers/vendor/app/BookingDetails';
import TrackingBookingDetails from '../../containers/vendor/app/TrackBooking';
import AllActivityLog from '../../containers/vendor/app/AllActivityLog';

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
        name="AllActivityLog"
        component={AllActivityLog}
        options={{
          title: 'AllActivityLog',
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
        name="BookingDetails"
        component={BookingDetails}
        options={{
          title: 'BookingDetails',
        }}
      />
      <Stack.Screen
        name="AllRecentBookings"
        component={AllRecentBookings}
        options={{
          title: 'AllRecentBookings',
        }}
      />
      <Stack.Screen
        name="AllRecentClients"
        component={AllRecentClients}
        options={{
          title: 'AllRecentClients',
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

export default HomeStack;
