import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import Bookings from '../../containers/client/app/Booking';
import VendorDetails from '../../containers/client/app/VendorDetails';
import Messages from '../../containers/client/app/Messages';
import ChatDetail from '../../containers/client/app/ChatDetail';
import BookingDetails from '../../containers/client/app/BookingDetails';

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
        name="BookingDetails"
        component={BookingDetails}
        options={{
          title: 'Calendar',
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
        name="ChatDetail"
        component={ChatDetail}
        options={{
          title: 'Chat',
        }}
      />
      <Stack.Screen
        name="VendorDetails"
        component={VendorDetails}
        options={{
          title: 'Vendor Details',
        }}
      />
    </Stack.Navigator>
  );
};

export default CalendarStack;
