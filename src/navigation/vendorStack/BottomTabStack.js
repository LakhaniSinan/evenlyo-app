import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import React from 'react';
import {Easing, Image} from 'react-native';
import {TAB_BAR_ICONS} from '../../assets';
import AllBookingStack from './AllBookingStack';
import EventListStack from './EventListStack';
import HomeStack from './HomeStack';
import ProfileStack from './ProfileStack';

const Tab = createBottomTabNavigator();

const VendorBottomTabStack = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          height: 50,
          paddingBottom: 10,
          paddingTop: 10,
          backgroundColor: '#FFF',
          elevation: 0,
        },
      }}
      initialRouteName="Home">
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          transitionSpec: {
            animation: 'timing',
            config: {
              duration: 150,
              easing: Easing.inOut(Easing.ease),
            },
          },
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
        name="EventList"
        component={EventListStack}
        options={{
          tabBarIcon: ({focused}) => (
            <Image
              source={
                focused
                  ? TAB_BAR_ICONS.activeListIcon
                  : TAB_BAR_ICONS.inActiveListIcon
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
        name="AllBookingStack"
        component={AllBookingStack}
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

export default VendorBottomTabStack;
