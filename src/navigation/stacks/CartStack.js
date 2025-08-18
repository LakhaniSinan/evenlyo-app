import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import CartScreen from '../../containers/client/app/CartScreen';
import ChatDetail from '../../containers/client/app/ChatDetail';
import Messages from '../../containers/client/app/Messages';

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

export default MessagesStack;
