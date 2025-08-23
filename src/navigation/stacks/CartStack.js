import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import CartScreen from '../../containers/client/app/CartScreen';
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
        name="MessagesScreen"
        component={Messages}
        options={{
          title: 'Messages',
        }}
      />
    </Stack.Navigator>
  );
};

export default MessagesStack;
