import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import ChatDetail from '../../containers/client/app/ChatDetail';
import Home from '../../containers/client/app/Home';
import Messages from '../../containers/client/app/Messages';
import Notification from '../../containers/client/app/Notification';
import NotificationDetails from '../../containers/client/app/NotificationDetails';

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
        name="ChatDetail"
        component={ChatDetail}
        options={{
          title: 'Chat',
        }}
      />
    </Stack.Navigator>
  );
};

export default HomeStack;
