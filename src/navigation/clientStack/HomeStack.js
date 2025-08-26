import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import EventDetails from '../../containers/client/app/EventDetails';
import EventListingScreen from '../../containers/client/app/EventListingScreen';
import Home from '../../containers/client/app/Home';
import Messages from '../../containers/client/app/Messages';
import Notification from '../../containers/client/app/Notification';
import NotificationDetails from '../../containers/client/app/NotificationDetails';
import TrackDirections from '../../containers/client/app/TrackDirections';
import TrackingDetails from '../../containers/client/app/TrackingDetails';

const Stack = createStackNavigator();

const HomeStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="HomeScreen"
      screenOptions={{
        headerShown: false,
        cardStyle: {backgroundColor: '#FFFFFF'},
      }}>
      <Stack.Screen
        name="HomeScreen"
        component={Home}
        options={{
          title: 'Home',
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
          title: 'Notification Details',
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
        name="EventListingScreen"
        component={EventListingScreen}
        options={{
          title: 'Event Listing',
        }}
      />
      <Stack.Screen
        name="EventDetails"
        component={EventDetails}
        options={{
          title: 'Event Listing',
        }}
      />
      <Stack.Screen
        name="TrackingDetails"
        component={TrackingDetails}
        options={{
          title: 'Tracking Details',
        }}
      />
      <Stack.Screen
        name="TrackDirections"
        component={TrackDirections}
        options={{
          title: 'Track Directions',
        }}
      />
    </Stack.Navigator>
  );
};

export default HomeStack;
