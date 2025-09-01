import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import ChatDetail from '../../containers/client/app/ChatDetail';
import CustomerDrawer from './drawer';
import AnalyticsReport from '../../containers/vendor/app/AnalyticsScreen';

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
      <Stack.Screen
        name="AnalyticsReport"
        component={AnalyticsReport}
        options={{
          title: 'AnalyticsReport',
        }}
      />
    </Stack.Navigator>
  );
};

export default VendorAppStack;
