import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import CartScreen from '../../containers/client/app/CartScreen';
import Messages from '../../containers/client/app/Messages';
import TrackingDetails from '../../containers/client/app/TrackingDetails';
import TrackDirections from '../../containers/client/app/TrackDirections';
import Notification from '../../containers/client/app/Notification';

const Stack = createStackNavigator();

const MessagesStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="CartScreen"
      screenOptions={{
        headerShown: false,
        cardStyle: {backgroundColor: '#FFFFFF'},
      }}>
      <Stack.Screen
        name="CartScreen"
        component={CartScreen}
        options={{
          title: 'CartScreen',
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
          title: 'Calendar',
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

export default MessagesStack;
