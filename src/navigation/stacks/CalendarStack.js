import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import Calendar from '../../containers/client/app/Calendar';
import TabsDemo from '../../containers/client/app/TabsDemo';
import VendorDetails from '../../containers/client/app/VendorDetails';

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
        component={Calendar}
        options={{
          title: 'Calendar',
        }}
      />
      <Stack.Screen
        name="VendorDetails"
        component={VendorDetails}
        options={{
          title: 'Vendor Details',
        }}
      />
      <Stack.Screen
        name="TabsDemo"
        component={TabsDemo}
        options={{
          title: 'Tabs Demo',
        }}
      />
    </Stack.Navigator>
  );
};

export default CalendarStack;
