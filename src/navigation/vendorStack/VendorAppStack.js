import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import ChatDetail from '../../containers/client/app/ChatDetail';
import CustomerDrawer from './drawer';

const Stack = createStackNavigator();

const VendorAppStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="MainTabs"
      screenOptions={{
        headerShown: false,
        cardStyle: {backgroundColor: '#FFFFFF'},
      }}>
      <Stack.Screen name="MainTabs" component={CustomerDrawer} />
      <Stack.Screen name="ChatDetail" component={ChatDetail} />
    </Stack.Navigator>
  );
};

export default VendorAppStack;
