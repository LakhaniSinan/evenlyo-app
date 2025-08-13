import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import CartScreen from '../../containers/client/app/CartScreen';

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
      {/* Add more Messages-related screens here */}
    </Stack.Navigator>
  );
};

export default MessagesStack;
