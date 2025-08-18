import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import Home from '../../containers/client/app/Home';
import Notification from '../../containers/client/app/Notification';
import Messages from '../../containers/client/app/Messages';
import ChatDetail from '../../containers/client/app/ChatDetail';

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
