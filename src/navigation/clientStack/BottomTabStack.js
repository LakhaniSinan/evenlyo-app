import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import React from 'react';
import {Image} from 'react-native';
import {TAB_BAR_ICONS} from '../../assets';
import CalendarStack from './BookingStack';
import MessagesStack from './CartStack';
import HomeStack from './HomeStack';
import ProfileStack from './ProfileStack';

const Tab = createBottomTabNavigator();

const BottomTabStack = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          height: 50,
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

      <Tab.Screen
        name="Calendar"
        component={CalendarStack}
        options={{
          tabBarIcon: ({focused}) => (
            <Image
              source={
                focused
                  ? TAB_BAR_ICONS.calendar
                  : TAB_BAR_ICONS.inActiveCalendar
              }
              style={{
                width: 27,
                height: 27,
                resizeMode: 'contain',
              }}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Messages"
        component={MessagesStack}
        options={{
          tabBarIcon: ({focused}) => (
            <Image
              source={
                focused
                  ? TAB_BAR_ICONS.messages
                  : TAB_BAR_ICONS.inActiveCessages
              }
              style={{
                width: 27,
                height: 27,
                resizeMode: 'contain',
              }}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          tabBarIcon: ({focused}) => (
            <Image
              source={
                focused ? TAB_BAR_ICONS.profile : TAB_BAR_ICONS.inActiveProfile
              }
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

export default BottomTabStack;
