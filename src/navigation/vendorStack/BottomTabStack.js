import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import React from 'react';
import {Image} from 'react-native';
import {TAB_BAR_ICONS} from '../../assets';
import HomeStack from './HomeStack';

const Tab = createBottomTabNavigator();

const VendorBottomTabStack = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          paddingBottom: 10,
          paddingTop: 10,
          backgroundColor: '#FFFFFF',
        },
      }}
      initialRouteName="Home">
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          tabBarIcon: ({focused}) => (
            <Image
              source={focused ? TAB_BAR_ICONS.home : TAB_BAR_ICONS.inActiveHome}
              style={{
                width: 27,
                height: 27,
                resizeMode: 'contain',
              }}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default VendorBottomTabStack;
