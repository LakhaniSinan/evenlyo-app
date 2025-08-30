import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import EventDetails from '../../containers/vendor/app/EventDetails';
import EventListingScreen from '../../containers/vendor/app/EventListingScreen';

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
    </Stack.Navigator>
  );
};

export default EventListStack;
